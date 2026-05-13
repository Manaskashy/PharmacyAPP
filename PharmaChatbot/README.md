# PharmaChatbot 🚀

AI medical chatbot integrated into PharmaPlus.

## Setup

1. **Open Terminal** in this folder (`c:\Users\91882\Desktop\App\Pharmacy\PharmaChatbot`)
2. **Setup Venv**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. **Install**:
   ```powershell
   pip install -r requirements.txt
   ```
4. **Seed**:
   ```powershell
   python seed_knowledge.py
   ```
5. **Run**:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Folder Structure
- `main.py`: FastAPI Server
- `rag_engine.py`: Vector Search
- `gemini_service.py`: AI Logic
- `knowledge_base/`: Drop PDFs/TXTs here to teach the bot.
