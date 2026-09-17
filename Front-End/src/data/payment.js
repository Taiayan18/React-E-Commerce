const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

const authHeaders = () => {
  const token = localStorage.getItem("zenvy_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Razorpay ka checkout.js script dynamically load karta hai (agar pehle se load nahi hai)
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Backend pe Razorpay order banate hain (amount rupees me bhejo, backend paise me convert karta hai)
export const createRazorpayOrder = async (amount) => {
  try {
    const res = await fetch(`${BASE_URL}/payment/create-order`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    return { status: false, message: "Cannot connect to payment server." };
  }
};

// Payment hone ke baad signature verify karte hain
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const res = await fetch(`${BASE_URL}/payment/verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(paymentData),
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    return { status: false, message: "Cannot verify payment." };
  }
};
