const STORAGE_KEY = "zenvy_recently_viewed";
const MAX_ITEMS = 10;

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (product) => {
  if (!product) return;
  const id = product._id || product.id;
  const existing = getRecentlyViewed().filter((p) => (p._id || p.id) !== id);
  const updated = [product, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
