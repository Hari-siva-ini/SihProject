import pickle
import json

try:
    # Load and inspect the model file
    with open('model_rf_data.pkl', 'rb') as f:
        model_data = pickle.load(f)
    
    # Extract model information
    analysis = {
        'model_type': str(type(model_data)),
        'has_predict': hasattr(model_data, 'predict'),
        'has_predict_proba': hasattr(model_data, 'predict_proba'),
        'attributes': [attr for attr in dir(model_data) if not attr.startswith('_')]
    }
    
    # Try to get feature information
    if hasattr(model_data, 'n_features_in_'):
        analysis['n_features'] = model_data.n_features_in_
    
    if hasattr(model_data, 'feature_names_in_'):
        analysis['feature_names'] = list(model_data.feature_names_in_)
    
    if hasattr(model_data, 'classes_'):
        analysis['classes'] = list(model_data.classes_)
    
    # Test with sample data to understand input/output
    try:
        sample_input = [[1, 1, 1, 5, 1, 1]]  # 6 features as per training code
        prediction = model_data.predict(sample_input)
        analysis['sample_prediction'] = int(prediction[0])
        analysis['prediction_type'] = str(type(prediction[0]))
        
        # Test probabilities
        try:
            proba = model_data.predict_proba(sample_input)
            analysis['sample_probabilities'] = proba[0].tolist()
            analysis['max_probability'] = float(max(proba[0]))
        except:
            analysis['probabilities_available'] = False
            
    except Exception as e:
        analysis['prediction_error'] = str(e)
    
    print(json.dumps(analysis, indent=2))
    
except Exception as e:
    print(json.dumps({'error': str(e)}))