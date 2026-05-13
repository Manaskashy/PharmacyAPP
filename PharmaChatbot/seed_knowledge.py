from dotenv import load_dotenv
from rag_engine import RAGEngine

load_dotenv()

MEDICAL_KNOWLEDGE = [
    "Disease: Common Cold. Symptoms: runny nose, sneezing, sore throat. Medicines: Paracetamol, Cetirizine.",
    "Disease: Flu. Symptoms: high fever, body aches, chills. Medicines: Oseltamivir, Ibuprofen.",
    "Disease: COVID-19. Symptoms: loss of taste, dry cough, fever. Medicines: Paracetamol, Zinc.",
    "Disease: Typhoid. Symptoms: high fever, abdominal pain, rose spots. Medicines: Azithromycin.",
    "Disease: Dengue. Symptoms: high fever, eye pain, joint pain. Medicines: Paracetamol (No NSAIDs).",
    "Disease: Malaria. Symptoms: cyclical fever, chills, sweating. Medicines: Chloroquine, ACT.",
    "Disease: Diabetes Type 2. Symptoms: thirst, frequent urination. Medicines: Metformin.",
    "Disease: Hypertension. Symptoms: headache, dizziness. Medicines: Amlodipine, Losartan.",
    "Disease: Gastroenteritis. Symptoms: diarrhea, vomiting, cramps. Medicines: ORS, Ondansetron.",
    "Disease: Asthma. Symptoms: wheezing, chest tightness. Medicines: Salbutamol, Budesonide.",
    "Disease: UTI. Symptoms: burning urination, urge. Medicines: Nitrofurantoin.",
    "Disease: Anemia. Symptoms: fatigue, pale skin. Medicines: Ferrous Sulfate.",
]

def main():
    print("[INFO] Seeding PharmaChatbot Knowledge Base...")
    engine = RAGEngine()
    engine.add_documents(MEDICAL_KNOWLEDGE)
    print("[SUCCESS] Seeded successfully!")

if __name__ == "__main__":
    main()
