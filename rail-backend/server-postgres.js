const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'RailQR Backend API - PostgreSQL' });
});

// Get all inventory items
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
app.get('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new inventory item
app.post('/inventory', async (req, res) => {
  try {
    const {
      vendor, vendor_id, lot_number, item_type, item_material,
      manufacture_date, install_date, warranty_period, rail_pole_number,
      inspector_code, inspection_date, defect_type
    } = req.body;

    const result = await pool.query(
      `INSERT INTO inventory (
        vendor, vendor_id, lot_number, item_type, item_material,
        manufacture_date, install_date, warranty_period, rail_pole_number,
        inspector_code, inspection_date, defect_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [vendor, vendor_id, lot_number, item_type, item_material,
       manufacture_date, install_date, warranty_period, rail_pole_number,
       inspector_code, inspection_date, defect_type]
    );

    res.json({ id: result.rows[0].id, message: 'Item created successfully' });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update inventory item
app.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { inspection_date, inspector_code, defect_type } = req.body;

    await pool.query(
      'UPDATE inventory SET inspection_date = $1, inspector_code = $2, defect_type = $3 WHERE id = $4',
      [inspection_date, inspector_code, defect_type, id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Analytics endpoints
app.get('/analytics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        item_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN defect_type IS NOT NULL AND defect_type != '' THEN 1 END) as defective_count
      FROM inventory 
      GROUP BY item_type
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Inventory stats
app.get('/inventory/stats', async (req, res) => {
  try {
    const [total, defective, pendingInspection, warrantyExpired] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM inventory'),
      pool.query('SELECT COUNT(*) as count FROM inventory WHERE defect_type IS NOT NULL AND defect_type != \'\''),
      pool.query('SELECT COUNT(*) as count FROM inventory WHERE inspection_date IS NULL'),
      pool.query(`SELECT COUNT(*) as count FROM inventory WHERE 
        install_date + INTERVAL '1 year' * CAST(REPLACE(warranty_period, ' Years', '') AS INTEGER) < CURRENT_DATE`)
    ]);

    res.json({
      total: total.rows,
      defective: defective.rows,
      pendingInspection: pendingInspection.rows,
      warrantyExpired: warrantyExpired.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Inspector authentication
app.post('/auth/inspector', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.INSPECTOR_PASSWORD || '1234';
  
  if (password === correctPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});