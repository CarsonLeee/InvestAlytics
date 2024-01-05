#Used to train model

import warnings
from sklearn.exceptions import DataConversionWarning
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Suppress specific warnings
warnings.filterwarnings(action='ignore', category=UserConversionWarning)

# Load your dataset
df = pd.read_csv('TSLA_stock_data.csv')

# Feature Engineering
# Use the exact column names from your CSV file
X = df[['Open', 'High', 'Low', 'Volume']]  # Replace with your chosen features
y = df['Close']  # Assuming 'Close' is the name of your target column

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

# Initialize and train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, 'stock_model.pkl')
