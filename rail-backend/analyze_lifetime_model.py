import pickle
import json
import numpy as np

try:
    # Load the lifetime model
    with open('lifetime_model.pkl', 'rb') as f:
        lifetime_model = pickle.load(f)
    
    print("=== LIFETIME MODEL ANALYSIS ===")
    print(f"Model Type: {type(lifetime_model)}")
    
    # Check if it's a trained model
    if hasattr(lifetime_model, 'predict'):
        print("✓ Model has predict method")
        
        # Test with sample data
        try:
            # Try different input sizes to understand expected features
            for n_features in [1, 2, 3, 4, 5, 6, 7, 8]:
                try:
                    sample_input = [[1] * n_features]
                    prediction = lifetime_model.predict(sample_input)
                    print(f"✓ Model accepts {n_features} features")
                    print(f"Sample prediction: {prediction[0]}")
                    
                    # Check if it's a regression or classification model
                    if hasattr(lifetime_model, 'predict_proba'):
                        try:
                            proba = lifetime_model.predict_proba(sample_input)
                            print(f"Classification model - classes: {lifetime_model.classes_}")
                            print(f"Sample probabilities: {proba[0]}")
                        except:
                            pass
                    else:
                        print("Regression model - predicts continuous values")
                    
                    break
                except Exception as e:
                    continue
        except Exception as e:
            print(f"Error testing model: {e}")
    
    # Check model attributes
    print("\n=== MODEL ATTRIBUTES ===")
    for attr in dir(lifetime_model):
        if not attr.startswith('_'):
            try:
                value = getattr(lifetime_model, attr)
                if not callable(value):
                    print(f"{attr}: {value}")
            except:
                pass
    
    print("\n=== MODEL READY FOR INTEGRATION ===")
    
except Exception as e:
    print(f"Error loading lifetime model: {e}")