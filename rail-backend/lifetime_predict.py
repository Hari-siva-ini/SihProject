import json
import sys
import csv

try:
    # Get command line arguments
    vendor_id = sys.argv[1] if len(sys.argv) > 1 else '100'
    part_type = sys.argv[2] if len(sys.argv) > 2 else 'Rail Clips'
    lot_number = sys.argv[3] if len(sys.argv) > 3 else '1001'
    material = sys.argv[4] if len(sys.argv) > 4 else '1'
    warranty_years = sys.argv[5] if len(sys.argv) > 5 else '2'
    region = sys.argv[6] if len(sys.argv) > 6 else 'North'
    route_type = sys.argv[7] if len(sys.argv) > 7 else 'Passenger'
    days_manuf_to_install = sys.argv[8] if len(sys.argv) > 8 else '30'
    days_install_to_inspect = sys.argv[9] if len(sys.argv) > 9 else '90'
    
    # Load CSV data
    data = []
    with open('part-data.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append({
                'Vendor ID': int(row['Vendor ID']),
                'Part type': int(row['Part type']),
                'material': int(row['material']),
                'Defect': int(row['Defect']),
                'Lifetime (Days)': int(row['Lifetime (Days)']),
                'Region': int(row['Region']),
                'Route Type': int(row['Route Type']),
                'Warranty (Years)': int(row['Warranty (Years)'])
            })
    
    # Map inputs
    part_map = {'Rail Clips': 1, 'Rubber Pad': 2, 'Sleeper': 3, 'Liner': 4}
    region_map = {'North': 1, 'South': 2, 'East': 3, 'West': 4, 'Central': 5}
    route_map = {'High Speed': 1, 'Passenger': 2, 'Freight': 3}
    
    vendor_id_num = int(vendor_id)
    part_type_num = part_map.get(part_type, 1)
    material_num = int(material)
    warranty_years_num = int(warranty_years)
    region_num = region_map.get(region, 1)
    route_num = route_map.get(route_type, 2)
    
    # Analyze similar components from CSV data
    # Priority 1: Same vendor + part type + material
    exact_matches = [row for row in data if 
                    row['Vendor ID'] == vendor_id_num and
                    row['Part type'] == part_type_num and
                    row['material'] == material_num]
    
    # Priority 2: Same part type + material (any vendor)
    similar_parts = [row for row in data if 
                    row['Part type'] == part_type_num and
                    row['material'] == material_num]
    
    # Priority 3: Same part type (any material/vendor)
    part_type_data = [row for row in data if row['Part type'] == part_type_num]
    
    # Calculate base lifetime from historical data
    if exact_matches:
        base_lifetime = sum(row['Lifetime (Days)'] for row in exact_matches) / len(exact_matches)
        defect_rate = (sum(row['Defect'] for row in exact_matches) / len(exact_matches)) * 100
        data_source = f"exact matches ({len(exact_matches)} components)"
        confidence_base = 90
    elif similar_parts:
        base_lifetime = sum(row['Lifetime (Days)'] for row in similar_parts) / len(similar_parts)
        defect_rate = (sum(row['Defect'] for row in similar_parts) / len(similar_parts)) * 100
        data_source = f"similar components ({len(similar_parts)} components)"
        confidence_base = 75
    elif part_type_data:
        base_lifetime = sum(row['Lifetime (Days)'] for row in part_type_data) / len(part_type_data)
        defect_rate = (sum(row['Defect'] for row in part_type_data) / len(part_type_data)) * 100
        data_source = f"part type average ({len(part_type_data)} components)"
        confidence_base = 60
    else:
        base_lifetime = 1200  # Default fallback
        defect_rate = 10.0
        data_source = "default estimate (no historical data)"
        confidence_base = 40
    
    # Apply adjustment factors based on input parameters
    lifetime_adjustment = 0
    insights = []
    
    # Route type impact on lifetime
    route_factors = {1: -0.25, 2: 0, 3: -0.15}  # High Speed: -25%, Passenger: 0%, Freight: -15%
    route_factor = route_factors.get(route_num, 0)
    if route_factor != 0:
        lifetime_adjustment += base_lifetime * route_factor
        if route_factor < 0:
            insights.append(f"{route_type} operations reduce lifetime by {abs(route_factor)*100:.0f}%")
    
    # Material quality impact
    if material_num <= 2:
        lifetime_adjustment += base_lifetime * 0.15
        insights.append("High-quality materials extend component lifetime")
    elif material_num >= 8:
        lifetime_adjustment -= base_lifetime * 0.20
        insights.append("Material grade may reduce expected lifetime")
    
    # Warranty correlation (longer warranty usually means better quality)
    warranty_factor = (warranty_years_num - 2) * 0.1  # Each year above/below 2 years = 10% change
    if abs(warranty_factor) > 0:
        lifetime_adjustment += base_lifetime * warranty_factor
        if warranty_factor > 0:
            insights.append(f"Extended {warranty_years_num}-year warranty indicates higher quality")
        else:
            insights.append(f"Short {warranty_years_num}-year warranty may indicate lower durability")
    
    # Regional factors (some regions may have harsher conditions)
    regional_factors = {1: 0, 2: -0.05, 3: -0.10, 4: 0.05, 5: 0}  # Adjust based on climate/conditions
    regional_factor = regional_factors.get(region_num, 0)
    if regional_factor != 0:
        lifetime_adjustment += base_lifetime * regional_factor
        if regional_factor < 0:
            insights.append(f"{region} region conditions may reduce component life")
        elif regional_factor > 0:
            insights.append(f"{region} region conditions favor longer component life")
    
    # Manufacturing to installation delay impact
    manuf_delay = int(days_manuf_to_install)
    if manuf_delay > 90:
        lifetime_adjustment -= base_lifetime * 0.05
        insights.append("Extended storage before installation may affect performance")
    elif manuf_delay < 15:
        lifetime_adjustment += base_lifetime * 0.02
        insights.append("Quick installation after manufacturing is beneficial")
    
    # Calculate final prediction
    predicted_lifetime_days = max(180, base_lifetime + lifetime_adjustment)  # Minimum 6 months
    predicted_lifetime_years = predicted_lifetime_days / 365
    predicted_lifetime_hours = predicted_lifetime_days * 24
    
    # Adjust confidence based on data quality and defect rate
    confidence = confidence_base
    if defect_rate > 20:
        confidence -= 20
        insights.append("High defect rate in historical data reduces confidence")
    elif defect_rate < 5:
        confidence += 10
        insights.append("Low defect rate in historical data increases confidence")
    
    # Risk assessment
    if defect_rate > 15:
        risk_assessment = "High"
        insights.append("Component type shows elevated failure risk")
    elif defect_rate > 8:
        risk_assessment = "Medium"
        insights.append("Component type shows moderate failure risk")
    else:
        risk_assessment = "Low"
        insights.append("Component type shows low failure risk")
    
    # Generate maintenance schedule based on predicted lifetime
    maintenance_schedule = [
        {"type": "Initial Inspection", "days_from_install": 30},
        {"type": "First Maintenance", "days_from_install": int(predicted_lifetime_days * 0.15)},
        {"type": "Quarter-life Check", "days_from_install": int(predicted_lifetime_days * 0.25)},
        {"type": "Mid-life Inspection", "days_from_install": int(predicted_lifetime_days * 0.5)},
        {"type": "Three-quarter Check", "days_from_install": int(predicted_lifetime_days * 0.75)},
        {"type": "Pre-replacement Inspection", "days_from_install": int(predicted_lifetime_days * 0.9)},
        {"type": "Replacement Due", "days_from_install": int(predicted_lifetime_days)}
    ]
    
    result = {
        'predicted_lifetime_days': int(predicted_lifetime_days),
        'predicted_lifetime_years': round(predicted_lifetime_years, 1),
        'predicted_lifetime_hours': int(predicted_lifetime_hours),
        'confidence': round(min(95, max(40, confidence)), 1),
        'model_type': 'Data-Driven Lifetime Prediction',
        'insights': insights,
        'risk_assessment': risk_assessment,
        'maintenance_schedule': maintenance_schedule,
        'historical_data': {
            'data_source': data_source,
            'base_lifetime_days': round(base_lifetime, 0),
            'defect_rate': round(defect_rate, 2),
            'total_adjustments_days': round(lifetime_adjustment, 0)
        },
        'analysis_factors': {
            'route_impact': f"{route_factor*100:+.0f}%" if route_factor != 0 else "No impact",
            'material_impact': "Positive" if material_num <= 2 else "Negative" if material_num >= 8 else "Neutral",
            'warranty_correlation': f"{warranty_factor*100:+.0f}%" if abs(warranty_factor) > 0 else "Standard",
            'regional_factor': f"{regional_factor*100:+.0f}%" if regional_factor != 0 else "Neutral"
        }
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))