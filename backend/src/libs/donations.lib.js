import { db } from "./db.js";

// Shared, idempotent settlement used by the client-verify path, the webhook, and the
// reconciler. The GUARD is the `status IN (created, attempted)` where-clause: only the
// caller that actually flips the row to `paid` gets count === 1 and fires side effects.
// Everyone else (duplicate webhook, verify+webhook race, reconciler re-run) is a no-op.
export async function settlePayment(orderId, paymentId) {
  if (!orderId) return false;
  try {
    const { count } = await db.donation.updateMany({
      where: { gatewayOrderId: orderId, status: { in: ["created", "attempted"] } },
      data: { status: "paid", gatewayPaymentId: paymentId ?? undefined },
    });
    if (count === 1) await onDonationPaid(orderId, paymentId);
    return count === 1;
  } catch (e) {
    // Unique conflict on gatewayPaymentId (same payment already recorded) → treat as settled-elsewhere.
    if (e.code === "P2002") return false;
    throw e;
  }
}

// Mark a still-open donation failed (payment.failed webhook / reconciler close-out).
export async function markPaymentFailed(orderId) {
  if (!orderId) return;
  await db.donation.updateMany({
    where: { gatewayOrderId: orderId, status: { in: ["created", "attempted"] } },
    data: { status: "failed" },
  });
}

// Exactly-once side effects for a newly-settled donation. Runs at most once per donation
// (guaranteed by the guard above). Add receipt email / points / wall notification here.
async function onDonationPaid(orderId, paymentId) {
  console.log(`[donation] settled order=${orderId} payment=${paymentId || "-"}`);
  // TODO: receipt email to logged-in donors, metrics counter, etc. — safe to add; runs once.
}
