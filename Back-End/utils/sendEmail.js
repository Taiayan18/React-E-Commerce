import nodemailer from "nodemailer";

// SMTP configured hai ya nahi ye check karne ke liye
const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // 465 = SSL, 587 = STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Chhote timeouts rakhe hain taaki agar firewall/antivirus SMTP block kar raha ho
      // to turant (10 sec me) error dikhe, minutes tak silently latka na rahe
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

// order confirmation email ka simple, readable HTML template
const buildOrderEmailHtml = (order) => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">₹${item.price * item.qty}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1e293b;">
    <h2 style="color:#2563eb;">Thanks for your order, ${order.userName}! 🎉</h2>
    <p>Your order has been placed successfully. Here are the details:</p>
    <p style="font-size:13px;color:#64748b;">Order ID: ${order._id}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="text-align:left;border-bottom:2px solid #e2e8f0;">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;text-align:center;">Qty</th>
          <th style="padding:8px 0;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p style="font-size:18px;font-weight:bold;text-align:right;">Total: ₹${order.totalAmount}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
    <p style="font-size:14px;">
      Shipping to:<br />
      ${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br />
      Phone: ${order.shippingAddress.phone}
    </p>
    <p style="font-size:13px;color:#64748b;margin-top:24px;">— Team Zenvy</p>
  </div>`;
};

// Order confirmation email bhejta hai. Agar SMTP configure nahi hai, silently
// skip kar deta hai (console me warn karta hai) — order placement isse block nahi hoti.
export const sendOrderConfirmationEmail = async (order) => {
  console.log(`📧 sendOrderConfirmationEmail() called for order ${order._id} → ${order.userEmail}`);

  const mailer = getTransporter();
  if (!mailer) {
    console.log("ℹ️  Email skip kiya — SMTP .env me configure nahi hai (SMTP_HOST/SMTP_USER/SMTP_PASS).");
    return;
  }

  console.log(`📤 Sending via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} as ${process.env.SMTP_USER} ...`);

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"Zenvy" <${process.env.SMTP_USER}>`,
      to: order.userEmail,
      subject: `Order Confirmed — ${order._id}`,
      html: buildOrderEmailHtml(order),
    });
    console.log(`✅ Order confirmation email sent to ${order.userEmail}`);
  } catch (error) {
    // Email fail hone par order placement fail nahi honi chahiye, isliye sirf log karte hain
    console.log(`⚠️  Order confirmation email nahi bhej paye: ${error.message}`);
  }
};

// Order 'Shipped' hote hi delivery OTP customer ko email karta hai
export const sendDeliveryOtpEmail = async (order, otp) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("ℹ️  Delivery OTP email skip kiya — SMTP configure nahi hai.");
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1e293b;">
    <h2 style="color:#2563eb;">Your order is on the way! 🚚</h2>
    <p>Order ID: ${order._id}</p>
    <p>Jab delivery person aapka order de, ye OTP unhe batayein taaki delivery confirm ho sake:</p>
    <div style="font-size:32px;font-weight:900;letter-spacing:8px;background:#eff6ff;color:#2563eb;padding:16px 24px;border-radius:16px;text-align:center;margin:20px 0;">
      ${otp}
    </div>
    <p style="font-size:13px;color:#64748b;">Ye OTP kisi aur ke saath share mat karein.</p>
    <p style="font-size:13px;color:#64748b;margin-top:24px;">— Team Zenvy</p>
  </div>`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"Zenvy" <${process.env.SMTP_USER}>`,
      to: order.userEmail,
      subject: `Your Delivery OTP: ${otp}`,
      html,
    });
    console.log(`✅ Delivery OTP email sent to ${order.userEmail}`);
  } catch (error) {
    console.log(`⚠️  Delivery OTP email nahi bhej paye: ${error.message}`);
  }
};

// Forgot Password OTP email
export const sendPasswordResetOtpEmail = async (user, otp) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("ℹ️  Password reset OTP email skip kiya — SMTP configure nahi hai.");
    return false;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1e293b;">
    <h2 style="color:#2563eb;">Password Reset Request 🔐</h2>
    <p>Hi ${user.name}, aapne apna Zenvy account ka password reset karne ki request ki hai.</p>
    <p>Ye OTP use karke naya password set karein (10 minute me expire ho jaayega):</p>
    <div style="font-size:32px;font-weight:900;letter-spacing:8px;background:#eff6ff;color:#2563eb;padding:16px 24px;border-radius:16px;text-align:center;margin:20px 0;">
      ${otp}
    </div>
    <p style="font-size:13px;color:#64748b;">Agar aapne ye request nahi ki, to ye email ignore kar dein — aapka password safe hai.</p>
    <p style="font-size:13px;color:#64748b;margin-top:24px;">— Team Zenvy</p>
  </div>`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"Zenvy" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Your Password Reset OTP: ${otp}`,
      html,
    });
    console.log(`✅ Password reset OTP email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Password reset OTP email nahi bhej paye: ${error.message}`);
    return false;
  }
};
