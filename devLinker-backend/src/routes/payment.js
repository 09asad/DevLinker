const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payments");
const User = require("../models/user");
const membershipAmounts = require("../utils/constants");
const { validateWebhookSignature} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmounts[membershipType] * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      notes: order.notes,
      receipt: order.receipt,
    });
    const savedPayment = await payment.save();

    res.status(200).json({
      // return back my order details to frontend
      keyId: process.env.RAZORPAY_KEY_ID,
      order: savedPayment,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const isWebhookVerified = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebhookVerified) {
      return res.status(400).json({ msg: "Webhook verification failed" });
    }

    // update the payment status in the database based on the webhook payload
    const payment = await Payment.findOne({
      orderId: req.body.payload.payment.entity.order_id,
    });

    if(!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    payment.status = req.body.payload.payment.entity.status;
    await payment.save();

    // update the user as premium user if the payment is successful
    if (req.body.event === "payment.captured") {
      const user = await User.findById(payment.userId);

      if (!user) {
        return res.status(404).json({
          msg: "User not found",
        });
      }
      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;

      const expiryDate = new Date();

      if (payment.notes.membershipType === "silver") {
        expiryDate.setMonth(expiryDate.getMonth() + 2);
      } else if (payment.notes.membershipType === "gold") {
        expiryDate.setMonth(expiryDate.getMonth() + 6);
      }

      user.membershipExpiresAt = expiryDate;

      await user.save();
    }

    if (req.body.event === "payment.failed") {
      payment.status = "failed";
      await payment.save();
    }

    return res.status(200).json({
      msg: "Webhook processed successfully",
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
paymentRouter.get("/payment/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  return res.json({... user})
});

module.exports = paymentRouter;
