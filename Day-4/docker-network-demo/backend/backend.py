from flask import Flask, jsonify
import random

app = Flask(__name__)

quotes = [
    "Automate everything with CI/CD!",
    "Infrastructure as Code = less human error.",
    "Containers remove the 'works on my machine' problem.",
    "Logs are developers' best friends.",
    "Think cloud-native, not lift-and-shift."
]

@app.route("/quote")
def get_quote():
    return jsonify({"quote": random.choice(quotes)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)