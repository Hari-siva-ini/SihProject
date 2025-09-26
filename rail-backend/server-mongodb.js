require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require("cors");

const Inventory = require('./models/Inventory');
const Analytics = require('./models/Analytics');

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

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB Atlas database."))
  .catch(err => console.error("Database connection failed:", err));

// Test route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Get all inventory items
app.get("/inventory", async (req, res) => {
  try {
    const results = await Inventory.find();
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get item details by ID
app.get("/inventory/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Add new inventory item
app.post("/inventory", async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    res.json({ message: "Item added successfully", id: savedItem._id });
  } catch (err) {
    res.status(500).json(err);
  }
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
app.put("/inventory/:id", async (req, res) => {
  try {
    const { inspector_code, inspection_date, defect_type } = req.body;
    await Inventory.findByIdAndUpdate(req.params.id, {
      inspector_code,
      inspection_date,
      defect_type
    });
    res.json({ message: "Inspection details updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete an inventory item
app.delete("/inventory/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get analytics data for AI Analysis
app.get("/analytics", async (req, res) => {
  try {
    const results = await Analytics.find();
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get inventory statistics
app.get("/inventory/stats", async (req, res) => {
  try {
    const total = await Inventory.countDocuments();
    const byType = await Inventory.aggregate([
      { $group: { _id: "$item_type", count: { $sum: 1 } } }
    ]);
    const defective = await Inventory.countDocuments({ 
      defect_type: { $exists: true, $ne: "" } 
    });
    const pendingInspection = await Inventory.countDocuments({ 
      inspection_date: { $exists: false } 
    });
    
    // Calculate warranty expired items
    const currentDate = new Date();
    const warrantyExpired = await Inventory.countDocuments({
      $expr: {
        $lt: [
          {
            $dateAdd: {
              startDate: "$manufacture_date",
              unit: "year",
              amount: {
                $toInt: { $substr: ["$warranty_period", 0, 1] }
              }
            }
          },
          currentDate
        ]
      }
    });

    res.json({
      total: [{ count: total }],
      byType: byType.map(item => ({ item_type: item._id, count: item.count })),
      defective: [{ count: defective }],
      pendingInspection: [{ count: pendingInspection }],
      warrantyExpired: [{ count: warrantyExpired }]
    });
  } catch (err) {
    res.status(500).json(err);
  }
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