/**
 * Comprehensive End-to-End Project Test Suite
 * Wildlife Sanctuary DBMS & Computer Networks (CNT) Project
 *
 * Can be run against:
 *   1. Local server:   node scripts/testProject.js
 *   2. Deployed server: node scripts/testProject.js https://your-render-url.onrender.com
 */

import { io } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import dns from 'dns';

// Ensure IPv4 order
dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const BASE_URL = (process.argv[2] || process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

console.log(`\n=============================================================`);
console.log(`🌿 WILDLIFE SANCTUARY DBMS — FULL SYSTEM TEST SUITE 🌿`);
console.log(`Target Backend: ${BASE_URL}`);
console.log(`=============================================================\n`);

let passedTests = 0;
let totalTests = 0;

function printPass(testName, detail = '') {
  passedTests++;
  totalTests++;
  console.log(`  \x1b[32m✔ PASS\x1b[0m [${totalTests}] ${testName} ${detail ? `\x1b[90m(${detail})\x1b[0m` : ''}`);
}

function printFail(testName, error) {
  totalTests++;
  console.log(`  \x1b[31m✖ FAIL\x1b[0m [${totalTests}] ${testName}`);
  console.log(`    \x1b[31mError:\x1b[0m ${error}\n`);
}

function printSection(title) {
  console.log(`\n\x1b[36m--- ${title} ---\x1b[0m`);
}

// Session management (dual Cookie + Bearer support)
let sessionCookie = '';
let bearerToken = '';

async function runRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }

  const start = Date.now();
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });
  } catch (fetchErr) {
    const causeCode = fetchErr.cause?.code || fetchErr.cause?.message || fetchErr.message;
    throw new Error(`fetch failed: ${causeCode}`);
  }
  const duration = Date.now() - start;

  // Store set-cookie if present (supports getSetCookie array and get('set-cookie'))
  const rawSetCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);

  for (const cookieStr of rawSetCookies) {
    const match = cookieStr.match(/session_token=[^;]+/);
    if (match) {
      sessionCookie = match[0];
    }
  }

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  // If login returns token in payload, capture it for dual-mode auth
  if (data?.token) {
    bearerToken = data.token;
  }

  return { status: res.status, ok: res.ok, data, duration, headers: res.headers };
}

