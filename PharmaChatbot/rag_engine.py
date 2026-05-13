import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", "./knowledge_base")
COLLECTION_NAME = "pharma_medical_knowledge"

class RAGEngine:
    def __init__(self):
        self.embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
            api_key=GEMINI_API_KEY,
            model_name="models/gemini-embedding-001",
        )
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"},
        )

    def add_documents(self, texts: List[str]):
        existing_ids = set(self.collection.get()["ids"])
        new_texts = []
        new_ids = []
        for i, text in enumerate(texts):
            doc_id = f"doc_{i}_{hash(text) & 0xFFFFFF}"
            if doc_id not in existing_ids:
                new_texts.append(text)
                new_ids.append(doc_id)
        if new_texts:
            self.collection.add(documents=new_texts, ids=new_ids)

    def load_knowledge_base(self):
        kb_path = Path(KNOWLEDGE_BASE_PATH)
        if not kb_path.exists():
            kb_path.mkdir(parents=True, exist_ok=True)
            return
        texts = []
        for txt_file in kb_path.glob("*.txt"):
            content = txt_file.read_text(encoding="utf-8")
            texts.extend(_chunk_text(content))
        try:
            from pypdf import PdfReader
            for pdf_file in kb_path.glob("*.pdf"):
                reader = PdfReader(str(pdf_file))
                full_text = " ".join(page.extract_text() or "" for page in reader.pages)
                texts.extend(_chunk_text(full_text))
        except ImportError:
            pass
        if texts:
            self.add_documents(texts)

    def query(self, symptom_text: str, n_results: int = 5) -> List[str]:
        total_docs = self.collection.count()
        if total_docs == 0: return []
        results = self.collection.query(query_texts=[symptom_text], n_results=min(n_results, total_docs))
        return results["documents"][0] if results["documents"] else []

def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]
