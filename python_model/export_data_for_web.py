import pandas as pd
import json
import os
import joblib

# Load Data and Scaler
try:
    df = pd.read_csv('processed_spotify_data.csv')
    scaler = joblib.load('scaler.pkl')
except FileNotFoundError:
    print("Error: Artifacts not found. Run train_model.py first.")
    exit(1)

# Columns in the order they were scaled
feature_cols = [
    'bpm', 'danceability_%', 'valence_%', 'energy_%', 
    'acousticness_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%'
]

# Extract scaler parameters
# StandardScaler stores mean_ and scale_ (std dev)
scaler_params = {
    "mean": dict(zip(feature_cols, scaler.mean_)),
    "scale": dict(zip(feature_cols, scaler.scale_))
}

# Ensure directory
os.makedirs('web_app/frontend/data', exist_ok=True)

# Save Scaler Params
with open('web_app/frontend/data/scaler_params.json', 'w') as f:
    json.dump(scaler_params, f)

# Save Data (same as before)
cols_to_keep = [
    'track_name', 'artist(s)_name', 'released_year', 'streams',
    *feature_cols
]
df[cols_to_keep].to_json('web_app/frontend/data/spotify_data.json', orient='records')

print("Data and scaler params exported successfully.")
