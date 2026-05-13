# Pharmacy App 🏥

A premium, all-in-one Healthcare and Pharmacy mobile application built with **React Native** and powered by **AI**. This application provides a seamless experience for users to manage their health, order medicines, consult doctors, and track their medical records, with an integrated AI Health Assistant for personalized medical insights.

---

## ✨ Key Features

### 🤖 AI Health Assistant (PharmaChatbot)
- **Symptom Analysis:** Get instant insights based on your symptoms.
- **Personalized Advice:** Context-aware responses using your profile biometrics (age, weight, height).
- **RAG Powered:** Uses Retrieval-Augmented Generation with a curated medical knowledge base for accurate information.
- **Natural Language Interface:** Chat naturally with our Gemini-powered medical assistant.

### 🛒 E-Commerce & Pharmacy
- **Medicine Marketplace:** Browse and search for a wide range of medicines and healthcare products.
- **Vitamins & Supplements:** Dedicated section for wellness products.
- **Surgical Equipment:** Specialized store for medical tools and equipment.
- **Smart Cart:** Manage items with ease using our `CartContext` for persistent shopping sessions.
- **Order Tracking:** Real-time updates on your order status from placement to delivery.

### 🩺 Healthcare Services
- **Doctor Consultation:** Connect with healthcare professionals directly through the app.
- **Lab Tests & Health Checkups:** Schedule diagnostic tests and comprehensive health assessments.
- **Ambulance Service:** Quick access to emergency medical transport.
- **Home Care:** Professional healthcare services at your doorstep.

### 📁 Health Vault (Personal Records)
- **Document Management:** Securely upload and store medical prescriptions, reports, and insurance documents.
- **File Picker Integration:** Easy uploads using `react-native-document-picker`.
- **Categorization:** Keep your health history organized and accessible.

### 👤 Profile & Personalization
- **Address Book:** Manage multiple delivery locations.
- **Payment Methods:** Securely store and manage credit/debit cards.
- **Insurance Details:** Keep your policy information handy.
- **Notifications Hub:** Real-time alerts for orders, payments, and reminders.

---

## 🚀 Tech Stack

### Frontend (Mobile App)
- **Core:** [React Native](https://reactnative.dev/) (v0.79.2)
- **Language:** TypeScript
- **Navigation:** [React Navigation Stack](https://reactnavigation.org/)
- **State Management:** React Context API (Cart, Orders, Notifications)
- **Persistence:** [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Icons:** React Native Vector Icons
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & Gesture Handler
- **Styling:** Premium Custom UI Components

### Backend (AI Services)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Model:** [Google Gemini 1.5 Pro/Flash](https://deepmind.google/technologies/gemini/)
- **Orchestration:** [LangChain](https://www.langchain.com/)
- **Vector Database:** [ChromaDB](https://www.trychroma.com/)
- **Embeddings:** Google Generative AI Embeddings

---

## 📁 Project Structure

```text
Pharmacy/
├── PharmaChatbot/       # AI Backend Service (FastAPI, RAG Engine)
├── Components/          # Reusable UI components (Modals, Floating buttons)
├── Context/             # Global state management (Cart, Notifications, Orders)
├── Screens/             # Main application screens (Home, Profile, HealthVault, etc.)
├── Services/            # API integration and external services
├── assets/              # Images, fonts, and static resources
├── __tests__/           # Unit and integration tests
├── android/             # Android native code
├── ios/                 # iOS native code
├── App.tsx              # Main entry point and Navigation Root
└── package.json         # Frontend dependencies and scripts
```

---

## 🛠️ Getting Started

### 📱 Frontend Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Pharmacy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **iOS Setup (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the App:**
   - Start Metro: `npm start`
   - Android: `npm run android`
   - iOS: `npm run ios`

### 🤖 AI Backend Setup (PharmaChatbot)

1. **Navigate to the backend folder:**
   ```bash
   cd PharmaChatbot
   ```

2. **Setup Virtual Environment:**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\Activate.ps1
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `PharmaChatbot` directory with:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   ```

5. **Seed Knowledge Base:**
   ```bash
   python seed_knowledge.py
   ```

6. **Run the Server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## 📱 Screenshots

| Home & Search | AI Assistant | Health Vault |
|:---:|:---:|:---:|
| *[Add Screenshot]* | *[Add Screenshot]* | *[Add Screenshot]* |

---

## 📄 License
This project is private and intended for internal use.

---
*Built with ❤️ for better healthcare accessibility.*
