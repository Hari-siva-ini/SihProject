import json
import sys
import csv

try:
    # Get command line arguments
    vendor_id = sys.argv[1] if len(sys.argv) > 1 else '100'
    part_type = sys.argv[2] if len(sys.argv) > 2 else 'Rail Clips'
    material = sys.argv[3] if len(sys.argv) > 3 else '1'
    lifetime = sys.argv[4] if len(sys.argv) > 4 else '1000'
    region = sys.argv[5] if len(sys.argv) > 5 else 'North'
    route_type = sys.argv[6] if len(sys.argv) > 6 else 'Passenger'
    
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
    region_map = {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}
    route_map = {'High Speed': 1, 'Passenger': 2, 'Freight': 3}
    
    vendor_id_num = int(vendor_id)
    part_type_num = part_map.get(part_type, 1)
    material_num = int(material)
    lifetime_num = int(lifetime)
    region_num = region_map.get(region, 1)
    route_num = route_map.get(route_type, 2)
    
    # REAL DATA ANALYSIS FROM CSV
    
    # 1. Analyze vendor performance
    vendor_data = [row for row in data if row['Vendor ID'] == vendor_id_num]
    if vendor_data:
        vendor_defects = sum(row['Defect'] for row in vendor_data)
        vendor_defect_rate = (vendor_defects / len(vendor_data)) * 100
        vendor_avg_lifetime = sum(row['Lifetime (Days)'] for row in vendor_data) / len(vendor_data)
    else:
        vendor_defect_rate = 20.0  # Unknown vendor = higher risk
        vendor_avg_lifetime = 1000
    
    # 2. Analyze part type performance from actual data
    part_data = [row for row in data if row['Part type'] == part_type_num]
    part_defect_rate = (sum(row['Defect'] for row in part_data) / len(part_data)) * 100 if part_data else 15.0
    part_avg_lifetime = sum(row['Lifetime (Days)'] for row in part_data) / len(part_data) if part_data else 1200
    
    # 3. Analyze material performance
    material_data = [row for row in data if row['material'] == material_num]
    material_defect_rate = (sum(row['Defect'] for row in material_data) / len(material_data)) * 100 if material_data else 15.0
    
    # 4. Analyze route type impact
    route_data = [row for row in data if row['Route Type'] == route_num]
    route_defect_rate = (sum(row['Defect'] for row in route_data) / len(route_data)) * 100 if route_data else 15.0
    
    # 5. Find exact or similar matches
    exact_matches = [row for row in data if 
                    row['Vendor ID'] == vendor_id_num and 
                    row['Part type'] == part_type_num and 
                    row['material'] == material_num]
    
    similar_matches = [row for row in data if 
                      row['Part type'] == part_type_num and 
                      row['material'] == material_num]
    
    # RISK CALCULATION BASED ON REAL PATTERNS
    risk_score = 0
    risk_factors = []
    
    # Vendor risk (based on actual data)
    if vendor_defect_rate > 30:
        risk_score += 40
        risk_factors.append(f'Vendor {vendor_id} has high defect rate: {vendor_defect_rate:.1f}%')
    elif vendor_defect_rate > 15:
        risk_score += 25
        risk_factors.append(f'Vendor {vendor_id} shows elevated defect rate: {vendor_defect_rate:.1f}%')
    elif vendor_defect_rate > 0:
        risk_score += 10
        risk_factors.append(f'Vendor {vendor_id} has some defects: {vendor_defect_rate:.1f}%')
    else:
        risk_score -= 5
        risk_factors.append(f'Vendor {vendor_id} has perfect record (0% defects)')
    
    # Part type risk (from actual CSV data)
    if part_defect_rate > 25:
        risk_score += 30
        risk_factors.append(f'{part_type} components show high failure rate: {part_defect_rate:.1f}%')
    elif part_defect_rate > 10:
        risk_score += 15
        risk_factors.append(f'{part_type} components have moderate failure rate: {part_defect_rate:.1f}%')
    elif part_defect_rate == 0:
        risk_score -= 10
        risk_factors.append(f'{part_type} components have perfect record in data')
    
    # Material risk (from actual data)
    if material_defect_rate > 30:
        risk_score += 25
        risk_factors.append(f'Material {material_num} shows high failure rate: {material_defect_rate:.1f}%')
    elif material_defect_rate > 15:
        risk_score += 15
        risk_factors.append(f'Material {material_num} has elevated failure rate: {material_defect_rate:.1f}%')
    elif material_defect_rate == 0:
        risk_score -= 5
        risk_factors.append(f'Material {material_num} has excellent record')
    
    # Route type risk (from actual data)
    if route_defect_rate > 25:
        risk_score += 20
        risk_factors.append(f'{route_type} routes show higher failure rates: {route_defect_rate:.1f}%')
    elif route_defect_rate > 10:
        risk_score += 10
        risk_factors.append(f'{route_type} routes have moderate failure rates: {route_defect_rate:.1f}%')
    
    # Lifetime expectation vs reality
    expected_lifetime = part_avg_lifetime if part_data else 1200
    lifetime_ratio = lifetime_num / expected_lifetime
    
    if lifetime_ratio > 2.0:  # Expecting much more than typical
        risk_score += 35
        risk_factors.append(f'Expected lifetime ({lifetime_num} days) far exceeds typical {part_type} performance ({expected_lifetime:.0f} days)')
    elif lifetime_ratio > 1.5:
        risk_score += 25
        risk_factors.append(f'Expected lifetime significantly above average for {part_type}')
    elif lifetime_ratio > 1.2:
        risk_score += 10
        risk_factors.append(f'Expected lifetime above average for {part_type}')
    elif lifetime_ratio < 0.5:
        risk_score += 20
        risk_factors.append(f'Very short expected lifetime may indicate quality issues')
    elif lifetime_ratio < 0.8:
        risk_score += 10
        risk_factors.append(f'Below-average expected lifetime')
    
    # Exact match analysis
    if exact_matches:
        exact_defect_rate = (sum(row['Defect'] for row in exact_matches) / len(exact_matches)) * 100
        if exact_defect_rate > 50:
            risk_score += 40
            risk_factors.append(f'Identical components in data show {exact_defect_rate:.1f}% failure rate')
        elif exact_defect_rate > 0:
            risk_score += 20
            risk_factors.append(f'Identical components show {exact_defect_rate:.1f}% defect rate')
        else:
            risk_score -= 15
            risk_factors.append(f'Identical components have perfect record ({len(exact_matches)} samples)')
    
    # Similar match analysis
    elif similar_matches:
        similar_defect_rate = (sum(row['Defect'] for row in similar_matches) / len(similar_matches)) * 100
        if similar_defect_rate > 30:
            risk_score += 25
            risk_factors.append(f'Similar components show {similar_defect_rate:.1f}% failure rate')
        elif similar_defect_rate > 10:
            risk_score += 15
            risk_factors.append(f'Similar components have {similar_defect_rate:.1f}% defect rate')
    
    # Final prediction based on comprehensive risk score
    risk_score = max(0, min(100, risk_score))  # Clamp between 0-100
    
    if risk_score >= 70:
        prediction = 'HIGH RISK'
        status = 'fail'
        confidence = min(95, 70 + (risk_score - 70) * 0.8)
    elif risk_score >= 40:
        prediction = 'MODERATE RISK'
        status = 'warning'
        confidence = 50 + (risk_score - 40) * 0.6
    elif risk_score >= 15:
        prediction = 'LOW RISK'
        status = 'pass'
        confidence = 75 + (15 - risk_score) * 0.8
    else:
        prediction = 'APPROVED'
        status = 'pass'
        confidence = min(95, 85 + (15 - risk_score) * 0.5)
    
    # Generate data-driven recommendations
    recommendations = []
    if status == 'fail':
        recommendations = [
            f'HIGH FAILURE RISK: {confidence:.1f}% confidence',
            'Strongly recommend alternative vendor/specification',
            'Mandatory enhanced quality testing required',
            'Consider different material grade or part type',
            'Immediate inspection required if installed'
        ]
        if exact_matches:
            recommendations.append(f'Historical data shows {len(exact_matches)} identical components with issues')
    elif status == 'warning':
        recommendations = [
            f'MODERATE RISK: {confidence:.1f}% confidence',
            'Enhanced monitoring recommended',
            'Increase inspection frequency by 100%',
            'Consider backup components',
            'Document performance closely'
        ]
    else:
        recommendations = [
            f'COMPONENT APPROVED: {confidence:.1f}% confidence',
            'Follow standard maintenance procedures',
            'Regular monitoring as scheduled',
            f'Expected service life: {expected_lifetime/365:.1f} years'
        ]
        if vendor_defect_rate == 0:
            recommendations.append('Vendor has excellent quality track record')
    
    result = {
        'prediction': prediction,
        'probability': round(confidence, 1),
        'status': status,
        'risk_score': round(risk_score, 1),
        'risk_factors': risk_factors,
        'historical_performance': {
            'historical_defect_rate': round(vendor_defect_rate, 2),
            'total_parts_supplied': len(vendor_data),
            'avg_lifetime': round(vendor_avg_lifetime / 365, 1),
            'part_type_defect_rate': round(part_defect_rate, 2),
            'material_defect_rate': round(material_defect_rate, 2),
            'route_defect_rate': round(route_defect_rate, 2),
            'exact_matches': len(exact_matches),
            'similar_matches': len(similar_matches)
        },
        'recommendations': recommendations,
        'model_info': {
            'model_type': 'Real Data Analysis Model',
            'features_used': 7,
            'training_data_size': len(data),
            'data_patterns': f'Analyzed {len(data)} real components'
        }
    }
    
except Exception as e:
    result = {'error': str(e)}

print(json.dumps(result))