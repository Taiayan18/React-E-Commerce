const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

// Login/register ke baad milne wala JWT token localStorage se le kar
// Authorization header me bhejta hai, taaki protected order routes kaam karein
const authHeaders = () => {
  const token = localStorage.getItem("zenvy_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Place a new order (Checkout)
export const placeOrder = async (orderData) => {
  try {
    const res = await fetch(`${BASE_URL}/order/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(orderData),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    return { status: false, message: "Cannot connect to server. Please try again." };
  }
};

// Get orders placed by the logged-in user
export const getMyOrders = async (email) => {
  try {
    const res = await fetch(`${BASE_URL}/order/my/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Get all orders (Admin)
export const getAllOrders = async () => {
  try {
    const res = await fetch(`${BASE_URL}/order/all`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Update an order's status (Admin) — e.g. Placed -> Shipped -> Delivered
export const updateOrderStatus = async (id, status, otp) => {
  try {
    const res = await fetch(`${BASE_URL}/order/status/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status, otp }),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    return { status: false, message: "Cannot connect to server. Please try again." };
  }
};

// Delivery OTP generate karke customer ko email karta hai (sirf 'Shipped' orders ke liye)
export const sendDeliveryOtp = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/order/send-otp/${id}`, {
      method: "POST",
      headers: authHeaders(),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    return { status: false, message: "Cannot connect to server. Please try again." };
  }
};
