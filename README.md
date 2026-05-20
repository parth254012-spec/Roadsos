# 🚨 Road-SoS - Road Safety Hackathon MVP

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Project-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-Vite-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Firebase-Hosting-orange?style=for-the-badge" />
</p>

---

# 🌟 Overview

**Road-SoS** is an AI-powered road safety and emergency response platform built during a hackathon.  
The platform helps users report incidents, view live road situations, and receive AI-based emergency assistance.

This project is designed as a **Hackathon MVP**, with future scalability and real-world implementation in mind.

---

# ✨ Features

## ✅ Authentication System
- Firebase Authentication
- Secure login/signup
- User session management

## ✅ AI Emergency Assistant
- Gemini AI integration
- Smart road safety guidance
- Emergency suggestions

## ✅ Live Dashboard
- Real-time incidents
- Severity indicators
- Dynamic UI updates

## ✅ Interactive Map
- Live location tracking
- Incident visualization
- Map-based monitoring

## ✅ Responsive UI
- Mobile friendly
- Modern glassmorphism design
- Smooth animations

---

# 🚀 Future Features

- 📱 Mobile App
- 🌍 Multi-language Support
- 🚑 Emergency Service Integration
- 🔔 Push Notifications
- 📷 Image-based Incident Detection
- 🤖 Advanced AI Assistance

> This project is currently a Hackathon MVP and will continue evolving.

---

# 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| React + Vite | Frontend |
| TailwindCSS | Styling |
| Firebase | Authentication & Database |
| Gemini API | AI Integration |
| Leaflet Maps | Live Map System |
| PNPM | Package Management |

---

# 📁 Folder Structure

```bash
Road-SoS/
│
├── artifacts/
│   └── roadsos/
│       │
│       ├── src/
│       │   │
│       │   ├── components/
│       │   │   ├── ai/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── map/
│       │   │   └── ui/
│       │   │
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── Signup.tsx
│       │   │   └── Home.tsx
│       │   │
│       │   ├── services/
│       │   │   ├── firebase.ts
│       │   │   └── ai.ts
│       │   │
│       │   ├── hooks/
│       │   │
│       │   ├── context/
│       │   │
│       │   ├── lib/
│       │   │
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       │
│       ├── public/
│       │   ├── assets/
│       │   ├── screenshots/
│       │   └── icons/
│       │
│       ├── dist/
│       │   └── public/
│       │
│       ├── .env
│       ├── firebase.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       ├── pnpm-lock.yaml
│       └── README.md
│
├── node_modules/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/roadsos.git
```

---

## 2️⃣ Open Project

```bash
cd Road-SoS/artifacts/roadsos
```

---

## 3️⃣ Install Dependencies

```bash
pnpm install
```

---

## 4️⃣ Create `.env` File

Create a `.env` file inside:

```bash
artifacts/roadsos
```

Add:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_key

PORT=3000
BASE_PATH=/
```

---

## 5️⃣ Run Development Server

```bash
pnpm run dev
```

App runs on:

```bash
http://localhost:3000
```

---

# 🏗️ Production Build

```bash
pnpm build
```

---

# 🔥 Firebase Deployment

## Login to Firebase

```bash
firebase login
```

## Deploy

```bash
firebase deploy
```

---

# 📸 Screenshots

## Landing Page
<img width="1919" height="986" alt="image" src="https://github.com/user-attachments/assets/e91383e4-0902-461a-ad16-6bc85a4aebef" />

## Home Page
<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/1f418bac-4bf0-4878-a485-d845f84ef75f" />

## Live Map
<img width="1919" height="990" alt="image" src="https://github.com/user-attachments/assets/484f052d-65ba-4939-8085-63c079fbf6aa" />

## Sos Button
<img width="1919" height="990" alt="image" src="https://github.com/user-attachments/assets/5e6e9e28-59e3-4700-a382-278c78a26902" />

## Profile 
<img width="1919" height="988" alt="image" src="https://github.com/user-attachments/assets/02619211-cc18-42e9-8fbb-c52976e1c73d" />

## AI Assistant And Nearby Services
<img width="1919" height="888" alt="image" src="https://github.com/user-attachments/assets/dbe7923d-852a-4d4d-94e8-25cfe547369d" />

---

# 🙏 Acknowledgements

- Firebase
- Gemini AI
- React Community
- Hackathon Mentors & Team Members

---

# ⭐ Support

If you liked this project:

⭐ Star the repository  
🍴 Fork the project  
🛠️ Contribute to improve it

---

# 📄 License

This project is created for educational and hackathon purposes.

---

<p align="center">
  Made with ❤️ during Hackathon
</p>
