import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

// Configure Connection Pool to Dedicated PostgreSQL Container
const pool = new pg.Pool({
    host: process.env.DB_HOST || 'dedicated-sql-db',
    user: process.env.DB_USER || 'shop_admin',
    password: process.env.DB_PASSWORD || 'SecretPassword123',
    database: process.env.DB_NAME || 'nexus_store',
    port: 5432,
});

// Initialize Database Tables and Mock Data on Startup
async function initDB() {
    try {
        // 1. Create Products Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                category TEXT,
                image TEXT,
                description TEXT
            );
        `);

        // 2. Create Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id TEXT UNIQUE NOT NULL,
                total NUMERIC(10, 2) NOT NULL,
                items JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed inventory items if table is empty
        const productCheck = await pool.query("SELECT COUNT(*) FROM products");
        if (parseInt(productCheck.rows[0].count) === 0) {
            const queryText = `INSERT INTO products (title, price, category, image, description) VALUES ($1, $2, $3, $4, $5)`;
            await pool.query(queryText, ["Premium Wireless Headphones", 129.99, "Electronics", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", "High-fidelity sound with active noise cancellation."]);
            await pool.query(queryText, ["Minimalist Leather Watch", 189.50, "Accessories", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", "Genuine Italian leather strap with Swiss quartz movement."]);
            await pool.query(queryText, ["Ergonomic Mechanical Keyboard", 89.99, "Electronics", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", "Tactile mechanical switches with customizable RGB lighting."]);
            await pool.query(queryText, ["Suede Desert Boots", 145.00, "Footwear", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "Premium handcrafted suede shoes suitable for all seasons."]);
            await pool.query(queryText, ["Water-Resistant Commuter Backpack", 75.00, "Accessories", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", "Spacious compartments with a dedicated 16-inch laptop pocket."]);
            await pool.query(queryText, ["Natural Soy Wax Candle", 24.00, "Home Goods", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500", "Infused with organic lavender and eucalyptus essential oils."]);
            console.log("PostgreSQL seeded with catalog items successfully.");
        }
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
}
initDB();

// GET: Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
        // Convert string formatted numbers to standard floats for UI mapping compatibility
        const products = result.rows.map(p => ({ ...p, price: parseFloat(p.price) }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch all orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
        const orders = result.rows.map(o => ({ ...o, total: parseFloat(o.total) }));
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Save checked out order
app.post('/api/checkout', async (req, res) => {
    const { cartItems, total } = req.body;
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const orderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;

    try {
        await pool.query(
            `INSERT INTO orders (order_id, total, items) VALUES ($1, $2, $3)`,
            [orderId, total, JSON.stringify(cartItems)]
        );
        console.log(`Saved order ${orderId} in PostgreSQL.`);
        res.json({ success: true, orderId });
    } catch (err) {
        console.error("Checkout transaction failed:", err.message);
        res.status(500).json({ success: false, message: "Failed to save order." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend service container running on port ${PORT}`));
