import seed from './seed.json';

function getlocalstorage(key, seeddata) {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seeddata));
  return seeddata;
}

// PRODUCTS
export function getproducts() {
  return getlocalstorage('products', seed.products);
}
export function saveproducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// ORDERS
export function getorders() {
  return getlocalstorage('orders', seed.orders);
}
export function saveorders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// CLIENTS
export function getclients() {
  return getlocalstorage('clients', seed.clients);
}
export function saveclients(clients) {
  localStorage.setItem('clients', JSON.stringify(clients));
}

// CATEGORIES
export function getcategories() {
  return getlocalstorage('categories', seed.categories);
}
export function savecategories(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
}

// DAILY STATS
export function getdailystats() {
  return getlocalstorage('dailyStats', seed.dailyStats);
}