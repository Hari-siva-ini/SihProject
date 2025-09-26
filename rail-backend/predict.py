import pickle
import pandas as pd
import json
import sys

# Load model
rf = pickle.load(open('model_rf_data.pkl','rb'))

# Get input from command line
vendor_id = int(sys.argv[1])
part_type = int(sys.argv[2])
material = int(sys.argv[3])
lifetime = int(sys.argv[4])
region = int(sys.argv[5])
route_type = int(sys.argv[6])

# Make prediction
x = [[vendor_id, part_type, material, lifetime, region, route_type]]
pred = rf.predict(x)

# Get confidence
try:
    proba = rf.predict_proba(x)[0]
    confidence = max(proba) * 100
except:
    confidence = 85.0

# Result
result = {
    'prediction': 'PASS' if pred[0] == 1 else 'BROKE',
    'probability': round(confidence, 1),
    'status': 'pass' if pred[0] == 1 else 'fail'
}

print(json.dumps(result))