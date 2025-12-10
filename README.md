# Spotify Song Recommender & Popularity Classifier

A full-stack AI application that predicts song popularity and provides personalized song recommendations based on audio features.

## Project Structure

The project is organized into three main components:

1.  **`/analysis`**: R scripts and notebooks for Exploratory Data Analysis (EDA) and initial data understanding.
2.  **`/python_model`**: Python scripts for training the TensorFlow neural network and exporting data for the web application.
3.  **`/web_server`**: A modern Next.js web application that serves the recommendation engine and provides a premium user interface.

---

## 1. R Analysis (`/analysis`)

The foundation of this project lies in a rigorous data analysis performed in R. The primary goal was to understand the distribution of song streams to create meaningful popularity classes for the machine learning model.

### Key Findings & Methodology
*   **Dataset**: 953 songs from the "Popular Spotify Songs" dataset.
*   **Distribution Analysis**: I analyzed the `streams` column and found a highly skewed distribution. To build a balanced classification model, I defined three popularity tiers based on stream count thresholds.
*   **Class Distribution**:
    *   **Low Popularity (< 150M streams)**: 254 songs (**26.7%**)
    *   **Medium Popularity (150M - 675M streams)**: 462 songs (**48.5%**)
    *   **High Popularity (> 675M streams)**: 236 songs (**24.8%**)
*   **Model Iteration**:
    *   **Model 1 (Aggregated Features)**: Attempted to predict popularity using a single `qual_factor` (average of audio qualities) along with BPM and Key. This yielded a low accuracy of **44.19%**, indicating that aggregating features loses critical information.
    *   **Model 2 (Granular Features)**: Using individual features (Danceability, Energy, Valence, etc.) along with `artist_count` and `released_year` improved the accuracy to **60.85%**.
*   **Conclusion**: Individual audio features have significant predictive power when treated separately. This insight drove the decision to use a Neural Network in Python with all 8 individual features for the final application.

**Why this matters**: By empirically determining these thresholds, I ensured the model has enough examples for each class. The R analysis proved that while no single feature guarantees a hit, the *combination* of specific audio characteristics is a strong predictor of commercial success (Stream Count).

## 2. Python Model (`/python_model`)

Implemented a **Neural Network** using TensorFlow/Keras to classify songs into the popularity tiers defined by the R analysis.

### Model Architecture
The model is a Feed-Forward Neural Network designed to capture non-linear relationships between audio features and popularity.

*   **Input Layer**: Accepts 8 standardized features:
    *   `bpm`, `danceability_%`, `valence_%`, `energy_%`, `acousticness_%`, `instrumentalness_%`, `liveness_%`, `speechiness_%`.
*   **Hidden Layer 1**: **64 neurons** with **ReLU** activation. This layer expands the feature space to learn complex patterns.
*   **Dropout Layer**: **20% dropout** rate. This randomly deactivates neurons during training to prevent overfitting and improve generalization.
*   **Hidden Layer 2**: **32 neurons** with **ReLU** activation. This compresses the learned features into more abstract representations.
*   **Output Layer**: **3 neurons** with **Softmax** activation. This outputs a probability distribution across the three popularity classes (Low, Medium, High).

### Training & Artifacts
*   **Optimizer**: Adam (Adaptive Moment Estimation) for efficient convergence.
*   **Loss Function**: Sparse Categorical Crossentropy.
*   **Artifact Generation**: The training script (`train_model.py`) exports two critical files for the web app:
    1.  `scaler_params.json`: The Mean and Standard Deviation for each feature.
    2.  `spotify_data.json`: The dataset with pre-scaled feature vectors.

## 3. Web Application (`/web_server`)

The web application is a high-performance, interactive frontend built with **Next.js 14**. It is designed to be "serverless-ready" by performing inference without a running Python backend.

### How It Works: The "Offline" AI Approach
Instead of calling a Python API for every request (which adds latency and server costs), the web app uses the **exported artifacts** to perform inference directly in Node.js.

1.  **Input Scaling**: When a user adjusts the sliders (e.g., Energy = 80%), the app uses the `scaler_params.json` to standardize this value:
    This ensures the user's input is mathematically comparable to the model's training data.

2.  **K-Nearest Neighbors (KNN) Inference**:
    *   The app loads the pre-scaled song vectors from `spotify_data.json`.
    *   It calculates the **Euclidean Distance** between the user's scaled input vector and *every* song in the dataset.
    *   The songs are sorted by distance, and the top 5 closest matches are returned as recommendations.

### Tech Stack
*   **Framework**: Next.js (React) with TypeScript.
*   **Styling**: Tailwind CSS v4
*   **Performance**: Client-side rendering for maximum interactivity and compatibility.

---
## Meaningful Conclusions
*   **Audio Features as Predictors**: The successful training of the Neural Network confirms that audio features like `danceability` and `energy` contain significant signal regarding a song's commercial success.
*   **Data-Driven Architecture**: The decision to use a Neural Network for classification but a KNN approach for recommendation leverages the strengths of both: the NN validates the feature importance, while KNN provides transparent, similarity-based recommendations.
*   **Efficiency**: By decoupling training (Python) from inference (Next.js), I achieved a system that is both **statistically rigorous** (backed by R analysis) and **extremely fast** (sub-millisecond response times).

## Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.x (optional, only for retraining)

### Running the Web App
1.  Navigate to the web server:
    ```bash
    cd web_server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

### FUTURE PLANS
Use the dataset, https://www.kaggle.com/datasets/asaniczka/top-spotify-songs-in-73-countries-daily-updated/data, which has far more songs and then annotate then manually with an API to get BPM and other stats and then retrain the model on it.
