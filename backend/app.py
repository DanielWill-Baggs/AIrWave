from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests (important for frontend communication)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AirWave Flask Backend is running!"})

if __name__ == "__main__":
    app.run(debug=True)
