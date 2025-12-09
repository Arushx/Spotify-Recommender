# Spotify Recommender System

A comprehensive data analysis and machine learning project that analyzes popular Spotify songs and provides a personalized recommendation web application.

## 📂 Project Structure

- **`/analysis`**: Contains R scripts and notebooks for exploratory data analysis (EDA) and visualization.
  - `analysis_r.ipynb`: Detailed analysis of song features using Tidyverse.
  - `check_streams.R`: Statistical checks on stream counts.
  - `Popular_Spotify_Songs.csv`: The dataset used for analysis.

- **`/python_model`**: Contains the Machine Learning pipeline.
  - `train_model.py`: TensorFlow script to train the neural network.
  - `analysis_python.ipynb`: Python notebook for data preprocessing and model experimentation.
  - `export_data_for_web.py`: Utility to export processed data and scaler parameters for the web app.
  - `spotify_model.keras`: The trained TensorFlow model.

- **`/web_server`**: The Next.js web application.
  - A modern, responsive frontend deployed on Vercel.
  - Uses an internal API route to perform real-time recommendations based on vector similarity.

## 🚀 Tech Stack

- **Data Analysis**: R (Tidyverse, ggplot2), Python (Pandas, NumPy)
- **Machine Learning**: TensorFlow/Keras, Scikit-learn
- **Web App**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Deployment**: Vercel

## 📊 Analysis Highlights

Our analysis revealed key insights into what makes a song popular:
- **Stream Classes**: We classified songs into Low (<150M), Medium (150M-675M), and High (>675M) popularity tiers based on quartile distribution.
- **Feature Correlation**: We explored how features like `danceability`, `energy`, and `valence` correlate with stream counts.
- **Decision Tree**: An R-based decision tree model was used to understand the hierarchy of features that predict song success.

## 🛠️ How It Works

1.  **Data Processing**: The raw dataset is cleaned and features are scaled using `StandardScaler`.
2.  **Model Training**: A Neural Network is trained to classify songs into popularity tiers.
3.  **Recommendation Engine**: The web app takes user preferences (BPM, Mood, etc.), scales them using the training parameters, and calculates the Euclidean distance between the user's "ideal song" and every song in the dataset.
4.  **Result**: The top 5 closest matches are returned instantly.

## 💻 Running Locally

1.  **Clone the repo**
2.  **Run the Web App**:
    ```bash
    cd web_server
    npm install
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000)
