import { db } from "./db.js";
import { fetchOrderPayments } from "./payments.lib.js";
import { settlePayment, markPaymentFailed } from "./donations.lib.js";

// Self-healing safety net: for donations still open past a grace window, ask Razorpay
// (the real source of truth) what happened and reconcile. Guarantees no payment is lost
// even if every webhook was dropped. Every action is idempotent (guarded transitions).
export async function reconcilePendingDonations({ olderThanMin = 10, closeAfterMin = 60, limit = 50 } = {}) {
  if (!process.env.RAZORPAY_KEY_ID) return { checked: 0, settled: 0 };
  const now = Date.now();
  const pending = await db.donation.findMany({
    where: { status: { in: ["created", "attempted"] }, createdAt: { lt: new Date(now - olderThanMin * 60_000) } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { gatewayOrderId: true, createdAt: true },
  });

  let settled = 0;
  for (const d of pending) {
    try {
      const payments = await fetchOrderPayments(d.gatewayOrderId);
      const captured = (payments?.items || []).find((p) => p.status === "captured");
      if (captured) {
        if (await settlePayment(d.gatewayOrderId, captured.id)) settled += 1;
      } else if (now - new Date(d.createdAt).getTime() > closeAfterMin * 60_000) {
        // Old and no captured payment → close it out so the pending set stays small.
        await markPaymentFailed(d.gatewayOrderId);
      }
    } catch {
      // Razorpay hiccup / breaker open — leave it; the next sweep retries.
    }
  }
  return { checked: pending.length, settled };
}

let _timer;
// Start the periodic sweep (no-op if payments aren't configured). Safe under multiple
// replicas — the transitions are idempotent, so redundant sweeps just do nothing.
export function startReconciler(intervalMs = 5 * 60_000) {
  if (_timer || !process.env.RAZORPAY_KEY_ID) return;
  const run = () => reconcilePendingDonations().catch((e) => console.error("[reconcile]", e.message));
  _timer = setInterval(run, intervalMs);
  _timer.unref?.(); // don't keep the process alive just for this
  console.log("[reconcile] payment reconciliation cron started");
}
