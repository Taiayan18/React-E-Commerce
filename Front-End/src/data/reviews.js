// Reviews abhi backend me store nahi hote (product model me review field nahi hai),
// isliye ye ek local (browser) review store hai jo demo/interactive purpose ke liye
// har product id ke against reviews save karta hai. Agar future me backend me
// reviews add karne hain to productModel me `reviews: []` field aur ek
// POST /api/product/:id/review route banana hoga — ye file wahi shape follow karti hai
// taaki migration aasan rahe.

const STORAGE_KEY = "zenvy_reviews";

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAll = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getReviews = (productId) => {
  const all = readAll();
  return all[productId] || [];
};

export const addReview = (productId, review) => {
  const all = readAll();
  const list = all[productId] || [];
  const newReview = {
    id: `${Date.now()}`,
    name: review.name || "Anonymous",
    rating: review.rating,
    comment: review.comment,
    date: new Date().toISOString(),
  };
  all[productId] = [newReview, ...list];
  writeAll(all);
  return newReview;
};

export const getAverageRating = (productId, fallback = 4.5) => {
  const list = getReviews(productId);
  if (!list.length) return { average: fallback, count: 0 };
  const sum = list.reduce((s, r) => s + Number(r.rating || 0), 0);
  return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
};
