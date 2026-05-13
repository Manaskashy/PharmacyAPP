import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def test_gemini():
    try:
        print("Testing Gemini model connectivity...")
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content("Hello, are you online?")
        print(f"Response: {response.text}")
        
        # Test with dummy image bytes (1x1 red dot)
        print("Testing with dummy image...")
        dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdcD\xe1\xe2\x00\x00\x00\x00IEND\xaeB`\x82'
        image_part = {
            "mime_type": "image/png",
            "data": dummy_image
        }
        response = model.generate_content(["What is in this image?", image_part])
        print(f"Image Response: {response.text}")
        
    except Exception as e:
        print(f"FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
