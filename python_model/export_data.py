import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import json
import os

# 1. Load Data
print("Loading data...")
csv_path = '../analysis/Popular_Spotify_Songs.csv'

df = pd.read_csv(csv_path, encoding='latin-1')

# 2. Clean Data
df['streams'] = pd.to_numeric(df['streams'], errors='coerce')
df = df.dropna()

def get_popularity(streams):
    if streams < 150000000: return 0
    elif streams < 675000000: return 1
    else: return 2

df['popularity'] = df['streams'].apply(get_popularity)

features = ['bpm', 'danceability_%', 'valence_%', 'energy_%', 'acousticness_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%']
X = df[features]
y = df['popularity']

# 3. Scale Features
print("Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Train Model
print("Training model...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(8,)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(3, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=50, verbose=0)

loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"Model Accuracy: {accuracy*100:.2f}%")

# 5. Export for Web App
print("Exporting data for Web App...")

output_dir = '../web_server/data'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Export Scaler Params (Mean and Scale)
scaler_params = {
    "mean": dict(zip(features, scaler.mean_.tolist())),
    "scale": dict(zip(features, scaler.scale_.tolist()))
}
with open(f'{output_dir}/scaler_params.json', 'w') as f:
    json.dump(scaler_params, f)

# Export Song Data
songs_data = []
df_reset = df.reset_index(drop=True)
for i, row in df_reset.iterrows():
    song = {
        "track_name": row['track_name'],
        "artist(s)_name": row['artist(s)_name'],
        "released_year": int(row['released_year']),
        "streams": int(row['streams'])
    }
    
    for j, feature in enumerate(features):
        song[feature] = float(X_scaled[i][j])
        
    songs_data.append(song)

with open(f'{output_dir}/spotify_data.json', 'w') as f:
    json.dump(songs_data, f)

print(f"Done! Files saved to {output_dir}/")
