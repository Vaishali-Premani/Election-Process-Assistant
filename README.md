# 🗳️ Civic Guide: Indian Election Process Assistant

Civic Guide is an interactive, AI-powered web application designed to educate Indian citizens about the democratic process. By combining a static information dashboard with a conversational AI assistant, the project makes complex civic concepts accessible, engaging, and easy to understand.

[**🌐 Live Demo**](https://election-process-assistant-894816034623.asia-south2.run.app)


![Civic Guide Dashboard Preview](https://raw.githubusercontent.com/Vaishali-Premani/Election-Process-Assistant/main/preview.png) *(Placeholder for your preview image)*

## 🚀 Features

- **Interactive AI Assistant:** Powered by Google Gemini, the assistant provides step-by-step guidance tailored to the user's knowledge level (Beginner, Intermediate, or Expert).
- **Quick Knowledge Base:** A static, chat-style interface for immediate answers to frequently asked questions about voting and the electoral process.
- **2024 Election Highlights:** A dedicated timeline for the 18th Lok Sabha elections, featuring key dates and phases.
- **Voter's Checklist:** Essential action items for citizens to ensure they are ready to vote.
- **Live News Integration:** Quick links to the official Election Commission of India (ECI) portal and major news trackers.
- **Responsive Design:** A modern, "Civic-themed" UI that works seamlessly across desktops and mobile devices.

## 🛠️ Tech Stack

- **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/)
- **Styling:** Custom CSS (Modern, Clean, Accessible)
- **Icons:** [Lucide React](https://lucide.dev/)
- **DevOps:** Docker, Nginx
- **Deployment:** Google Cloud Run
- **CI/CD:** Google Cloud Build

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vaishali-Premani/Election-Process-Assistant.git
   cd Election-Process-Assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## ☁️ Deployment

The project is configured for automated deployment to **Google Cloud Run** using **Cloud Build**.

- **Dockerfile:** Multi-stage build using Node.js for building the React app and Nginx for serving the static files.
- **Cloud Build:** Triggered on every push to the `main` branch. It injects the `VITE_GEMINI_API_KEY` during the build process and deploys the container to Cloud Run.

---
## 🔗 Live Demo

Experience the assistant live: [Civic Guide - Election Process Assistant](https://election-process-assistant-894816034623.asia-south2.run.app)

---
*Created with ❤️ to empower the citizens of India.*

