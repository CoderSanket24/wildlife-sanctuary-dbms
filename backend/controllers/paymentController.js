import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { generateTicketPdf } from '../utils/ticketPdf.js';
import { sendEmail } from '../utils/mailer.js';
import { invalidateCache } from '../utils/cache.js';

/**
 * Returns an authenticated Razorpay SDK instance if keys are configured in environment
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret && key_id.trim() !== '' && key_secret.trim() !== '') {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

/**
 * POST /api/payment/create-order
 * Step 1: Creates an official Razorpay Order ID on Razorpay servers (or sandbox mock)
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { zone_id } = req.body;
    const parsedZoneId = parseInt(zone_id, 10);

    if (isNaN(parsedZoneId)) {
      return res.status(400).json({ success: false, error: 'Valid Zone ID is required.' });
    }

    const zone = await prisma.zone.findUnique({
      where: { zone_id: parsedZoneId }
    });

    if (!zone) {
      return res.status(404).json({ success: false, error: 'Sanctuary Zone does not exist.' });
    }

    // Dynamic tax calculation: Base Fare + 18% GST
    const basePrice = parseFloat(zone.ticket_price);
    const gst = +(basePrice * 0.18).toFixed(2);
    const total = +(basePrice + gst).toFixed(2);
    const amountInPaise = Math.round(total * 100);

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      // Create Order on Razorpay Cloud
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_z${zone.zone_id}`,
        notes: {
          zone_id: String(zone.zone_id),
          zone_name: zone.name,
          visitor_id: String(req.user.visitor_id),
          visitor_email: req.user.email
        }
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        is_live_razorpay: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        zone: {
          zone_id: zone.zone_id,
          name: zone.name,
          climate: zone.climate,
          ticket_price: basePrice,
          gst,
          total
        }
      });
    }

    // Developer Test Mock Fallback (if user hasn't added RAZORPAY_KEY_ID yet)
    const mockOrderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    return res.status(200).json({
      success: true,
      is_live_razorpay: false,
      order_id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key_id: 'rzp_test_placeholder',
      notice: 'Using built-in sandbox mock order. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for live Razorpay cloud keys.',
      zone: {
        zone_id: zone.zone_id,
        name: zone.name,
        climate: zone.climate,
        ticket_price: basePrice,
        gst,
        total
      }
    });
  } catch (error) {
    console.error('🔥 Razorpay Order Creation Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to initiate Razorpay order.' });
  }
};

/**
 * POST /api/payment/verify-and-book
 * Step 2: Verifies HMAC-SHA256 signature and executes atomic ACID booking with row locking
 */
export const verifyAndBookTicket = async (req, res) => {
  try {
    const visitor_id = req.user.visitor_id;
    const { zone_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const parsedZoneId = parseInt(zone_id, 10);

    if (isNaN(parsedZoneId)) {
      return res.status(400).json({ success: false, error: 'Valid Zone ID is required.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing Razorpay transaction identifiers.' });
    }

    // Cryptographic HMAC-SHA256 Signature Verification
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (key_secret && key_secret.trim() !== '') {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Security Alert: Cryptographic HMAC signature mismatch. Payment verification rejected.'
        });
      }
    }

    // Atomic Concurrency Locking: Execute PostgreSQL Stored Procedure with SELECT FOR UPDATE
    const result = await prisma.$queryRaw`
      SELECT fn_book_safari_ticket(${visitor_id}::INT, ${parsedZoneId}::INT) AS status
    `;

    const isSuccess = result[0]?.status;
    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        error: 'Transactional Failure: Safari booking ledger could not be finalized by database engine.'
      });
    }

    // Retrieve freshly committed ticket
    const activeTicket = await prisma.ticket.findFirst({
      where: {
        visitor_id: visitor_id,
        zone_id: parsedZoneId
      },
      orderBy: {
        booking_date: 'desc'
      },
      include: {
        zone: { select: { name: true, climate: true } },
        visitor: { select: { email: true, first_name: true, last_name: true } }
      }
    });

    if (!activeTicket) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve confirmed ticket ledger.' });
    }

    // Transport Layer: Broadcast real-time WebSocket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('new_ticket', activeTicket);
    }

    // Application Layer: Async PDF Pass Generation & Nodemailer MIME Dispatch
    if (activeTicket.visitor?.email) {
      (async () => {
        try {
          const pdfBuffer = await generateTicketPdf(activeTicket);
          sendEmail(
            activeTicket.visitor.email,
            `Ticket Confirmed: ${activeTicket.zone.name} Safari (Pass Attached)`,
            `Hi ${activeTicket.visitor.first_name},\n\nYour safari ticket for the ${activeTicket.zone.name} zone has been successfully booked via Razorpay!\n\nTransaction ID: ${razorpay_payment_id}\nOrder ID: ${razorpay_order_id}\nTotal Paid: ₹${activeTicket.total_amount}\nBooking Date: ${new Date(activeTicket.booking_date).toLocaleString()}\n\nYour official pass with scannable QR code is attached to this email as a PDF.\n\nThank you for supporting Abhayarnya Wildlife Sanctuary!`,
            [
              {
                filename: `Abhayarnya_Ticket_${activeTicket.ticket_id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          );
        } catch (pdfErr) {
          console.error('[Ticket PDF Generation Error]', pdfErr.message);
        }
      })();
    }

    // Purge cached stats & telemetry
    invalidateCache(['stats', 'zones', 'telemetry']);

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and safari ticket issued successfully.',
      ticket: {
        ...activeTicket,
        ticket_id: String(activeTicket.ticket_id),
        base_cost: parseFloat(activeTicket.base_cost),
        gst_amount: parseFloat(activeTicket.gst_amount),
        total_amount: parseFloat(activeTicket.total_amount),
        transaction_id: razorpay_payment_id,
        razorpay_order_id,
        payment_method: 'RAZORPAY',
        paid_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🔥 Razorpay Verification & Booking Error:', error);
    if (error.message.includes('Capacity Limit Reached')) {
      return res.status(409).json({
        success: false,
        error: error.message.split('ERROR:')[1]?.trim() || error.message
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Internal server error while securing ticket ledger.'
    });
  }
};
