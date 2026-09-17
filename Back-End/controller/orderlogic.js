import { Order } from "../model/orderModel.js";
import { product } from "../model/productModel.js";
import { sendOrderConfirmationEmail, sendDeliveryOtpEmail } from "../utils/sendEmail.js";

// ─── CREATE ORDER (Place Order / Checkout) ───────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      userEmail, userName, items, totalAmount, shippingAddress,
      paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId,
    } = req.body;

    if (!userEmail || !userName || !items || !items.length || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        status: false,
        message: "Fill all details to place the order",
      });
    }

    const { phone, address, city, pincode } = shippingAddress;
    if (!phone || !address || !city || !pincode) {
      return res.status(400).json({
        status: false,
        message: "Fill complete shipping address",
      });
    }

    // Out-of-stock items ko order place hone se pehle hi rok do
    for (const item of items) {
      if (item.productId) {
        const found = await product.findById(item.productId).catch(() => null);
        if (found && found.inStock === false) {
          return res.status(400).json({
            status: false,
            message: `${item.name} is out of stock. Please remove it from cart.`,
          });
        }
      }
    }

    const newOrder = await Order.create({
      userEmail,
      userName,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus || "Pending",
      razorpayOrderId,
      razorpayPaymentId,
    });

    // Email background me bhejte hain — response ka wait nahi karwate, order fail nahi honi chahiye agar email fail ho
    sendOrderConfirmationEmail(newOrder);

    return res.status(201).json({
      status: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in placing order: ${error.message}`,
    });
  }
};

// ─── GET ORDERS FOR A SPECIFIC USER ───────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in fetching orders: ${error.message}`,
    });
  }
};

// ─── SEND DELIVERY OTP (Admin) ─────────────────────────────────
// Order 'Shipped' ho chuka ho to admin jab chahe (jab delivery ka time ho) ye
// button dabata hai — tabhi OTP generate hota hai aur customer ko email jaata hai.
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found" });
    }
    if (order.status !== "Shipped") {
      return res.status(400).json({
        status: false,
        message: "OTP sirf tab bhej sakte ho jab order 'Shipped' status me ho.",
      });
    }

    const newOtp = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP
    order.deliveryOtp = newOtp;
    order.otpSentAt = new Date();
    await order.save();

    sendDeliveryOtpEmail(order, newOtp);

    const responseOrder = order.toObject();
    delete responseOrder.deliveryOtp; // admin ko OTP value nahi dikhani

    return res.status(200).json({
      status: true,
      message: "Delivery OTP customer ko email kar diya gaya hai.",
      data: responseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in sending delivery OTP: ${error.message}`,
    });
  }
};

// ─── GET ALL ORDERS (Admin) ───────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    // Admin ko OTP value nahi dikhana — delivery person ko customer khud OTP batayega,
    // admin sirf verify karega, isliye response se hata dete hain (otpSentAt rehne dete hain
    // taaki admin ko pata chale ki OTP bheja ja chuka hai ya nahi).
    const sanitized = orders.map((o) => {
      const obj = o.toObject();
      delete obj.deliveryOtp;
      return obj;
    });

    return res.status(200).json({
      status: true,
      message: "All orders fetched successfully",
      data: sanitized,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in fetching orders: ${error.message}`,
    });
  }
};

// ─── UPDATE ORDER STATUS (Admin) ──────────────────────────────
// Flow: Placed -> Shipped (plain status change) -> [admin dabata hai "Send Delivery OTP"
// jab delivery ka time ho] -> Delivered (sahi OTP do to hi allow)
// Cancelled kisi bhi state se seedha ho sakta hai (koi OTP nahi chahiye)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;

    const allowed = ["Placed", "Shipped", "Delivered", "Cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    // ── "Delivered" sirf sahi OTP ke saath allow hota hai ──
    if (status === "Delivered") {
      if (!order.deliveryOtp) {
        return res.status(400).json({
          status: false,
          message: "Pehle 'Send Delivery OTP' dabao taaki customer ko OTP mil sake.",
        });
      }
      if (!otp) {
        return res.status(400).json({
          status: false,
          message: "Delivery confirm karne ke liye customer se OTP maango.",
        });
      }
      if (String(otp).trim() !== order.deliveryOtp) {
        return res.status(400).json({
          status: false,
          message: "Galat OTP. Customer se sahi OTP confirm karo.",
        });
      }
      // OTP sahi hai — deliver mark karo aur OTP clear kar do (dobara use na ho)
      order.status = "Delivered";
      order.deliveryOtp = null;
      order.otpSentAt = null;
      await order.save();

      return res.status(200).json({
        status: true,
        message: "Delivery OTP verified. Order marked as Delivered.",
        data: order,
      });
    }

    // ── "Placed" / "Shipped" / "Cancelled" — seedha update, OTP se koi lena dena nahi ──
    order.status = status;
    if (status === "Cancelled") {
      order.deliveryOtp = null;
      order.otpSentAt = null;
    }
    await order.save();

    return res.status(200).json({
      status: true,
      message: `Order marked as ${status}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in updating order status: ${error.message}`,
    });
  }
};
