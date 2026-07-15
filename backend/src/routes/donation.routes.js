import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createDonationOrder,
  verifyDonation,
  supportersWall,
  listDonations,
} from "../controllers/donation.controllers.js";

const donationRoutes = express.Router();

// Public
donationRoutes.get("/supporters", supportersWall);

// Authenticated supporters
donationRoutes.post("/order", authMiddleware, createDonationOrder);
donationRoutes.post("/verify", authMiddleware, verifyDonation);

// Admin
donationRoutes.get("/admin", authMiddleware, checkAdmin, listDonations);

export default donationRoutes;
