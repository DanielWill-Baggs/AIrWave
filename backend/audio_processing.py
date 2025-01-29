from audio_transcription import transcribe_audio
from response_generation import generate_response

def process_audio(audio, api_key):
    if not api_key:
        return "Please enter your Groq API key.", "API key is required."
    
    transcription = transcribe_audio(audio, api_key)
    response = generate_response(transcription, api_key)
    return transcription, response
