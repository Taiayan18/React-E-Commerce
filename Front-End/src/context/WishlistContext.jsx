import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const getKey = (email) => (email ? `wishlist_${email}` : "wishlist_guest");

  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedUser = localStorage.getItem("zenvy_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const saved = localStorage.getItem(getKey(parsedUser?.email));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadedEmail, setLoadedEmail] = useState(() => {
    try {
      const savedUser = localStorage.getItem("zenvy_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return parsedUser?.email || "";
    } catch {
      return "";
    }
  });

  // Reload wishlist when the logged-in user changes
  useEffect(() => {
    const currentEmail = user?.email || "";
    if (loadedEmail !== currentEmail) {
      try {
        const saved = localStorage.getItem(getKey(currentEmail));
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      }
      setLoadedEmail(currentEmail);
    }
  }, [user, loadedEmail]);

  // Persist on change
  useEffect(() => {
    const currentEmail = user?.email || "";
    if (loadedEmail === currentEmail) {
      localStorage.setItem(getKey(currentEmail), JSON.stringify(wishlist));
    }
  }, [wishlist, user, loadedEmail]);

  const isWishlisted = (id) => wishlist.some((p) => (p._id || p.id) === id);

  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    const alreadyExists = wishlist.some((p) => (p._id || p.id) === id);

    // Toast yahan, setState updater ke bahar, call karte hain — warna React StrictMode
    // dev mode me updater function ko do baar chalata hai aur toast bhi 2 baar dikhta hai.
    if (alreadyExists) {
      toast("Removed from wishlist", { icon: "💔" });
    } else {
      toast.success("Added to wishlist");
    }

    setWishlist((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === id);
      if (exists) {
        return prev.filter((p) => (p._id || p.id) !== id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== id));
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
