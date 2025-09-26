const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// MySQL connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'RailQR Backend API - MySQL Production' });
});

// Get all inventory items
app.get('/inventory', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
app.get('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(rows[0]);
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

    const [result] = await pool.execute(
      `INSERT INTO inventory (
        vendor, vendor_id, lot_number, item_type, item_material,
        manufacture_date, install_date, warranty_period, rail_pole_number,
        inspector_code, inspection_date, defect_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor, vendor_id, lot_number, item_type, item_material,
       manufacture_date, install_date, warranty_period, rail_pole_number,
       inspector_code, inspection_date, defect_type]
    );

    res.json({ id: result.insertId, message: 'Item created successfully' });
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

    await pool.execute(
      'UPDATE inventory SET inspection_date = ?, inspector_code = ?, defect_type = ? WHERE id = ?',
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
    const [rows] = await pool.execute(`
      SELECT 
        item_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN defect_type IS NOT NULL AND defect_type != '' THEN 1 END) as defective_count
      FROM inventory 
      GROUP BY item_type
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Inventory stats
app.get('/inventory/stats', async (req, res) => {
  try {
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM inventory');
    const [defective] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE defect_type IS NOT NULL AND defect_type != ""');
    const [pendingInspection] = await pool.execute('SELECT COUNT(*) as count FROM inventory WHERE inspection_date IS NULL');
    const [warrantyExpired] = await pool.execute(`SELECT COUNT(*) as count FROM inventory WHERE 
      DATE_ADD(install_date, INTERVAL CAST(REPLACE(warranty_period, ' Years', '') AS UNSIGNED) YEAR) < CURDATE()`);

    res.json({
      total: total,
      defective: defective,
      pendingInspection: pendingInspection,
      warrantyExpired: warrantyExpired
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