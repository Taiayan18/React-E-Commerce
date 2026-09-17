import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay instance sirf tab banate hain jab keys .env me ho, warna server crash ho jaayega
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── CREATE RAZORPAY ORDER (before showing payment popup on frontend) ─────
export const createRazorpayOrder = async (req, res) => {
  try {
    const instance = getRazorpayInstance();
    if (!instance) {
      return res.status(500).json({
        status: false,
        message: "Payment gateway configured nahi hai. Back-End .env me RAZORPAY_KEY_ID aur RAZORPAY_KEY_SECRET set karo.",
      });
    }

    const { amount } = req.body; // amount rupees me aayega frontend se

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Valid amount required",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay paise me amount leta hai
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    return res.status(200).json({
      status: true,
      message: "Razorpay order created",
      data: razorpayOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error creating payment order: ${error.message}`,
    });
  }
};

// ─── VERIFY PAYMENT SIGNATURE (after user pays on frontend popup) ─────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: false,
        message: "Missing payment verification details",
      });
    }

    // Razorpay ka signature verify karne ka official tareeka: hamare secret se
    // order_id|payment_id ko sign karke check karo ki wo frontend se aaye signature se match karta hai
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        status: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error verifying payment: ${error.message}`,
    });
  }
};
