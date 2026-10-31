const API_URLS = {
  products: import.meta.env.VITE_PRODUCTS_API_URL,
  users: import.meta.env.VITE_USERS_API_URL,
  transactions: import.meta.env.VITE_TRANSACTIONS_API_URL,
};

export const API = {
  products: `${API_URLS.products}/api`,
  users: `${API_URLS.users}/api`,
  transactions: `${API_URLS.transactions}/api`,
};