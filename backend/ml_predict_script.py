#Used to predict data
import sys
import joblib
import json
import warnings

# Suppress specific sklearn warnings
warnings.filterwarnings("ignore", category=UserWarning)

def get_trend_label(predicted, last_close):
    if predicted > last_close * 1.01:  # 1% threshold for bullish
        return "bullish"
    elif predicted < last_close * 0.99:  # 1% threshold for bearish
        return "bearish"
    else:
        return "neutral"

def predict(features, last_close):
    model = joblib.load('./stock_model.pkl')
    try:
        feature_values = [
            features['Open'], 
            features['High'], 
            features['Low'], 
            features['Volume']
        ]
        prediction = model.predict([feature_values])
        trend_label = get_trend_label(prediction[0], last_close)
        return round(prediction[0], 2), trend_label  # Round to two decimal places
    except KeyError as e:
        return f"KeyError: Missing {str(e)} in features", None

if __name__ == '__main__':
    input_features = json.loads(sys.argv[1].replace("'", "\""))
    last_close_price = float(sys.argv[2])
    prediction, trend_label = predict(input_features, last_close_price)
    print(f"{prediction} ({trend_label})")  # Print the formatted output