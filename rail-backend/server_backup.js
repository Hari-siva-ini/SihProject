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

  // For demo, store password in .env (example: INSPECTOR_PASSWORD=1234)
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

// AI Defect Detection endpoint
app.post("/ai/analyze", (req, res) => {
  const { imageData } = req.body;
  
  // Simulate AI model processing
  setTimeout(() => {
    const defectProbability = Math.random();
    const isDefective = defectProbability > 0.5;
    
    const recommendations = isDefective ? [
      "Immediate replacement required",
      "Schedule urgent maintenance",
      "Isolate affected track section"
    ] : [
      "Component in good condition",
      "Continue regular monitoring",
      "Next inspection in 6 months"
    ];
    
    res.json({
      defect_probability: defectProbability,
      is_defective: isDefective,
      recommendations,
      confidence: (defectProbability * 100).toFixed(1)
    });
  }, 1500);
});

// Get all vendor recommendations
app.get("/vendor/all", (req, res) => {
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    import os
    csv_path = os.path.join(os.path.dirname(__file__), 'part-data.csv')
    df = pd.read_csv(csv_path)
    
    # Calculate vendor performance for all parts
    vendor_stats = (
        df.groupby('Vendor ID')['Defect']
        .agg(['count', 'sum'])
        .rename(columns={'count': 'Total', 'sum': 'Defects'})
    )
    vendor_stats['Defect_Rate'] = (vendor_stats['Defects'] / vendor_stats['Total']) * 100
    vendor_stats = vendor_stats.sort_values('Defect_Rate')
    
    # Get top 5 vendors for chart
    top_vendors = vendor_stats.head(5).reset_index()
    total_inspections = top_vendors['Total'].sum()
    
    chart_data = []
    for _, row in top_vendors.iterrows():
        chart_data.append({
            'vendor_id': str(row['Vendor ID']),
            'percentage': (row['Total'] / total_inspections) * 100,
            'defect_rate': round(row['Defect_Rate'], 2)
        })
    
    # Get best vendor for each part type
    part_recommendations = []
    for part_type in [1, 2, 3, 4]:
        part_name = {1: 'Rail Clips', 2: 'Rubber Pad', 3: 'Sleeper', 4: 'Liner'}[part_type]
        part_df = df[df['Part type'] == part_type]
        if not part_df.empty:
            part_vendor_stats = (
                part_df.groupby('Vendor ID')['Defect']
                .agg(['count', 'sum'])
                .rename(columns={'count': 'Total', 'sum': 'Defects'})
            )
            part_vendor_stats['Defect_Rate'] = (part_vendor_stats['Defects'] / part_vendor_stats['Total']) * 100
            best_vendor = part_vendor_stats.sort_values('Defect_Rate').index[0]
            
            part_recommendations.append({
                'part_type': part_name,
                'best_vendor': str(best_vendor),
                'defect_rate': round(part_vendor_stats.loc[best_vendor, 'Defect_Rate'], 2),
                'quality_score': round(10 - (part_vendor_stats.loc[best_vendor, 'Defect_Rate'] / 10), 1)
            })
    
    result = {
        'chart_data': chart_data,
        'recommendations': part_recommendations
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_all_vendors.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const vendorData = JSON.parse(result);
      res.json(vendorData);
    } catch (error) {
      res.status(500).json({ error: 'Vendor analysis failed' });
    }
  });
});

