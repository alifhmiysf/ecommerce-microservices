const productMeta = {
  1: {
    category: "Audio",
    emoji: "🎧",
    color: "lavender",
    tag: "POPULER",
  },
  2: {
    category: "Elektronik",
    emoji: "⌚",
    color: "blue",
    tag: "TRENDING",
  },
  3: {
    category: "Aksesori",
    emoji: "🎒",
    color: "peach",
    tag: "PRAKTIS",
  },
  4: {
    category: "Fashion",
    emoji: "👟",
    color: "mint",
    tag: "FAVORIT",
  },
};

export function getProductMeta(id) {
  return (
    productMeta[id] || {
      category: "Produk",
      emoji: "🛍️",
      color: "yellow",
      tag: "",
    }
  );
}