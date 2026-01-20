import express from "express";
import cors from "cors";
import { query } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// simple check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

/**
 * GET orders
 * Shape matches your React dashboard expectations
 */
app.get("/api/orders", async (req, res) => {
  try {
    // 1) get orders
    const orders = await query(`
      SELECT
        id,
        order_date::text AS date,
        total,
        payment_status AS "paymentStatus",
        fulfillment_status AS "fulfillmentStatus",
        country
      FROM orders
      ORDER BY order_date
    `);

    // 2) get order items
    const items = await query(`
      SELECT
        order_id AS "orderId",
        product_id AS "productId",
        qty
      FROM order_items
    `);

    // 3) group items by order
    const itemsByOrder = {};
    items.forEach((item) => {
      if (!itemsByOrder[item.orderId]) {
        itemsByOrder[item.orderId] = [];
      }
      itemsByOrder[item.orderId].push({
        productId: item.productId,
        qty: item.qty,
      });
    });

    // 4) attach items to orders
    orders.forEach((order) => {
      order.items = itemsByOrder[order.id] || [];
    });

    res.json(orders);
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// get products
app.get("/api/products", async (req, res) => {
  try {
    const products = await query(`
      SELECT
        id,
        name,
        category_id AS "categoryId",
        price::float AS price,
        stock
      FROM products
      ORDER BY id
    `);

    res.json(products);
  } catch (err) {
    console.error("GET /api/products failed:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// get categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await query(`
      SELECT id, name
      FROM categories
      ORDER BY id
    `);

    res.json(categories);
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET daily stats
 * Derived from orders (since you don't have a stats table)
 */
app.get("/api/daily-stats", async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        order_date::text AS date,
        COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS orders,
        COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0)::float AS revenue
      FROM orders
      GROUP BY order_date
      ORDER BY order_date
    `);

    const stats = rows.map((r) => {
      const orders = Number(r.orders) || 0;
      const visitors = orders * 25;                 // demo
      const addToCart = Math.round(visitors * 0.3); // demo
      const checkout = Math.round(addToCart * 0.6); // demo

      return {
        date: r.date,
        visitors,
        addToCart,
        checkout,
        orders,
        revenue: Number(r.revenue) || 0,
      };
    });

    res.json(stats);
  } catch (err) {
    console.error("GET /api/daily-stats failed:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    const clients = await query(`
      SELECT id, name, email
      FROM clients
      ORDER BY id
    `);
    res.json(clients);
  } catch (err) {
    console.error("GET /api/clients failed:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default app;