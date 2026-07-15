import crypto from "crypto";
import { db } from "../libs/db.js";

// Razorpay webhook handler for donations.
//
// IMPORTANT: this route MUST receive the RAW request body (a Buffer), not a
// JSON-parsed object — the signature is an HMAC over the exact bytes Razorpay
// sent. Mount it with `express.raw({ type: "application/json" })` and BEFORE
// the global `express.json()` middleware (see glue notes), otherwise req.body
// is already parsed and the raw bytes are lost.
//
// Flow: verify the X-Razorpay-Signature header (HMAC-SHA256 of the raw body
// keyed by RAZORPAY_WEBHOOK_SECRET); on `payment.captured`, mark the matching
// Donation (by gatewayOrderId) as "paid". Always answer 200 quickly on a valid,
// well-formed event so Razorpay doesn't retry — the DB work is best-effort and
// idempotent (updateMany never throws on a missing row).

const getRawBuffer = (body) => {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body, "utf8");
  // Fallback (should not happen if express.raw is mounted): re-serialize.
  return Buffer.from(JSON.stringify(body ?? {}), "utf8");
};

const signaturesMatch = (expectedHex, receivedHex) => {
  if (!expectedHex || !receivedHex) return false;
  const a = Buffer.from(expectedHex, "utf8");
  const b = Buffer.from(receivedHex, "utf8");
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

export const donationWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      // Webhooks aren't configured — acknowledge so Razorpay stops retrying.
      console.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(200).json({ success: false, message: "Webhook not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const raw = getRawBuffer(req.body);

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (!signaturesMatch(expected, signature)) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    // Signature is valid — safe to trust the payload.
    let event;
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ success: false, message: "Malformed webhook payload" });
    }

    if (event?.event === "payment.captured") {
      const payment = event?.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id || null;

      if (orderId) {
        // updateMany is idempotent and never throws on a missing/already-paid row.
        await db.donation.updateMany({
          where: { gatewayOrderId: orderId },
          data: { status: "paid", gatewayPaymentId: paymentId },
        });
      }
    }

    // Acknowledge every valid, well-formed event promptly.
    return res.status(200).json({ success: true });
  } catch (error) {
    // Log but still 200 so Razorpay isn't stuck retrying a transient DB error;
    // reconciliation can fall back to the verify endpoint the client also calls.
    console.error("Error handling donation webhook:", error);
    return res.status(200).json({ success: true });
  }
};

export default donationWebhook;
