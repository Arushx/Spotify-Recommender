import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

print("Loading data...")
# 1. Load Data
try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, '../analysis/Popular_Spotify_Songs.csv')
    df = pd.read_csv(csv_path, encoding='latin-1')
except FileNotFoundError:
    print(f"Error: csv not found at {csv_path}")
    exit(1)

# 2. Data Cleaning
# Convert streams to numeric, coercing errors to NaN
df['streams'] = pd.to_numeric(df['streams'], errors='coerce')

# Drop rows with missing values
df = df.dropna()

# Create Target Variable (Popularity Class)
# Low: < 150M, Medium: 150M-675M, High: > 675M
def classify_streams(streams):
    if streams < 150000000:
        return 0 # Low
    elif streams < 675000000:
        return 1 # Medium
    else:
        return 2 # High

df['popularity'] = df['streams'].apply(classify_streams)

# Select Features for the Model
feature_cols = [
    'bpm', 'danceability_%', 'valence_%', 'energy_%', 
    'acousticness_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%'
]

X = df[feature_cols]
y = df['popularity']

# 3. Preprocessing
# Scale the features so they are all on the same scale (0-1 or similar)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

print("Training model...")
# 4. Build TensorFlow Model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(3, activation='softmax') # 3 classes: Low, Medium, High
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 5. Train Model
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    verbose=0 # Silent training
)

# Evaluate
loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"Test Accuracy: {accuracy*100:.2f}%")

# 6. Save Artifacts
print("Saving artifacts...")
# Save the model
model_path = os.path.join(script_dir, 'spotify_model.keras')
model.save(model_path)

# Save the scaler (useful for future Python inference)
scaler_path = os.path.join(script_dir, 'scaler.pkl')
joblib.dump(scaler, scaler_path)

# 7. Export Data for Web App (Next.js)
print("Exporting data for Web App...")
output_dir = os.path.join(script_dir, '../web_server/data')
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Export Scaler Params (Mean and Scale)
# StandardScaler stores mean_ and scale_ (std dev)
scaler_params = {
    "mean": dict(zip(feature_cols, scaler.mean_.tolist())),
    "scale": dict(zip(feature_cols, scaler.scale_.tolist()))
}

with open(f'{output_dir}/scaler_params.json', 'w') as f:
    json.dump(scaler_params, f)

# Export Song Data
# We need the original metadata + the SCALED feature values
songs_data = []
df_reset = df.reset_index(drop=True)

# We can use the X_scaled we already computed, but we need to map it back to the rows.
# Since we dropped NAs and reset index, X_scaled corresponds to df_reset.
# However, X_scaled was split into train/test. We need the FULL dataset scaled.
# Let's re-scale the full X to be sure (or just use transform since we have the scaler)
full_X_scaled = scaler.transform(df[feature_cols])

for i, row in df_reset.iterrows():
    song = {
        "track_name": row['track_name'],
        "artist(s)_name": row['artist(s)_name'],
        "released_year": int(row['released_year']),
        "streams": int(row['streams'])
    }
    
    for j, feature in enumerate(feature_cols):
        song[feature] = float(full_X_scaled[i][j])
        
    songs_data.append(song)

with open(f'{output_dir}/spotify_data.json', 'w') as f:
    json.dump(songs_data, f)

print(f"Model saved to {model_path}")
print(f"Web artifacts saved to {output_dir}/")
