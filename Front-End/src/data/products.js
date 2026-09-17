// export const categories = [
//   "All", "Mobiles", "Fashion", "Electronics", "Beauty", "Home", "Sports", "Grocery"
// ];

// export const products = [
//   { id: 1, name: "Galaxy Nova 5G Smartphone", category: "Mobiles", price: 18999, oldPrice: 29999, rating: 4.6, stock: 20, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", tag: "Best Seller", desc: "Powerful 5G phone with AMOLED display, fast charging and pro camera." },
//   { id: 2, name: "Wireless Noise Cancelling Headphones", category: "Electronics", price: 3499, oldPrice: 8999, rating: 4.4, stock: 45, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900", tag: "Hot Deal", desc: "Deep bass headphones with active noise cancellation and 40hr battery." },
//   { id: 3, name: "Men Premium Casual Sneakers", category: "Fashion", price: 1299, oldPrice: 3499, rating: 4.3, stock: 35, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900", tag: "Trending", desc: "Comfortable sneakers for daily wear with soft cushion sole." },
//   { id: 4, name: "Smart LED TV 43 inch 4K", category: "Electronics", price: 24999, oldPrice: 49999, rating: 4.7, stock: 11, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=900", tag: "Featured", desc: "4K smart TV with HDR display and built-in OTT apps." },
//   { id: 5, name: "Women Cotton Summer Dress", category: "Fashion", price: 899, oldPrice: 2499, rating: 4.2, stock: 28, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900", tag: "New", desc: "Lightweight cotton dress with premium stitching and comfort fit." },
//   { id: 6, name: "Matte Finish Lipstick Combo", category: "Beauty", price: 499, oldPrice: 1299, rating: 4.1, stock: 80, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900", tag: "60% Off", desc: "Long lasting lipstick combo with smooth matte finish." },
//   { id: 7, name: "Modern Wooden Study Table", category: "Home", price: 5999, oldPrice: 11999, rating: 4.5, stock: 9, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900", tag: "Premium", desc: "Strong wooden study table with storage and elegant finish." },
//   { id: 8, name: "Professional Cricket Bat", category: "Sports", price: 2199, oldPrice: 5499, rating: 4.4, stock: 16, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900", tag: "Sport", desc: "Lightweight cricket bat for powerful shots and better control." },
//   { id: 9, name: "Organic Grocery Basket", category: "Grocery", price: 799, oldPrice: 1599, rating: 4.0, stock: 60, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900", tag: "Fresh", desc: "Healthy grocery combo with fruits, vegetables and daily essentials." },
//   { id: 10, name: "Smart Fitness Watch", category: "Mobiles", price: 1499, oldPrice: 3999, rating: 4.2, stock: 50, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900", tag: "Popular", desc: "Fitness watch with heart rate, sleep tracking and long battery backup." },
//   { id: 11, name: "Bluetooth Speaker Bass Boost", category: "Electronics", price: 999, oldPrice: 2999, rating: 4.3, stock: 33, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900", tag: "Deal", desc: "Portable speaker with loud sound, deep bass and water resistance." },
//   { id: 12, name: "Luxury Bedsheet King Size", category: "Home", price: 1199, oldPrice: 2999, rating: 4.1, stock: 21, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900", tag: "Home", desc: "Soft king size bedsheet with premium fabric and elegant patterns." }
// ];

// .env me VITE_API_URL set hai to wahi use hoga, warna local dev ke liye
// localhost:8080 fallback rahega (Back-End/.env ka PORT isse match hona chahiye).
const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

// Login/register ke baad milne wala JWT token localStorage se le kar
// Authorization header me bhejta hai, taaki protected admin routes kaam karein
const authHeaders = () => {
  const token = localStorage.getItem("zenvy_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getalldata = async () => {
  try {
    
    const res = await fetch(`${BASE_URL}/product/getdata`, {
      method: "GET",
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Toggle a product's stock status (in stock / out of stock)
export const toggleProductStock = async (id, inStock) => {
  try {
    const res = await fetch(`${BASE_URL}/product/toggle-stock/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ inStock }),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Create a new product (Admin)
export const createProductApi = async (productData) => {
  try {
    const res = await fetch(`${BASE_URL}/product/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(productData),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Update an existing product by name (Admin)
export const updateProductApi = async (name, productData) => {
  try {
    const res = await fetch(`${BASE_URL}/product/update/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(productData),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

// Delete a product by name (Admin)
export const deleteProductApi = async (name) => {
  try {
    const res = await fetch(`${BASE_URL}/product/delete/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};