// ML Failure Prediction endpoint
app.post("/ml/predict", (req, res) => {
  const { vendor_id, part_type, material, lifetime, region, route_type } = req.body;
  
  const python = spawn('python', ['enhanced_ml_prediction.py', vendor_id, part_type, material, lifetime, region, route_type]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  
  python.on('close', (code) => {
    try {
      const prediction = JSON.parse(result);
      res.json(prediction);
    } catch (error) {
      console.error('Prediction parsing error:', error);
      res.status(500).json({ error: 'Prediction failed', details: result });
    }
  });
});

// ML Failure Analysis endpoint
app.get("/ml/failure-analysis", (req, res) => {
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    df = pd.read_csv('part-data.csv')
    
    # Overall statistics
    total_parts = len(df)
    total_defects = df['Defect'].sum()
    overall_defect_rate = round((total_defects / total_parts) * 100, 2)
    
    # Part type analysis
    part_type_analysis = []
    part_names = {1: 'Rail Clips', 2: 'Rubber Pad', 3: 'Sleeper', 4: 'Liner'}
    
    for part_type in [1, 2, 3, 4]:
        part_df = df[df['Part type'] == part_type]
        if not part_df.empty:
            defects = part_df['Defect'].sum()
            total = len(part_df)
            defect_rate = round((defects / total) * 100, 2)
            
            part_type_analysis.append({
                'part_type': part_names[part_type],
                'total_parts': total,
                'defects': defects,
                'defect_rate': defect_rate
            })
    
    # Vendor analysis
    vendor_analysis = []
    top_vendors = df['Vendor ID'].value_counts().head(5)
    
    for vendor_id in top_vendors.index:
        vendor_df = df[df['Vendor ID'] == vendor_id]
        defects = vendor_df['Defect'].sum()
        total = len(vendor_df)
        defect_rate = round((defects / total) * 100, 2)
        
        vendor_analysis.append({
            'vendor_id': vendor_id,
            'total_parts': total,
            'defects': defects,
            'defect_rate': defect_rate
        })
    
    result = {
        'overall_stats': {
            'total_parts': total_parts,
            'total_defects': total_defects,
            'overall_defect_rate': overall_defect_rate
        },
        'part_type_analysis': part_type_analysis,
        'vendor_analysis': vendor_analysis
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_failure_analysis.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const analysisData = JSON.parse(result);
      res.json(analysisData);
    } catch (error) {
      res.status(500).json({ error: 'Analysis failed' });
    }
  });
});

// ML Failure Prediction endpoint
app.post("/ml/predict", (req, res) => {
  const { vendor_id, part_type, material, lifetime, region, route_type } = req.body;
  
  const python = spawn('python', ['enhanced_ml_prediction.py', vendor_id, part_type, material, lifetime, region, route_type]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  
  python.on('close', (code) => {
    try {
      const prediction = JSON.parse(result);
      res.json(prediction);
    } catch (error) {
      console.error('Prediction parsing error:', error);
      res.status(500).json({ error: 'Prediction failed', details: result });
    }
  });
});

// ML Failure Analysis endpoint
app.get("/ml/failure-analysis", (req, res) => {
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    df = pd.read_csv('part-data.csv')
    
    # Overall statistics
    total_parts = len(df)
    total_defects = df['Defect'].sum()
    overall_defect_rate = round((total_defects / total_parts) * 100, 2)
    
    # Part type analysis
    part_type_analysis = []
    part_names = {1: 'Rail Clips', 2: 'Rubber Pad', 3: 'Sleeper', 4: 'Liner'}
    
    for part_type in [1, 2, 3, 4]:
        part_df = df[df['Part type'] == part_type]
        if not part_df.empty:
            defects = part_df['Defect'].sum()
            total = len(part_df)
            defect_rate = round((defects / total) * 100, 2)
            
            part_type_analysis.append({
                'part_type': part_names[part_type],
                'total_parts': total,
                'defects': defects,
                'defect_rate': defect_rate
            })
    
    # Vendor analysis
    vendor_analysis = []
    top_vendors = df['Vendor ID'].value_counts().head(5)
    
    for vendor_id in top_vendors.index:
        vendor_df = df[df['Vendor ID'] == vendor_id]
        defects = vendor_df['Defect'].sum()
        total = len(vendor_df)
        defect_rate = round((defects / total) * 100, 2)
        
        vendor_analysis.append({
            'vendor_id': vendor_id,
            'total_parts': total,
            'defects': defects,
            'defect_rate': defect_rate
        })
    
    result = {
        'overall_stats': {
            'total_parts': total_parts,
            'total_defects': total_defects,
            'overall_defect_rate': overall_defect_rate
        },
        'part_type_analysis': part_type_analysis,
        'vendor_analysis': vendor_analysis
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_failure_analysis.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const analysisData = JSON.parse(result);
      res.json(analysisData);
    } catch (error) {
      res.status(500).json({ error: 'Analysis failed' });
    }
  });
});

