import os
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def _build_system_prompt(age, weight, height):
    biometrics = []
    if age: biometrics.append(f"Age: {age} years")
    if weight: biometrics.append(f"Weight: {weight} kg")
    if height: biometrics.append(f"Height: {height} cm")
    
    bio_section = "\n".join(biometrics) if biometrics else "None provided"
    
    return f"""You are MedBot — an AI medical assistant for PharmaPlus.
    
== PATIENT BIOMETRICS ==
{bio_section}

== RULES ==
- Use the provided context to identify conditions and suggest medicines.
- Adjust dosages based on the biometrics above.
- Always include a medical disclaimer.
- If context is missing, advise consulting a doctor.
- Format with: 🔍 Possible Condition, 💊 Suggested Medicines, 🏠 Home Remedies, 🚨 When to See a Doctor.

== MANDATORY DISCLAIMER ==
> ⚠️ **Medical Disclaimer**: This is for educational purposes only. Always consult a qualified healthcare provider.
"""

def generate_response(user_message, rag_context, age=None, weight=None, height=None, chat_history=None):
    system_prompt = _build_system_prompt(age, weight, height)
    context_section = "\n\n---\n\n".join(rag_context) if rag_context else "No specific data found."
    
    full_prompt = f"{system_prompt}\n\n== CONTEXT ==\n{context_section}\n\n== USER ==\n{user_message}"
    
    model = genai.GenerativeModel("models/gemini-3-flash-preview")
    history = []
    if chat_history:
        for turn in chat_history:
            role = "user" if turn.get("role") == "user" else "model"
            history.append({"role": role, "parts": [turn.get("content", "")]})
            
    if history:
        chat = model.start_chat(history=history)
        response = chat.send_message(full_prompt)
    else:
        response = model.generate_content(full_prompt)
        
    return response.text

def analyze_prescription(image_bytes: bytes, mime_type: str = "image/jpeg"):
    """
    Analyzes a doctor's prescription image and extracts medicines and instructions.
    """
    try:
        model = genai.GenerativeModel("models/gemini-3-flash-preview")
        
        prompt = """
        You are a specialized medical assistant trained to read doctor's prescriptions.
        Analyze the attached image and extract the following information:
        1.  **Medicines**: List all medicines mentioned.
        2.  **Dosage/Instructions**: For each medicine, extract the dosage and frequency (e.g., "once a day", "after meals").
        3.  **Conditions**: If any medical conditions are mentioned, note them.
        
        **CRITICAL RULES**:
        - If the handwriting is messy, use medical context to make the most likely interpretation.
        - If a word is completely illegible, state "[Illegible]".
        - DO NOT make up medicines.
        - Always include a confidence level for each medicine if the handwriting is unclear.
        
        Format the output as:
        🔍 **Analysis Result**
        - [Medicine Name] - [Instructions] (Confidence: High/Medium/Low)
        
        🚨 **Important**: This is an AI interpretation. Please verify with a pharmacist.
        """
        
        # Ensure mime_type is valid for Gemini
        if "pdf" in mime_type:
            actual_mime = "application/pdf"
        elif "png" in mime_type:
            actual_mime = "image/png"
        else:
            actual_mime = "image/jpeg"

        image_part = {
            "mime_type": actual_mime,
            "data": image_bytes
        }
        
        print(f"[DEBUG] Sending to Gemini with mime_type: {actual_mime}")
        response = model.generate_content([prompt, image_part])
        
        if not response.candidates:
            print(f"[WARNING] No candidates returned. Safety feedback: {response.prompt_feedback}")
            return "⚠️ Sorry, the AI could not analyze this image. It might have been flagged by safety filters or the image is too blurry."

        result_text = response.text
        print(f"[DEBUG] Gemini Response: {result_text[:100]}...")
        return result_text
    except Exception as e:
        print(f"[ERROR] Gemini analysis failed: {str(e)}")
        # Check if it's a safety filter error
        if "Safety" in str(e) or "finish_reason" in str(e):
            return "⚠️ The analysis was blocked by safety filters. Please ensure the image is a clear medical prescription."
        raise e
