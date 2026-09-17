import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Load initial cart matching the logged-in user synchronously from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedUser = localStorage.getItem("zenvy_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const key = parsedUser?.email ? `cart_${parsedUser.email}` : "cart_guest";
      const savedCart = localStorage.getItem(key);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Track the email context for which the cart was loaded
  const [loadedUserEmail, setLoadedUserEmail] = useState(() => {
    try {
      const savedUser = localStorage.getItem("zenvy_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return parsedUser?.email || "";
    } catch {
      return "";
    }
  });

  // Load from local storage when user changes
  useEffect(() => {
    const currentUserEmail = user?.email || "";
    if (loadedUserEmail !== currentUserEmail) {
      const key = currentUserEmail ? `cart_${currentUserEmail}` : "cart_guest";
      try {
        const savedCart = localStorage.getItem(key);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (e) {
        setCart([]);
      }
      setLoadedUserEmail(currentUserEmail);
    }
  }, [user, loadedUserEmail]);

  // Save to local storage on cart change, but only if loadedUserEmail matches user.email
  useEffect(() => {
    const currentUserEmail = user?.email || "";
    if (loadedUserEmail === currentUserEmail) {
      const key = currentUserEmail ? `cart_${currentUserEmail}` : "cart_guest";
      localStorage.setItem(key, JSON.stringify(cart));
    }
  }, [cart, user, loadedUserEmail]);

  const addToCart = (product) => {
    if (product.inStock === false) return; // out of stock product cart me add nahi hoga
    const productId = product._id || product.id;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item._id || item.id) === productId);
      if (existing) {
        // Increment quantity if it already exists
        return prevCart.map((item) =>
          (item._id || item.id) === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // Add new item with quantity 1
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item._id || item.id) === id ? { ...item, qty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const count = cart.reduce((totalQty, item) => totalQty + item.qty, 0);
  const total = cart.reduce((totalPrice, item) => totalPrice + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, count, total, addToCart, updateQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);