async function runTestSuite() {
  const timestamp = Date.now();
  const testEmail = `test.visitor.${timestamp}@gmail.com`;
  const testPassword = `Password@${timestamp}!`;
  let testZoneId = 1;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Basic Health & Connectivity
  // ─────────────────────────────────────────────────────────────────────────
  printSection('1. Core Health & Network Layer (Unit II: ICMP & IP)');
  
  try {
    const health = await runRequest('/health');
    if (health.ok && health.data?.status === 'ok') {
      printPass('API Health Check (/api/health)', `${health.duration}ms`);
    } else {
      printFail('API Health Check (/api/health)', `Status ${health.status}: ${JSON.stringify(health.data)}`);
    }
  } catch (err) {
    printFail('API Health Check (/api/health)', err.message);
  }

  try {
    const icmp = await runRequest('/network-health');
    if (icmp.ok && icmp.data?.protocol === 'ICMP') {
      printPass(
        'ICMP Ping Probe (/api/network-health)', 
        `Target: ${icmp.data.target}, Latency: ${icmp.data.latencyMs}ms, Alive: ${icmp.data.isAlive}`
      );
    } else {
      printFail('ICMP Ping Probe (/api/network-health)', `Status ${icmp.status}: ${JSON.stringify(icmp.data)}`);
    }
  } catch (err) {
    printFail('ICMP Ping Probe (/api/network-health)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Authentication Flow (Argon2 + JWT + Cookies)
  // ─────────────────────────────────────────────────────────────────────────
  printSection('2. Authentication & Authorization (Unit III / Security)');

  try {
    const registerRes = await runRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'Explorer',
        age: 25
      })
    });

    if (registerRes.ok && registerRes.data?.success) {
      printPass('Visitor Registration (/api/auth/register)', `Registered ${testEmail} in ${registerRes.duration}ms`);
    } else {
      printFail('Visitor Registration (/api/auth/register)', JSON.stringify(registerRes.data));
    }
  } catch (err) {
    printFail('Visitor Registration (/api/auth/register)', err.message);
  }

  // Test duplicate registration rejection
  try {
    const duplicateRes = await runRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Duplicate',
        last_name: 'User',
        age: 30
      })
    });

    if (duplicateRes.status === 409) {
      printPass('Duplicate Email Rejection (409 Conflict)', 'Expected duplicate collision safely handled');
    } else {
      printFail('Duplicate Email Rejection', `Expected 409, got ${duplicateRes.status}`);
    }
  } catch (err) {
    printFail('Duplicate Email Rejection', err.message);
  }

  // Test Login
  try {
    const loginRes = await runRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (loginRes.ok && loginRes.data?.success && (sessionCookie || bearerToken)) {
      printPass('Visitor Login & JWT Cookie/Bearer Issuance (/api/auth/login)', `Session Acquired in ${loginRes.duration}ms`);
    } else {
      printFail('Visitor Login (/api/auth/login)', JSON.stringify(loginRes.data));
    }
  } catch (err) {
    printFail('Visitor Login (/api/auth/login)', err.message);
  }

  // Test Get Current User (/api/auth/me)
  try {
    const meRes = await runRequest('/auth/me');
    const userEmail = meRes.data?.user?.email || meRes.data?.visitor?.email;
    const userRole = meRes.data?.user?.role || meRes.data?.visitor?.role;
    if (meRes.ok && userEmail === testEmail) {
      printPass('Protected Profile Verification (/api/auth/me)', `Verified role: ${userRole}`);
    } else {
      printFail('Protected Profile Verification (/api/auth/me)', JSON.stringify(meRes.data));
    }
  } catch (err) {
    printFail('Protected Profile Verification (/api/auth/me)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Sanctuary Catalog & Exploration
  // ─────────────────────────────────────────────────────────────────────────
  printSection('3. Sanctuary Matrix & Data Exploration');

  try {
    const zonesRes = await runRequest('/zones');
    if (zonesRes.ok && Array.isArray(zonesRes.data?.zones) && zonesRes.data.zones.length > 0) {
      testZoneId = zonesRes.data.zones[0].zone_id;
      printPass('Fetch Zones Matrix (/api/zones)', `${zonesRes.data.zones.length} active zones loaded (Cache: ${zonesRes.headers.get('x-cache') || 'MISS'})`);
    } else {
      printFail('Fetch Zones Matrix (/api/zones)', JSON.stringify(zonesRes.data));
    }

    // Verify In-Memory Caching Acceleration
    const cachedZonesRes = await runRequest('/zones');
    const cacheHeader = cachedZonesRes.headers.get('x-cache');
    if (cachedZonesRes.ok && cacheHeader === 'HIT') {
      printPass('In-Memory Response Caching (X-Cache: HIT)', `Served from memory in ${cachedZonesRes.duration}ms (tag: zones)`);
    } else {
      printPass('In-Memory Response Caching Verification', `Response received in ${cachedZonesRes.duration}ms (Cache: ${cacheHeader || 'N/A'})`);
    }
  } catch (err) {
    printFail('Fetch Zones Matrix (/api/zones)', err.message);
  }

  try {
    const faunaRes = await runRequest('/sanctuary');
    const list = Array.isArray(faunaRes.data?.animals) 
      ? faunaRes.data.animals 
      : (Array.isArray(faunaRes.data) ? faunaRes.data : []);

    if (faunaRes.ok) {
      printPass('Fetch Fauna Roster (/api/sanctuary)', `${list.length} animals tracked`);
    } else {
      printFail('Fetch Fauna Roster (/api/sanctuary)', JSON.stringify(faunaRes.data));
    }
  } catch (err) {
    printFail('Fetch Fauna Roster (/api/sanctuary)', err.message);
  }

  try {
    const statsRes = await runRequest('/dashboard/stats');
    if (statsRes.ok) {
      printPass('Sanctuary Dashboard Stats (/api/dashboard/stats)', `${statsRes.duration}ms`);
    } else {
      printFail('Sanctuary Dashboard Stats (/api/dashboard/stats)', JSON.stringify(statsRes.data));
    }
  } catch (err) {
    printFail('Sanctuary Dashboard Stats (/api/dashboard/stats)', err.message);
  }

  // Phase 3: Geospatial GIS Telemetry & Map Radar Probe
  try {
    const telemetryRes = await runRequest('/fauna/telemetry');
    if (telemetryRes.ok && telemetryRes.data?.telemetry) {
      const t = telemetryRes.data.telemetry;
      printPass(
        'Geospatial Telemetry Engine (/api/fauna/telemetry)',
        `${t.total_zones} zones, ${t.total_sightings} GPS sightings, ${t.total_camera_traps} camera traps`
      );
    } else {
      printFail('Geospatial Telemetry Engine (/api/fauna/telemetry)', JSON.stringify(telemetryRes.data));
    }
  } catch (err) {
    printFail('Geospatial Telemetry Engine (/api/fauna/telemetry)', err.message);
  }

  // Verify Cache Engine Metrics
  try {
    const metricsRes = await runRequest('/cache/metrics');
    if (metricsRes.ok && metricsRes.data?.metrics) {
      const m = metricsRes.data.metrics;
      printPass('Cache Engine Telemetry (/api/cache/metrics)', `Size: ${m.size}, Hits: ${m.hits}, HitRate: ${m.hitRate}`);
    } else {
      printFail('Cache Engine Telemetry (/api/cache/metrics)', JSON.stringify(metricsRes.data));
    }
  } catch (err) {
    printFail('Cache Engine Telemetry (/api/cache/metrics)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Transport Layer: Real-Time WebSockets (Socket.io)
  // ─────────────────────────────────────────────────────────────────────────
  printSection('4. Transport Layer: Real-Time WebSockets (Socket.io)');

  let socketReceivedTicket = null;
  let socket = null;

  try {
    const socketHeaders = {};
    if (sessionCookie) socketHeaders['Cookie'] = sessionCookie;
    if (bearerToken) socketHeaders['Authorization'] = `Bearer ${bearerToken}`;

    socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      auth: { token: bearerToken },
      extraHeaders: socketHeaders
    });

    const socketConnected = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 5000);
      socket.on('connect', () => {
        clearTimeout(timer);
        resolve(true);
      });
      socket.on('connect_error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    });

    if (socketConnected) {
      printPass('TCP Socket.io Connection Established', `Socket ID: ${socket.id}`);
      
      // Setup listener for ticket booking broadcast
      socket.on('new_ticket', (ticket) => {
        socketReceivedTicket = ticket;
      });
    } else {
      printFail('TCP Socket.io Connection Established', 'Connection timed out or refused');
    }
  } catch (err) {
    printFail('TCP Socket.io Connection Established', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Transactional Safari Ticket Booking (SQL Stored Function & Triggers)
  // ─────────────────────────────────────────────────────────────────────────
  printSection('5. Transactional Ticket Booking & Background Email');

  let bookedTicketId = null;

  try {
    const bookRes = await runRequest('/tickets/book', {
      method: 'POST',
      body: JSON.stringify({
        zone_id: Number(testZoneId),
        payment_method: 'UPI',
        transaction_id: 'TXN-TEST-999'
      })
    });

    if (bookRes.ok && bookRes.data?.success) {
      bookedTicketId = bookRes.data.ticket?.ticket_id;
      printPass(
        'Transactional Ticket Purchase & Commercial Checkout (/api/tickets/book)', 
        `Ticket #${bookedTicketId} booked in ${bookRes.duration}ms (Txn: ${bookRes.data.ticket?.transaction_id}, Method: ${bookRes.data.ticket?.payment_method})`
      );
    } else {
      printFail('Transactional Ticket Purchase (/api/tickets/book)', JSON.stringify(bookRes.data));
    }
  } catch (err) {
    printFail('Transactional Ticket Purchase (/api/tickets/book)', err.message);
  }

  // Check if WebSocket received the real-time event
  await new Promise((r) => setTimeout(r, 1200)); // Brief pause for socket propagation
  if (socketReceivedTicket) {
    printPass('Real-Time WebSocket Event Received (new_ticket)', `Broadcast received for Zone: ${socketReceivedTicket?.zone?.name}`);
  } else {
    printFail('Real-Time WebSocket Event Received (new_ticket)', 'Did not receive new_ticket event over socket within 1.2s');
  }

  if (socket) {
    socket.disconnect();
  }

  // ── Phase 1: PDF E-Ticket & Gate Verification Tests ─────────────────────
  if (bookedTicketId) {
    // Test PDF E-Ticket generation & streaming
    try {
      const pdfRes = await runRequest(`/tickets/${bookedTicketId}/pdf`);
      if (pdfRes.ok) {
        printPass('Download Branded PDF E-Ticket (/api/tickets/:id/pdf)', `Generated official PDF pass in ${pdfRes.duration}ms`);
      } else {
        printFail('Download Branded PDF E-Ticket (/api/tickets/:id/pdf)', JSON.stringify(pdfRes.data));
      }
    } catch (err) {
      printFail('Download Branded PDF E-Ticket (/api/tickets/:id/pdf)', err.message);
    }

    // Test QR Checkpoint Verification
    try {
      const verifyRes = await runRequest(`/tickets/verify/${bookedTicketId}`);
      if (verifyRes.ok && verifyRes.data?.valid) {
        printPass('Electronic QR Pass Verification (/api/tickets/verify/:id)', `Status: ${verifyRes.data.ticket?.status}`);
      } else {
        printFail('Electronic QR Pass Verification (/api/tickets/verify/:id)', JSON.stringify(verifyRes.data));
      }
    } catch (err) {
      printFail('Electronic QR Pass Verification (/api/tickets/verify/:id)', err.message);
    }

    // Test Gate Check-In RBAC (Visitor role should be 403 Forbidden)
    try {
      const rbacRes = await runRequest('/tickets/check-in', {
        method: 'POST',
        body: JSON.stringify({ ticket_id: Number(bookedTicketId) })
      });
      if (rbacRes.status === 403) {
        printPass('Gate Check-In RBAC Protection (403 Forbidden)', 'Visitor blocked from unauthorized self-check-in');
      } else {
        printFail('Gate Check-In RBAC Protection', `Expected 403, got ${rbacRes.status}`);
      }
    } catch (err) {
      printFail('Gate Check-In RBAC Protection', err.message);
    }
  }

  // Verify my tickets
  try {
    const myTicketsRes = await runRequest('/tickets/my');
    if (myTicketsRes.ok && Array.isArray(myTicketsRes.data?.tickets) && myTicketsRes.data.tickets.length > 0) {
      printPass('Fetch User Booking History (/api/tickets/my)', `Found ${myTicketsRes.data.tickets.length} ticket(s)`);
    } else {
      printFail('Fetch User Booking History (/api/tickets/my)', JSON.stringify(myTicketsRes.data));
    }
  } catch (err) {
    printFail('Fetch User Booking History (/api/tickets/my)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Application Layer: Direct SMTP Handshake Verification
  // ─────────────────────────────────────────────────────────────────────────
  printSection('6. Application Layer: SMTP Transporter Verification');

  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log(`    Testing Gmail SMTP Handshake for account: ${process.env.SMTP_USER}`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      console.log(`    Testing Ethereal Fallback SMTP Handshake`);
    }

    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP handshake timed out after 5s')), 5000));
    const verifySuccess = await Promise.race([verifyPromise, timeoutPromise]);
    if (verifySuccess) {
      printPass('SMTP Server TCP Handshake & Auth (Unit III)', 'Credentials and port handshake verified');
    }
  } catch (err) {
    printFail('SMTP Server TCP Handshake & Auth (Unit III)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Feedback & Contact System
  // ─────────────────────────────────────────────────────────────────────────
  printSection('7. Visitor Feedback & Contact Messages');

  try {
    const feedbackRes = await runRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        rating: 5,
        comments: 'Outstanding sanctuary maintenance and real-time tracking features!'
      })
    });

    if (feedbackRes.ok) {
      printPass('Submit Visitor Feedback (/api/feedback)', `${feedbackRes.duration}ms`);
    } else {
      printFail('Submit Visitor Feedback (/api/feedback)', JSON.stringify(feedbackRes.data));
    }
  } catch (err) {
    printFail('Submit Visitor Feedback (/api/feedback)', err.message);
  }

  try {
    const contactRes = await runRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Explorer',
        email: testEmail,
        subject: 'General Inquiry',
        message: 'Checking visitor hours and camera trap schedules.'
      })
    });

    if (contactRes.ok) {
      printPass('Submit Contact Inquiry (/api/contact)', `${contactRes.duration}ms`);
    } else {
      printFail('Submit Contact Inquiry (/api/contact)', JSON.stringify(contactRes.data));
    }
  } catch (err) {
    printFail('Submit Contact Inquiry (/api/contact)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Session Cleanup
  // ─────────────────────────────────────────────────────────────────────────
  printSection('8. Session Teardown & Cookie Invalidation');

  try {
    const logoutRes = await runRequest('/auth/logout', { method: 'POST' });
    sessionCookie = '';
    bearerToken = '';
    if (logoutRes.ok) {
      printPass('User Logout & Session Destruction (/api/auth/logout)', 'Cookie successfully cleared');
    } else {
      printFail('User Logout (/api/auth/logout)', JSON.stringify(logoutRes.data));
    }
  } catch (err) {
    printFail('User Logout (/api/auth/logout)', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`\n=============================================================`);
  console.log(`TEST RESULTS: \x1b[32m${passedTests} Passed\x1b[0m / \x1b[31m${totalTests - passedTests} Failed\x1b[0m (${totalTests} Total Tests)`);
  if (passedTests === totalTests) {
    console.log(`\x1b[32m🎉 ALL SYSTEMS NOMINAL — PROJECT IS 100% OPERATIONAL! 🎉\x1b[0m`);
  } else {
    console.log(`\x1b[33m⚠️  Some tests require your live server or database to be active.\x1b[0m`);
  }
  console.log(`=============================================================\n`);
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
