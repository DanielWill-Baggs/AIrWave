from flask import Flask, request, jsonify
from flask_cors import CORS
from audio_processing import process_audio
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests (important for frontend communication)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AirWave Flask Backend is running!"})

@app.route("/process_audio", methods=["POST"])
def handle_audio():

    print("Received file:", request.files)


    # Get the audio file from the request
    audio_file = request.files.get('audio')  # Get the uploaded audio file

    print("Audio file:", audio_file)

    if not audio_file:
        return jsonify({"error": "Audio file is required!"}), 400

    audio_data = audio_file.read()  # Read the audio file as bytes
    print(f"Audio data type: {type(audio_data)}")  # Print the type for debugging
    print(f"Audio data length: {len(audio_data)}")  # Print the length for debugging

      # Ensure that the audio data is not empty
    if len(audio_data) == 0:
        return "Received empty audio file", 400

    # Get the API key from the environment variables
    api_key = os.getenv('GROQ_API_KEY')  # Retrieve the API key from .env

    if not api_key:
        return jsonify({"error": "API key is missing from the environment!"}), 500

    # Convert the audio file to a format expected by the transcribe_audio function
    # audio_data = audio_file.read()  # Read the audio file as bytes
    audio = (audio_file.filename, audio_data)  # Create a tuple (filename, audio_data)

    # Process the audio and generate the response
    transcription, response = process_audio(audio, api_key)

    return jsonify({"transcription": transcription, "response": response})

if __name__ == "__main__":
    app.run(debug=True)