// Vendor Recommendation endpoint
app.post("/vendor/recommend", (req, res) => {
  const { part_type, material } = req.body;
  
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    import os
    csv_path = os.path.join(os.path.dirname(__file__), 'part-data.csv')
    df = pd.read_csv(csv_path)
    
    # Map part types
    part_map = {'Rail Clips': 1, 'Rubber Pad': 2, 'Sleeper': 3, 'Liner': 4}
    part_num = part_map.get('${part_type}', 1)
    
    # Map materials based on part type
    material_map = {
        1: {'': 1},  # Rail Clips
        2: {'GFN': 2, 'MS': 3, 'GI': 4, 'manganese steel': 5},  # Rubber Pad
        3: {'Concrete': 6, 'Wooden': 7, 'CastIron': 8, 'Steel': 9},  # Sleeper
        4: {'': 10}  # Liner
    }
    
    material_num = material_map.get(part_num, {}).get('${material}', 1)
    
    filtered_df = df[
        (df['Part type'] == part_num) &
        (df['material'] == material_num)
    ]
    
    if filtered_df.empty:
        result = {'error': 'No data found'}
    else:
        vendor_stats = (
            filtered_df.groupby(['Vendor ID', 'Part type'])['Defect']
            .agg(['count', 'sum'])
            .rename(columns={'count': 'Total Inspected', 'sum': 'Defective Count'})
        )
        vendor_stats['Defect Percentage'] = (vendor_stats['Defective Count'] / vendor_stats['Total Inspected']) * 100
        vendor_stats = vendor_stats.round(2)
        vendor_stats = vendor_stats.sort_values(
            by=['Defect Percentage', 'Total Inspected'],
            ascending=[True, False]
        )
        
        # Get top 3 vendors
        top_vendors = vendor_stats.head(3).reset_index()
        
        result = {
            'best_vendor': {
                'vendor_id': str(top_vendors.iloc[0]['Vendor ID']),
                'defect_percentage': float(top_vendors.iloc[0]['Defect Percentage']),
                'total_inspected': int(top_vendors.iloc[0]['Total Inspected'])
            },
            'top_vendors': [
                {
                    'vendor_id': str(row['Vendor ID']),
                    'defect_percentage': float(row['Defect Percentage']),
                    'total_inspected': int(row['Total Inspected'])
                } for _, row in top_vendors.iterrows()
            ]
        }
        
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_vendor.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const vendorData = JSON.parse(result);
      res.json(vendorData);
    } catch (error) {
      res.status(500).json({ error: 'Vendor analysis failed' });
    }
  });
});

