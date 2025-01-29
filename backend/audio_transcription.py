import groq
import io
import soundfile as sf
import librosa
import numpy as np

def convert_audio_bytes_to_numpy(audio_bytes):
    """
    Convert audio byte data to a NumPy array using librosa.
    """
    # Create a BytesIO object from the byte data
    audio_file = io.BytesIO(audio_bytes)
    
    # Use librosa to load the audio file into a NumPy array
    audio_data, sample_rate = librosa.load(audio_file, sr=None, mono=False)
    
    print(f"Audio data shape: {audio_data.shape}")
    print(f"Sample rate: {sample_rate}")
    
    return audio_data, sample_rate

def transcribe_audio(audio, api_key):
    """
    Transcribe audio using the Groq API.
    """
    if audio is None or len(audio) < 2:
        return "Invalid audio input"
    
    print("Type of audio data:", type(audio[1]))
    print("Length of audio data inside transcribe_audio:", len(audio[1]))

    client = groq.Client(api_key=api_key)

    # Get the byte data from the audio input
    audio_data = audio[1]
    print(f"Audio data type before conversion: {type(audio_data)}")
    
    # Convert the byte data to a NumPy array using librosa
    audio_data, sample_rate = convert_audio_bytes_to_numpy(audio_data)
    
    print(f"Audio data type after conversion: {type(audio_data)}")
    print(f"Audio data shape: {audio_data.shape}")

    # Prepare a buffer to write the audio data to
    buffer = io.BytesIO()
    try:
        # Transpose the audio data to match the expected shape for soundfile.write
        audio_data = audio_data.T  # Shape: (samples, channels)
        
        # Write the audio data to the buffer in WAV format
        sf.write(buffer, audio_data, sample_rate, format='WAV')
        buffer.seek(0)
        print(f"Buffer size after conversion: {len(buffer.getvalue())}")
        
        # Perform transcription with Groq API
        completion = client.audio.transcriptions.create(
            model="distil-whisper-large-v3-en",
            file=("audio.wav", buffer),
            response_format="text"
        )
        return completion

    except Exception as e:
        print(f"Error in transcription: {str(e)}")
        return f"Error in transcription: {str(e)}"