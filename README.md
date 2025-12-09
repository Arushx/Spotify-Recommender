# Spotify Song Recommender & Popularity Classifier

A full-stack AI application that predicts song popularity and provides personalized song recommendations based on audio features.

## Project Structure

The project is organized into three main components:

1.  **`/analysis`**: R scripts and notebooks for Exploratory Data Analysis (EDA) and initial data understanding.
2.  **`/python_model`**: Python scripts for training the TensorFlow neural network and exporting data for the web application.
3.  **`/web_server`**: A modern Next.js web application that serves the recommendation engine and provides a premium user interface.

---

## 1. R Analysis (`/analysis`)

The R analysis phase focused on understanding the dataset structure and distribution of key audio features.

*   **Data Cleaning**: Loaded `Popular_Spotify_Songs.csv` and handled missing values and data type conversions using `tidyverse`.
*   **Feature Selection**: Extracted relevant musical features like `bpm`, `danceability_%`, `valence_%`, `energy_%`, etc.
*   **Distribution Analysis**: Analyzed the distribution of streams and other metrics to determine appropriate thresholds for classifying song popularity (Low, Medium, High).

## 2. Python Model & Data Pipeline (`/python_model`)

The core AI logic is implemented in Python using TensorFlow and Scikit-learn.

### Model Training (`train_model.py`)
*   **Classification Task**: A Neural Network (TensorFlow Keras) was trained to classify songs into three popularity tiers (Low, Medium, High) based on their stream counts.
*   **Architecture**: A Sequential model with dense layers, ReLU activation, and Dropout for regularization.
*   **Preprocessing**: Features were scaled using `StandardScaler` to ensure optimal model performance.

### Data Export (`export_data_for_web.py`)
*   This script prepares the artifacts needed for the web application.
*   It exports the **processed dataset** (with scaled features) and the **scaler parameters** (mean and scale) to JSON files.
*   These artifacts allow the web app to replicate the exact preprocessing steps used during training without needing a heavy Python backend at runtime.

## 3. Web Application (`/web_server`)

The web application is a high-performance, interactive frontend built with **Next.js 14**.

### Tech Stack
*   **Framework**: Next.js (React) with TypeScript.
*   **Styling**: Tailwind CSS v4 for a fully custom, monochrome design.
*   **Animations**: Framer Motion for smooth, premium interactions.
*   **Icons**: Lucide React.

### How It Works
1.  **User Input**: Users adjust sliders for various musical attributes (Tempo, Energy, Mood, etc.).
2.  **Real-time Processing**: The app uses the exported `scaler_params.json` to scale the user's input on the fly, matching the model's training data distribution.
3.  **Recommendation Engine**:
    *   The API route (`/api/recommend`) calculates the **Euclidean Distance** between the user's input vector and every song in the dataset.
    *   It returns the top 5 "nearest neighbors" (KNN approach) as recommendations.
4.  **Client-Side Rendering**: To ensure compatibility with all browser extensions and maximize performance, the core UI uses client-side rendering.

---

## Meaningful Conclusions

*   **Feature Correlation**: Certain features like `danceability` and `energy` showed strong correlations with higher stream counts, guiding the feature selection for the model.
*   **Model Performance**: The Neural Network successfully learned to distinguish between popularity tiers, validating the use of audio features as predictors for commercial success.
*   **Scalable Architecture**: By decoupling the training (Python) from the inference (Next.js/Node.js), the application achieves extremely low latency. The "heavy lifting" of training happens offline, while the web app performs lightweight vector calculations in milliseconds.
*   **User-Centric Design**: The shift to a monochrome, minimalist UI emphasizes the content and provides a professional, distraction-free experience for discovering music.

## Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.x (for model training)

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
