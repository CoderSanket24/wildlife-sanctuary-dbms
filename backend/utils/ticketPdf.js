import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generate a QR Code buffer containing ticket verification metadata.
 * @param {Object} ticket
 * @returns {Promise<Buffer>}
 */
export const generateTicketQrCode = async (ticket) => {
  const qrPayload = JSON.stringify({
    app: 'Abhayarnya Wildlife Sanctuary DBMS',
    ticket_id: ticket.ticket_id.toString(),
    visitor: `${ticket.visitor?.first_name || ''} ${ticket.visitor?.last_name || ''}`.trim(),
    email: ticket.visitor?.email || '',
    zone: ticket.zone?.name || 'Safari Zone',
    total_amount: ticket.total_amount?.toString() || '0.00',
    booking_date: ticket.booking_date,
    status: ticket.status || 'CONFIRMED',
  });

  return QRCode.toBuffer(qrPayload, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 1,
    width: 140,
    color: {
      dark: '#0f291e',
      light: '#ffffff',
    },
  });
};

/**
 * Generate a professional branded PDF Safari E-Ticket buffer.
 * @param {Object} ticket - Ticket object with visitor and zone included
 * @returns {Promise<Buffer>}
 */
export const generateTicketPdf = async (ticket) => {
  return new Promise(async (resolve, reject) => {
    try {
      const qrBuffer = await generateTicketQrCode(ticket);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Safari Ticket #${ticket.ticket_id} - Abhayarnya Wildlife Sanctuary`,
          Author: 'Abhayarnya Wildlife Sanctuary DBMS',
          Subject: 'Official Safari Entry Pass & Receipt',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryGreen = '#0d2818';
      const limeAccent   = '#84cc16';
      const textMuted    = '#4b5563';
      const textDark     = '#111827';
      const borderGray   = '#e5e7eb';
      const cardBg       = '#f9fafb';

      // ── 1. Top Decorative Header Banner ──────────────────────────────────
      doc.rect(40, 40, 515, 80).fill(primaryGreen);
      doc.rect(40, 120, 515, 4).fill(limeAccent);

      // Title & Tagline inside banner
      doc.fillColor('#ffffff')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('ABHAYARNYA WILDLIFE SANCTUARY', 60, 55, { characterSpacing: 1 });

      doc.fillColor('#d9f99d')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('OFFICIAL SAFARI ENTRY PASS & TAX INVOICE', 60, 80, { characterSpacing: 2 });

      doc.fillColor('#a1a1aa')
         .fontSize(8)
         .font('Helvetica')
         .text('Computer Networks & Technologies (CNT) Verified Digital Pass', 60, 95);

      // ── 2. Pass Identifier & Status Pill ──────────────────────────────────
      let y = 145;

      doc.fillColor(textDark)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(`PASS IDENTIFIER: #TKT-${ticket.ticket_id}`, 40, y);

      const status = (ticket.status || 'CONFIRMED').toUpperCase();
      const statusColor = status === 'CHECKED_IN' ? '#2563eb' : '#16a34a';

      // Status pill box
      doc.roundedRect(420, y - 4, 135, 24, 4)
         .fillOpacity(0.12)
         .fill(statusColor)
         .fillOpacity(1.0);

      doc.fillColor(statusColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`STATUS: ${status}`, 425, y + 2, { width: 125, align: 'center' });

      // ── 3. Main Ticket Content Card (Two Columns) ─────────────────────────
      y = 185;
      doc.roundedRect(40, y, 515, 230, 8)
         .fillAndStroke(cardBg, borderGray);

      // Left Column: Visitor & Safari Details
      const colX = 60;
      let fieldY = y + 20;

      const renderField = (label, value) => {
        doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text(label.toUpperCase(), colX, fieldY);
        doc.fillColor(textDark).fontSize(11).font('Helvetica').text(value || '—', colX, fieldY + 11);
        fieldY += 34;
      };

      const visitorName = `${ticket.visitor?.first_name || ''} ${ticket.visitor?.last_name || ''}`.trim() || 'Valued Visitor';
      const bookingFormatted = ticket.booking_date 
        ? new Date(ticket.booking_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Confirmed';

      renderField('Visitor Name', visitorName);
      renderField('Registered Email', ticket.visitor?.email || 'N/A');
      renderField('Safari Zone', `${ticket.zone?.name || 'Sanctuary Zone'} (${ticket.zone?.climate || 'TROPICAL'})`);
      renderField('Booking Timestamp', bookingFormatted);
      renderField('Gate Entry Status', status === 'CHECKED_IN' ? `Checked-in (${new Date(ticket.checked_in_at || Date.now()).toLocaleTimeString()})` : 'Valid for Single Gate Entry');

      // Right Column: QR Code & Verification Box
      const qrX = 385;
      const qrY = y + 25;

      doc.image(qrBuffer, qrX, qrY, { width: 130, height: 130 });

      doc.fillColor(textDark)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('OFFICIAL GATE QR PASS', qrX - 10, qrY + 140, { width: 150, align: 'center' });

      doc.fillColor(textMuted)
         .fontSize(7.5)
         .font('Helvetica')
         .text('Present this QR code at the zone checkpoint for electronic validation.', qrX - 15, qrY + 155, { width: 160, align: 'center' });

      // ── 4. Financial & Tax Breakdown Table ────────────────────────────────
      y = 435;

      doc.roundedRect(40, y, 515, 110, 8)
         .fillAndStroke('#ffffff', borderGray);

      doc.fillColor(primaryGreen)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('PAYMENT SUMMARY & TAX INVOICE', 60, y + 16);

      const baseCost = Number(ticket.base_cost || 0).toFixed(2);
      const gstAmount = Number(ticket.gst_amount || 0).toFixed(2);
      const totalAmount = Number(ticket.total_amount || 0).toFixed(2);

      const row = (label, amount, isTotal = false) => {
        fieldY += 18;
        doc.fillColor(isTotal ? textDark : textMuted)
           .fontSize(isTotal ? 11 : 9)
           .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
           .text(label, 60, fieldY);

        doc.fillColor(isTotal ? '#15803d' : textDark)
           .fontSize(isTotal ? 12 : 9)
           .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
           .text(`INR ${amount}`, 440, fieldY, { width: 95, align: 'right' });
      };

      fieldY = y + 26;
      row('Safari Base Admission Fee', baseCost);
      row('GST (18% Statutory Wildlife Sanctuary Cess)', gstAmount);
      
      // Divider line
      fieldY += 16;
      doc.moveTo(60, fieldY).lineTo(535, fieldY).strokeColor(borderGray).stroke();
      
      row('TOTAL AMOUNT PAID', totalAmount, true);

      // ── 5. Guidelines & Terms Footer ─────────────────────────────────────
      y = 565;

      doc.roundedRect(40, y, 515, 85, 6)
         .fillAndStroke('#f0fdf4', '#bbf7d0');

      doc.fillColor('#166534')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('IMPORTANT SANCTUARY VISIT PROTOCOLS', 55, y + 12);

      doc.fillColor('#14532d')
         .fontSize(7.5)
         .font('Helvetica')
         .text('1. Please carry a valid government-issued photo ID that matches the visitor name on this e-ticket.\n' +
               '2. Respect wildlife boundaries: feeding, luring, or exiting safari vehicles is strictly prohibited.\n' +
               '3. This digital pass is electronically registered in the sanctuary DBMS ledger. Duplication or tampering will void admission.\n' +
               '4. Emergency Forest Ranger Dispatch & SOS Channel is available at all zone perimeter watchtowers.', 55, y + 26, { lineGap: 3 });

      // ── 6. Bottom Signature & Watermark ──────────────────────────────────
      doc.fillColor('#9ca3af')
         .fontSize(8)
         .font('Helvetica')
         .text('Abhayarnya Wildlife Sanctuary DBMS • Unit III: Application Layer (SMTP/MIME) & Cryptographic Verification', 40, 780, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
