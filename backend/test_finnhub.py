import os
from dotenv import load_dotenv
import requests

# Load .env variables
load_dotenv()

# Get the Finnhub API key from environment
api_key = os.environ.get("FINNHUB_API_KEY")
print("FINNHUB_API_KEY loaded:", bool(api_key))

if not api_key:
    print("ERROR: Finnhub API key not found in environment. Check your .env file.")
    exit(1)

# Test ticker
ticker = "AAPL"
url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={api_key}"

try:
    print(f"Connecting to Finnhub for ticker {ticker}...")
    response = requests.get(url, timeout=10)
    print("Status code:", response.status_code)
    if response.status_code == 200:
        print("Connection successful! Finnhub response:")
        print(response.json())
    else:
        print("Connection failed or API error. Response:")
        print(response.text)
except Exception as e:
    print("ERROR: Could not connect to Finnhub.")
    print(e)