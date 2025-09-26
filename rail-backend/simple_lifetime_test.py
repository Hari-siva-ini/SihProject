import pickle
import numpy as np

try:
    # Load the lifetime model
    with open('lifetime_model.pkl', 'rb') as f:
        lifetime_model = pickle.load(f)
    
    print("Model Type:", type(lifetime_model))
    
    # Test with sample data - try different feature counts
    for n_features in range(1, 10):
        try:
            sample_input = np.array([[1] * n_features])
            prediction = lifetime_model.predict(sample_input)
            print(f"SUCCESS: Model accepts {n_features} features")
            print(f"Sample prediction: {prediction[0]}")
            print(f"Prediction type: {type(prediction[0])}")
            break
        except Exception as e:
            continue
    
    # Check if it has feature names
    if hasattr(lifetime_model, 'feature_names_in_'):
        print("Feature names:", lifetime_model.feature_names_in_)
    
    if hasattr(lifetime_model, 'n_features_in_'):
        print("Number of features:", lifetime_model.n_features_in_)
        
except Exception as e:
    print(f"Error: {e}")