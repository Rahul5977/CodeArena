import { db } from "../libs/db.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../libs/payments.lib.js";

// Pay-what-you-want support. A donation grants nothing extra — everything on
// CodeArena is free; this is a thank-you, not a purchase.

export const createDonationOrder = async (req, res) => {
  try {
    const { amount, name, message, showOnWall = false } = req.body;
    const value = Number(amount);
    if (!value || value < 1) return res.status(400).json({ success: false, message: "Please enter a valid amount" });

    const order = await createRazorpayOrder(value, "INR");
    await db.donation.create({
      data: {
        userId: req.user?.id || null,
        amount: value,
        currency: "INR",
        gatewayOrderId: order.id,
        status: "created",
        name: name || null,
        message: message || null,
        showOnWall: !!showOnWall,
      },
    });

    return res.status(201).json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error creating donation order:", error);
    return res.status(500).json({ success: false, message: "Could not start the donation" });
  }
};

export const verifyDonation = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const valid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    const donation = await db.donation.update({
      where: { gatewayOrderId: razorpayOrderId },
      data: { status: valid ? "paid" : "failed", gatewayPaymentId: razorpayPaymentId || null },
    });

    if (!valid) return res.status(400).json({ success: false, message: "Payment verification failed" });
    return res.status(200).json({ success: true, message: "Thank you for supporting CodeArena!", amount: donation.amount });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Donation order not found" });
    console.error("Error verifying donation:", error);
    return res.status(500).json({ success: false, message: "Error verifying donation" });
  }
};

// Public supporters wall (opt-in only).
export const supportersWall = async (req, res) => {
  try {
    const supporters = await db.donation.findMany({
      where: { status: "paid", showOnWall: true, name: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { name: true, message: true, amount: true, createdAt: true },
    });
    return res.status(200).json({ success: true, supporters });
  } catch (error) {
    console.error("Error fetching supporters:", error);
    return res.status(500).json({ success: false, message: "Error fetching supporters" });
  }
};

// Admin — donation list + total.
export const listDonations = async (req, res) => {
  try {
    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where: { status: "paid" },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, amount: true, name: true, message: true, showOnWall: true, createdAt: true },
      }),
      db.donation.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    ]);
    return res.status(200).json({ success: true, donations, total: total._sum.amount || 0 });
  } catch (error) {
    console.error("Error listing donations:", error);
    return res.status(500).json({ success: false, message: "Error listing donations" });
  }
};
