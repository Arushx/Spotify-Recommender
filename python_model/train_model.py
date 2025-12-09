import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

print("Loading data...")
# 1. Load Data
try:
    df = pd.read_csv('Popular_Spotify_Songs.csv', encoding='latin-1')
except FileNotFoundError:
    print("Error: csv not found")
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

# 6. Save Artifacts for Web App
print("Saving artifacts...")
# Save the model
model.save('spotify_model.keras')

# Save the scaler (to scale user input later)
joblib.dump(scaler, 'scaler.pkl')

# Save the processed dataframe (with track names and artists) for recommendations
# We need the original data + the scaled features to calculate distance
final_df = df.copy()
# We want to save the SCALED features in the CSV so we don't have to scale every row during inference lookup
# But we also need the metadata.
# Let's replace the feature columns with their scaled values
final_df[feature_cols] = scaler.transform(df[feature_cols]) 
final_df.to_csv('processed_spotify_data.csv', index=False)

print("Model and data saved successfully!")
