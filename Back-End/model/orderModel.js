import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    image: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
        default: "Placed",
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Online"],
        default: "COD",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    // Delivery OTP: 'Send Delivery OTP' button dabane par generate hota hai (Shipped ke baad),
    // customer ko email jaata hai, aur 'Delivered' tabhi mark hoti hai jab ye sahi OTP diya jaaye.
    deliveryOtp: { type: String, default: null },
    otpSentAt: { type: Date, default: null },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