// Get all vendor recommendations
app.get("/vendor/all", (req, res) => {
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    import os
    csv_path = os.path.join(os.path.dirname(__file__), 'part-data.csv')
    df = pd.read_csv(csv_path)
    
    # Calculate vendor performance for all parts
    vendor_stats = (
        df.groupby('Vendor ID')['Defect']
        .agg(['count', 'sum'])
        .rename(columns={'count': 'Total', 'sum': 'Defects'})
    )
    vendor_stats['Defect_Rate'] = (vendor_stats['Defects'] / vendor_stats['Total']) * 100
    vendor_stats = vendor_stats.sort_values('Defect_Rate')
    
    # Get top 5 vendors for chart
    top_vendors = vendor_stats.head(5).reset_index()
    total_inspections = top_vendors['Total'].sum()
    
    chart_data = []
    for _, row in top_vendors.iterrows():
        chart_data.append({
            'vendor_id': str(row['Vendor ID']),
            'percentage': (row['Total'] / total_inspections) * 100,
            'defect_rate': round(row['Defect_Rate'], 2)
        })
    
    # Get best vendor for each part type
    part_recommendations = []
    for part_type in [1, 2, 3, 4]:
        part_name = {1: 'Rail Clips', 2: 'Rubber Pad', 3: 'Sleeper', 4: 'Liner'}[part_type]
        part_df = df[df['Part type'] == part_type]
        if not part_df.empty:
            part_vendor_stats = (
                part_df.groupby('Vendor ID')['Defect']
                .agg(['count', 'sum'])
                .rename(columns={'count': 'Total', 'sum': 'Defects'})
            )
            part_vendor_stats['Defect_Rate'] = (part_vendor_stats['Defects'] / part_vendor_stats['Total']) * 100
            best_vendor = part_vendor_stats.sort_values('Defect_Rate').index[0]
            
            part_recommendations.append({
                'part_type': part_name,
                'best_vendor': str(best_vendor),
                'defect_rate': round(part_vendor_stats.loc[best_vendor, 'Defect_Rate'], 2),
                'quality_score': round(10 - (part_vendor_stats.loc[best_vendor, 'Defect_Rate'] / 10), 1)
            })
    
    result = {
        'chart_data': chart_data,
        'recommendations': part_recommendations
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_all_vendors.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const vendorData = JSON.parse(result);
      res.json(vendorData);
    } catch (error) {
      res.status(500).json({ error: 'Vendor analysis failed' });
    }
  });
});

// ML Prediction endpoint using part-data.csv
app.post("/ml/predict", (req, res) => {
  const { vendor_id, part_type, material, lifetime, region, route_type } = req.body;
  
  // Use the new ML prediction script
  const python = spawn('python', [
    'ml_predict.py',
    vendor_id || '1',
    part_type || 'Rail Clips',
    material || '1', 
    lifetime || '1000',
    region || 'North',
    route_type || 'Passenger'
  ]);
  
  let result = '';
  let errorOutput = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  python.on('close', (code) => {
    try {
      const prediction = JSON.parse(result);
      res.json(prediction);
    } catch (error) {
      console.error('ML Prediction Error:', error, errorOutput);
      
      // Enhanced fallback with basic analysis
      const fallbackPrediction = {
        prediction: 'PASS',
        probability: 75.0,
        status: 'pass',
        risk_score: 25,
        risk_factors: ['Model temporarily unavailable'],
        historical_performance: {
          historical_defect_rate: 0,
          total_parts_supplied: 0,
          avg_lifetime: 0
        },
        recommendations: [
          '⚠️ Enhanced ML model temporarily unavailable',
          'Manual inspection recommended for critical components',
          'Standard maintenance schedule should be followed',
          'Contact system administrator if issue persists'
        ],
        model_info: {
          model_type: 'Fallback Mode',
          features_used: 0,
          training_data_size: 0
        },
        error: 'Enhanced prediction unavailable - using fallback'
      };
      
      res.json(fallbackPrediction);
    }
  });
});

