import groq

def generate_response(transcription, api_key):
    if not transcription:
        return "No transcription available. Please try speaking again."
    
    client = groq.Client(api_key=api_key)
    
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": transcription}
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error in response generation: {str(e)}"
