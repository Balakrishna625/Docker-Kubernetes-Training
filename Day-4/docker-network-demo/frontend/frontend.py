from flask import Flask
import requests

app = Flask(__name__)

@app.route("/")
def home():
    try:
        r = requests.get("http://backend:5000/quote")  # Call backend by name
        return f"<h2>Message from Backend:</h2><p>{r.json()['quote']}</p>"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)