// SMS and Email Alert endpoint
app.post("/send-alert", async (req, res) => {
  const { item, alertType, message } = req.body;
  
  try {
    if (alertType === 'SMS') {
      console.log('📱 SMS ALERT SENT!');
      console.log('To: Railway Maintenance Team');
      console.log('Message:', message);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        success: true, 
        message: 'SMS alert sent successfully to maintenance team'
      });
      
    } else if (alertType === 'Email') {
      console.log('📧 EMAIL ALERT SENT!');
      console.log('To: maintenance@indianrailways.gov.in');
      console.log('Message:', message);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({ 
        success: true, 
        message: 'Email alert sent successfully to maintenance team'
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid alert type' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to send ${alertType} alert` });
  }
});

// Get detailed failure analysis from part-data.csv
app.get("/ml/failure-analysis", (req, res) => {
  const pythonScript = `
import pandas as pd
import json
import numpy as np
from datetime import datetime, timedelta

try:
    df = pd.read_csv('part-data.csv')
    
    # Overall failure statistics
    total_parts = len(df)
    total_defects = df['Defect'].sum()
    overall_defect_rate = (total_defects / total_parts) * 100
    
    # Failure by part type
    part_failure = df.groupby('Part type')['Defect'].agg(['count', 'sum']).reset_index()
    part_failure['defect_rate'] = (part_failure['sum'] / part_failure['count']) * 100
    part_names = {1: 'Rail Clips', 2: 'Rubber Pad', 3: 'Sleeper', 4: 'Liner'}
    part_failure['part_name'] = part_failure['Part type'].map(part_names)
    
    # Failure by region
    region_failure = df.groupby('Region')['Defect'].agg(['count', 'sum']).reset_index()
    region_failure['defect_rate'] = (region_failure['sum'] / region_failure['count']) * 100
    region_names = {1: 'North', 2: 'South', 3: 'East', 4: 'West', 5: 'Central', 6: 'Northeast', 7: 'Northwest', 8: 'Southeast'}
    region_failure['region_name'] = region_failure['Region'].map(region_names)
    
    # Failure by route type
    route_failure = df.groupby('Route Type')['Defect'].agg(['count', 'sum']).reset_index()
    route_failure['defect_rate'] = (route_failure['sum'] / route_failure['count']) * 100
    route_names = {1: 'High Speed', 2: 'Passenger', 3: 'Freight'}
    route_failure['route_name'] = route_failure['Route Type'].map(route_names)
    
    # High-risk combinations
    risk_analysis = df.groupby(['Vendor ID', 'Part type'])['Defect'].agg(['count', 'sum']).reset_index()
    risk_analysis['defect_rate'] = (risk_analysis['sum'] / risk_analysis['count']) * 100
    high_risk = risk_analysis[risk_analysis['defect_rate'] > 15].sort_values('defect_rate', ascending=False)
    
    result = {
        'overall_stats': {
            'total_parts': int(total_parts),
            'total_defects': int(total_defects),
            'overall_defect_rate': round(overall_defect_rate, 2)
        },
        'part_type_analysis': [
            {
                'part_type': row['part_name'],
                'total_parts': int(row['count']),
                'defects': int(row['sum']),
                'defect_rate': round(row['defect_rate'], 2)
            } for _, row in part_failure.iterrows()
        ],
        'region_analysis': [
            {
                'region': row['region_name'],
                'total_parts': int(row['count']),
                'defects': int(row['sum']),
                'defect_rate': round(row['defect_rate'], 2)
            } for _, row in region_failure.iterrows() if pd.notna(row['region_name'])
        ],
        'route_analysis': [
            {
                'route_type': row['route_name'],
                'total_parts': int(row['count']),
                'defects': int(row['sum']),
                'defect_rate': round(row['defect_rate'], 2)
            } for _, row in route_failure.iterrows() if pd.notna(row['route_name'])
        ],
        'high_risk_combinations': [
            {
                'vendor_id': int(row['Vendor ID']),
                'part_type': int(row['Part type']),
                'defect_rate': round(row['defect_rate'], 2),
                'total_parts': int(row['count'])
            } for _, row in high_risk.head(10).iterrows()
        ]
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))
`;

  const scriptPath = 'temp_failure_analysis.py';
  fs.writeFileSync(scriptPath, pythonScript);
  
  const python = spawn('python', [scriptPath]);
  let result = '';
  
  python.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  python.on('close', (code) => {
    fs.unlinkSync(scriptPath);
    
    try {
      const analysisData = JSON.parse(result);
      res.json(analysisData);
    } catch (error) {
      res.status(500).json({ error: 'Failure analysis failed' });
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
