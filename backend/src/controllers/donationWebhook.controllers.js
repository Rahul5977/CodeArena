import crypto from "crypto";
import { db } from "../libs/db.js";
import { settlePayment, markPaymentFailed } from "../libs/donations.lib.js";

// Razorpay webhook — the AUTHORITATIVE settlement signal (UPI settles out-of-band, so the
// client callback often never fires). Must receive the RAW body (Buffer): the signature is
// an HMAC over the exact bytes Razorpay sent, so mount with `express.raw({ type: "application/json" })`
// BEFORE the global `express.json()` (see index.js).
//
// Flow: verify HMAC → store the delivery once (WebhookEvent, dedup by x-razorpay-event-id) →
// apply the guarded, idempotent transition → ACK 200 quickly. Duplicates/retries are no-ops.

const getRawBuffer = (body) => {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body, "utf8");
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

async function processEvent(event) {
  const type = event?.event;
  const payment = event?.payload?.payment?.entity;
  const orderId = payment?.order_id || event?.payload?.order?.entity?.id;
  const paymentId = payment?.id || null;
  if (!orderId) return;

  if (type === "payment.captured" || type === "order.paid") {
    await settlePayment(orderId, paymentId);
  } else if (type === "payment.failed") {
    await markPaymentFailed(orderId);
  }
  // refund.processed → mark refunded (follow-up; kept out of the money-in path)
}

export const donationWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(200).json({ success: false, message: "Webhook not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const raw = getRawBuffer(req.body);
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (!signaturesMatch(expected, signature)) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    let event;
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ success: false, message: "Malformed webhook payload" });
    }

    const eventId = req.headers["x-razorpay-event-id"] || null;

    // Dedup + audit: store the delivery exactly once. A repeat delivery is acknowledged and skipped.
    if (eventId) {
      try {
        await db.webhookEvent.create({ data: { eventId, type: event?.event || "unknown", payload: event } });
      } catch (e) {
        if (e.code === "P2002") return res.status(200).json({ success: true, duplicate: true });
        // any other store error → fall through and still try to process (settle is idempotent)
      }
    }

    await processEvent(event);
    if (eventId) {
      await db.webhookEvent.updateMany({ where: { eventId }, data: { status: "processed", processedAt: new Date() } });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    // Log but still 200 so Razorpay isn't stuck retrying a transient error — the verify path
    // and the reconciliation cron are the safety nets.
    console.error("Error handling donation webhook:", error);
    return res.status(200).json({ success: true });
  }
};

export default donationWebhook;
