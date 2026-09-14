# RAG Website — Frontend

Frontend interface for the RAG (Retrieval-Augmented Generation) system. Built with React and Next.js, this app provides two experiences:

- **Employees** can ask questions and get answers pulled from the company's internal documents.
- **HR** can securely log in and upload new documents for the system to learn from.

---

## ✨ Features

- 💬 **Employee Chat Interface** — Ask natural-language questions and get answers grounded in company documents.
- 🔐 **HR Authentication** — Password-protected access restricted to HR, separate from the employee chat.
- 📤 **Document Upload Panel** — HR can upload new documents, which are indexed by the backend so the assistant can learn from them.

---

## 📸 Screenshots

### Employee Chat — Ask Questions
![Employee chat interface](./screenshots/employee-chat.png)

### HR Login — Password Protected Access
![HR login screen](./screenshots/hr-login.png)

### HR Document Upload
![HR document upload panel](./screenshots/hr-upload.png)

> Place your screenshot images inside a `screenshots/` folder at the project root, using the file names above (or update the paths here to match your file names).

---

## 🛠️ Tech Stack

- **React** (via Next.js)
- **Node.js** / npm

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/ShahdNazzal/RAG-Website.git
cd RAG-Website
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and set the backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Update this to match wherever your [Mini-RAG backend](https://github.com/ShahdNazzal/RAG) is running.

### Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

RAG-Website/
├── app/ # Pages and routes
├── components/ # Reusable UI components
├── public/ # Static assets
├── screenshots/ # README screenshots
└── README.md



---

## 🔗 Related

- [Mini-RAG Backend](https://github.com/ShahdNazzal/RAG) — FastAPI backend powering this frontend.

---

## 📄 License

This project is licensed under the MIT License.
