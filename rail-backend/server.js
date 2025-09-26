require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://railtrack-insight.netlify.app', 'https://your-netlify-app.netlify.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(bodyParser.json());

// Local MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'rail_inventory'
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Test route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Get all inventory items
app.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get item details by ID
app.get("/inventory/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM inventory WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(results[0]);
  });
});

// Add new inventory item
app.post("/inventory", (req, res) => {
  const {
    vendor, vendor_id, lot_number, item_type, item_material,
    manufacture_date, install_date, warranty_period,
    rail_pole_number, inspector_code, inspection_date, defect_type
  } = req.body;

  const query = `
    INSERT INTO inventory
    (vendor, vendor_id, lot_number, item_type, item_material, manufacture_date, install_date, warranty_period, rail_pole_number, inspector_code, inspection_date, defect_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [vendor, vendor_id, lot_number, item_type, item_material, manufacture_date, install_date, warranty_period, rail_pole_number, inspector_code, inspection_date, defect_type];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item added successfully", id: result.insertId });
  });
});

// Authenticate inspector
app.post("/auth/inspector", (req, res) => {
  const { password } = req.body;

  if (password === process.env.INSPECTOR_PASSWORD) {
    return res.json({ message: "Authentication successful" });
  } else {
    return res.status(401).json({ error: "Incorrect password" });
  }
});

// Update only inspection details
app.put("/inventory/:id", (req, res) => {
  const id = req.params.id;
  const { inspector_code, inspection_date, defect_type } = req.body;

  const query = `
    UPDATE inventory
    SET inspector_code = ?, inspection_date = ?, defect_type = ?
    WHERE id = ?
  `;
  const values = [inspector_code, inspection_date, defect_type, id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Inspection details updated successfully" });
  });
});

// Delete an inventory item
app.delete("/inventory/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM inventory WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item deleted successfully" });
  });
});

// Get analytics data for AI Analysis
app.get("/analytics", (req, res) => {
  db.query("SELECT * FROM analytics", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get inventory statistics
app.get("/inventory/stats", (req, res) => {
  const queries = {
    total: "SELECT COUNT(*) as count FROM inventory",
    byType: "SELECT item_type, COUNT(*) as count FROM inventory GROUP BY item_type",
    defective: "SELECT COUNT(*) as count FROM inventory WHERE defect_type IS NOT NULL AND defect_type != ''",
    pendingInspection: "SELECT COUNT(*) as count FROM inventory WHERE inspection_date IS NULL",
    warrantyExpired: "SELECT COUNT(*) as count FROM inventory WHERE DATE_ADD(manufacture_date, INTERVAL CAST(SUBSTRING_INDEX(warranty_period, ' ', 1) AS UNSIGNED) YEAR) < CURDATE()"
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result;
      }
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// ML Prediction endpoint using part-data.csv
app.post("/ml/predict", (req, res) => {
  const { vendor_id, part_type, material, lifetime, region, route_type } = req.body;
  
  console.log('ML Prediction request:', req.body);
  
  const args = [
    'ml_predict.py',
    vendor_id || '100',
    part_type || 'Rail Clips',
    material || '1', 
    lifetime || '1000',
    region || 'North',
    route_type || 'Passenger'
  ];
  
  console.log('Python args:', args);
  
  const python = spawn('python', args);
  
  let result = '';
  let errorOutput = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  python.on('close', (code) => {
    console.log('Python exit code:', code);
    console.log('Python stdout:', result);
    console.log('Python stderr:', errorOutput);
    
    try {
      const prediction = JSON.parse(result);
      res.json(prediction);
    } catch (error) {
      console.error('ML Prediction Error:', error);
      res.json({
        prediction: 'ERROR',
        probability: 0,
        status: 'error',
        error: `Python execution failed. Code: ${code}, Error: ${errorOutput || error.message}`,
        debug_info: {
          result: result,
          errorOutput: errorOutput,
          exitCode: code
        }
      });
    }
  });
});

// Lifetime Prediction endpoint
app.post("/ml/lifetime-predict", (req, res) => {
  const { 
    vendor_id, part_type, lot_number, material, warranty_years, 
    region, route_type, days_manuf_to_install, days_install_to_inspect 
  } = req.body;
  
  const python = spawn('python', [
    'lifetime_predict.py',
    vendor_id || '100',
    part_type || 'Rail Clips',
    lot_number || '1001',
    material || '1',
    warranty_years || '2',
    region || 'North',
    route_type || 'Passenger',
    days_manuf_to_install || '30',
    days_install_to_inspect || '90'
  ]);
  
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    try {
      const prediction = JSON.parse(result);
      res.json(prediction);
    } catch (error) {
      res.json({
        predicted_lifetime_days: 1000,
        predicted_lifetime_years: 2.7,
        confidence: 50.0,
        model_type: 'Fallback',
        insights: ['Model unavailable'],
        risk_assessment: 'Medium',
        maintenance_schedule: []
      });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});