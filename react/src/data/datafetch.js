const API_BASE = 'http://localhost:3000';

function getlocalstorage(key, seeddata) {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seeddata));
  return seeddata;
}

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export function saveproducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

export function saveorders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function saveclients(clients) {
  localStorage.setItem('clients', JSON.stringify(clients));
}

export function savecategories(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
}

export async function getproducts() {
  return fetchJSON('/api/products');
}

// ORDERS
export async function getorders() {
  return fetchJSON('/api/orders');
}

// CLIENTS
export async function getclients() {
  return fetchJSON('/api/clients');
}

// CATEGORIES
export async function getcategories() {
  return fetchJSON('/api/categories');
}

// DAILY STATS
export async function getdailystats() {
  return fetchJSON('/api/daily-stats');
}