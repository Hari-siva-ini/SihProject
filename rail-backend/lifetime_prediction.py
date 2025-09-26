import pickle
import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime, timedelta

def load_lifetime_model():
    """Load the trained lifetime prediction model"""
    try:
        with open('lifetime_model.pkl', 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        raise Exception(f"Error loading lifetime model: {str(e)}")

def predict_lifetime(vendor_id, part_type, lot_number, material, warranty_years, region, route_type, days_manuf_to_install=30, days_install_to_inspect=90):
    """
    Predict component lifetime using the trained model
    
    Features expected by model:
    ['Index', 'Vendor ID', 'Part type', 'lot', 'material', 'Warrenty', 'Region', 'Route Type', 'days_manuf_to_install', 'days_install_to_inspect']
    """
    try:
        model = load_lifetime_model()
        
        # Map string inputs to numeric values
        part_type_map = {'Rail Clips': 1, 'Rubber Pad': 2, 'Sleeper': 3, 'Liner': 4}
        region_map = {'North': 1, 'South': 2, 'East': 3, 'West': 4, 'Central': 5, 'Northeast': 6, 'Northwest': 7, 'Southeast': 8}
        route_type_map = {'High Speed': 1, 'Passenger': 2, 'Freight': 3, 'Mixed': 4}
        
        # Convert inputs to numeric
        part_type_num = part_type_map.get(part_type, 1) if isinstance(part_type, str) else part_type
        region_num = region_map.get(region, 1) if isinstance(region, str) else region
        route_type_num = route_type_map.get(route_type, 2) if isinstance(route_type, str) else route_type
        
        # Create feature array matching model expectations
        features = np.array([[
            0,  # Index (placeholder)
            int(vendor_id),
            int(part_type_num),
            int(lot_number),
            int(material),
            int(warranty_years),
            int(region_num),
            int(route_type_num),
            int(days_manuf_to_install),
            int(days_install_to_inspect)
        ]])
        
        # Make prediction (result is in hours)
        predicted_lifetime_hours = model.predict(features)[0]
        
        # Convert hours to days and years
        predicted_lifetime_days = predicted_lifetime_hours / 24
        predicted_lifetime_years = predicted_lifetime_days / 365.25
        
        # Calculate confidence
        confidence = min(95.0, max(60.0, 100 - abs(predicted_lifetime_hours - 8760) / 500))
        
        # Generate insights
        insights = generate_lifetime_insights(predicted_lifetime_hours, vendor_id, part_type, region, route_type)
        
        return {
            'predicted_lifetime_hours': round(predicted_lifetime_hours, 1),
            'predicted_lifetime_days': round(predicted_lifetime_days, 1),
            'predicted_lifetime_years': round(predicted_lifetime_years, 2),
            'confidence': round(confidence, 1),
            'model_type': 'VotingRegressor (Ensemble)',
            'insights': insights,
            'risk_assessment': assess_lifetime_risk(predicted_lifetime_hours),
            'maintenance_schedule': generate_maintenance_schedule(predicted_lifetime_hours)
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'predicted_lifetime_hours': 24000,
            'predicted_lifetime_days': 1000,
            'predicted_lifetime_years': 2.7,
            'confidence': 50.0,
            'model_type': 'Fallback',
            'insights': ['Lifetime prediction model unavailable'],
            'risk_assessment': 'Medium',
            'maintenance_schedule': []
        }

def generate_lifetime_insights(lifetime_hours, vendor_id, part_type, region, route_type):
    """Generate insights based on predicted lifetime in hours"""
    insights = []
    
    lifetime_years = lifetime_hours / (24 * 365.25)
    
    if lifetime_years < 2:
        insights.append(f"⚠️ Short predicted lifetime ({lifetime_years:.1f} years)")
        insights.append("Consider alternative vendor or material")
    elif lifetime_years > 8:
        insights.append(f"✅ Excellent predicted lifetime ({lifetime_years:.1f} years)")
        insights.append("Component expected to perform well")
    else:
        insights.append(f"📊 Standard predicted lifetime ({lifetime_years:.1f} years)")
        insights.append("Component meets typical performance expectations")
    
    # Route-specific insights
    if route_type in ['High Speed', 1]:
        insights.append("🚄 High-speed route may reduce actual lifetime by 10-15%")
    elif route_type in ['Freight', 3]:
        insights.append("🚛 Heavy freight loads may impact component durability")
    
    # Regional insights
    if region in ['North', 'Northeast', 1, 6]:
        insights.append("❄️ Cold climate may affect material properties")
    elif region in ['South', 'Southeast', 2, 8]:
        insights.append("🌡️ Hot climate considerations for material expansion")
    
    return insights

def assess_lifetime_risk(lifetime_hours):
    """Assess risk level based on predicted lifetime in hours"""
    lifetime_years = lifetime_hours / (24 * 365.25)
    
    if lifetime_years < 1.5:
        return 'High'
    elif lifetime_years < 3:
        return 'Medium'
    elif lifetime_years < 6:
        return 'Low'
    else:
        return 'Very Low'

def generate_maintenance_schedule(lifetime_hours):
    """Generate maintenance schedule based on predicted lifetime in hours"""
    lifetime_years = lifetime_hours / (24 * 365.25)
    lifetime_days = lifetime_hours / 24
    
    schedule = []
    
    # Initial inspection
    schedule.append({
        'type': 'Initial Inspection',
        'days_from_install': 30,
        'description': 'Post-installation verification'
    })
    
    # Regular inspections based on lifetime
    if lifetime_years < 2:
        inspection_intervals = [90, 180, 270, 360]
    elif lifetime_years < 5:
        inspection_intervals = [180, 365, 545, 730]
    else:
        inspection_intervals = [365, 730, 1095, 1460]
    
    for i, interval in enumerate(inspection_intervals):
        if interval < lifetime_days:
            schedule.append({
                'type': f'Scheduled Inspection #{i+1}',
                'days_from_install': interval,
                'description': f'Routine maintenance check at {interval/365.25:.1f} years'
            })
    
    # Pre-replacement inspection
    if lifetime_days > 365:
        schedule.append({
            'type': 'Pre-Replacement Inspection',
            'days_from_install': int(lifetime_days * 0.9),
            'description': 'Final inspection before expected replacement'
        })
    
    return schedule

def main():
    try:
        # Get input parameters from command line
        vendor_id = int(sys.argv[1]) if len(sys.argv) > 1 else 100
        part_type = sys.argv[2] if len(sys.argv) > 2 else "Rail Clips"
        lot_number = int(sys.argv[3]) if len(sys.argv) > 3 else 1001
        material = int(sys.argv[4]) if len(sys.argv) > 4 else 1
        warranty_years = int(sys.argv[5]) if len(sys.argv) > 5 else 2
        region = sys.argv[6] if len(sys.argv) > 6 else "North"
        route_type = sys.argv[7] if len(sys.argv) > 7 else "Passenger"
        days_manuf_to_install = int(sys.argv[8]) if len(sys.argv) > 8 else 30
        days_install_to_inspect = int(sys.argv[9]) if len(sys.argv) > 9 else 90
        
        # Make prediction
        result = predict_lifetime(
            vendor_id, part_type, lot_number, material, warranty_years,
            region, route_type, days_manuf_to_install, days_install_to_inspect
        )
        
        print(json.dumps(result))
        
    except Exception as e:
        fallback_result = {
            'error': str(e),
            'predicted_lifetime_hours': 24000,
            'predicted_lifetime_days': 1000,
            'predicted_lifetime_years': 2.7,
            'confidence': 50.0,
            'model_type': 'Error Fallback',
            'insights': ['Lifetime prediction failed', 'Using default estimates'],
            'risk_assessment': 'Unknown',
            'maintenance_schedule': []
        }
        print(json.dumps(fallback_result))

if __name__ == "__main__":
    main()