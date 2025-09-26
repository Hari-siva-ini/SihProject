# ML Failure Prediction Setup

## Overview
This setup integrates machine learning failure prediction into your Railway QR system using:
- **Pickle Model**: `model_rf_data.pkl` (Random Forest trained model)
- **Training Data**: `part-data.csv` (2500+ historical parts data)
- **Prediction Script**: `enhanced_ml_prediction.py` (Enhanced prediction with risk analysis)

## API Endpoints

### 1. ML Prediction
**POST** `/ml/predict`

**Request Body:**
```json
{
  "vendor_id": "100",
  "part_type": "Rail Clips",
  "material": "1",
  "lifetime": "5",
  "region": "North",
  "route_type": "Passenger"
}
```

**Response:**
```json
{
  "prediction": "PASS",
  "probability": 85.2,
  "status": "pass",
  "risk_score": 25,
  "risk_factors": ["Moderate defect rate: 7.5%"],
  "historical_performance": {
    "historical_defect_rate": 7.5,
    "total_parts_supplied": 120,
    "avg_lifetime": 6.2
  },
  "recommendations": [
    "✅ Component likely to perform well",
    "Continue standard monitoring"
  ]
}
```

### 2. Failure Analysis Dashboard
**GET** `/ml/failure-analysis`

**Response:**
```json
{
  "overall_stats": {
    "total_parts": 2500,
    "total_defects": 625,
    "overall_defect_rate": 25.0
  },
  "part_type_analysis": [...],
  "vendor_analysis": [...]
}
```

## Frontend Integration

The ML prediction is already integrated into your `AIAnalysis.jsx` component in the **"🎯 Enhanced ML Failure Prediction"** section.

### Features:
- ✅ Real-time prediction using Random Forest model
- ✅ Historical performance analysis
- ✅ Risk factor identification
- ✅ Actionable recommendations
- ✅ Confidence scoring
- ✅ Failure analysis dashboard

## Testing

Run the test script to verify everything is working:
```bash
node test_ml_prediction.js
```

## Requirements

### Python Dependencies:
```
pandas
scikit-learn
numpy
pickle5
```

Install with:
```bash
pip install pandas scikit-learn numpy pickle5
```

### Files Required:
- `enhanced_ml_prediction.py` ✅
- `model_rf_data.pkl` ✅
- `part-data.csv` ✅

## Usage in Frontend

The ML prediction form in your AIAnalysis component allows users to:

1. **Input Parameters:**
   - Vendor ID
   - Part Type (Rail Clips, Rubber Pad, Sleeper, Liner)
   - Material ID
   - Expected Lifetime
   - Region (North, South, East, West, Central)
   - Route Type (High Speed, Passenger, Freight, Mixed)

2. **Get Predictions:**
   - Pass/Fail prediction
   - Confidence percentage
   - Risk score (0-100)
   - Historical performance data
   - Specific risk factors
   - Actionable recommendations

3. **View Analysis:**
   - Overall failure statistics
   - Part-type specific analysis
   - Vendor performance metrics

## Model Information

- **Algorithm**: Random Forest Classifier
- **Training Data**: 2500+ historical railway parts
- **Features**: 6 input features (vendor_id, part_type, material, lifetime, region, route_type)
- **Accuracy**: Based on historical defect patterns
- **Output**: Binary classification (Pass/Fail) with probability scores

## Troubleshooting

1. **Python not found**: Ensure Python is installed and in PATH
2. **Module not found**: Install required Python packages
3. **File not found**: Ensure all required files are in the backend directory
4. **Prediction fails**: Check the test script output for detailed error messages

## Next Steps

1. Start your backend server: `npm start`
2. Open your frontend application
3. Navigate to AI Analysis page
4. Use the "Enhanced ML Failure Prediction" section
5. Input component parameters and get real-time predictions!