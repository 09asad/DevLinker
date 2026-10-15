# 🚀 DevLinker Frontend

A full-stack developer networking platform where developers can discover other developers, build connections, chat in real time, and grow their professional tech network.

🌐 **Live Product:** https://devlinker.tech

---

## 📌 About

**DevLinker** is a MERN-based developer networking platform designed to help developers discover relevant people, connect with them, and communicate through one focused platform.

Users can create developer profiles, discover other developers, send and manage connection requests, chat with their connections in real time, and access premium membership plans.

This repository contains the **React + Vite frontend** of DevLinker.

---

## ✨ Key Features

### 🔐 Authentication

* User signup and login
* JWT-based authentication
* Protected routes
* Secure cookie-based authentication flow

### 👨‍💻 Developer Discovery

* Browse developer profiles
* View developer information
* Discover developers for networking
* Responsive developer cards

### 🤝 Connections

* Send connection requests
* Accept or reject incoming requests
* Manage connection requests
* View accepted connections

### 💬 Real-Time Chat

* One-to-one real-time messaging
* Chat with accepted connections
* Real-time communication using Socket.IO
* Real-time chat interface

### 👤 Profile Management

* View user profile
* Edit profile information
* Update personal and developer details

### 💎 Premium Membership

**Silver Membership**

* Unlimited chats with connections
* 100 connection requests per day
* Silver verified badge
* Ad-free experience
* 2-month validity

**Gold Membership**

* Additional premium features
* Unlimited connection requests per day
* Gold verified badge
* Ad-free experience
* 6-month validity

### 💳 Payments

* Razorpay payment integration
* Premium membership purchase flow
* Payment-based membership activation

### 📱 Responsive UI

* Responsive across desktop, tablet, and mobile devices
* Built with Tailwind CSS and DaisyUI

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* React Router DOM
* Redux Toolkit
* Axios
* Socket.IO Client
* Tailwind CSS
* DaisyUI

### Backend Integration

* REST APIs
* JWT authentication
* Socket.IO real-time communication

---

## 🧠 Frontend Architecture

The frontend follows a component-based React architecture with Redux Toolkit for global application state.

```text
User
 │
 ▼
React + Vite
 │
 ├── React Router
 ├── Redux Toolkit
 ├── Axios ───────────────► Express REST APIs
 │
 └── Socket.IO Client ────► Socket.IO Server
                              │
                              ▼
                         Node.js Backend
                              │
                              ▼
                         MongoDB Atlas
```

---

## 🚀 Live Deployment

DevLinker is deployed as a live web application on **AWS EC2**.

### Production Infrastructure

* 🌍 Custom Domain: https://devlinker.tech
* ☁️ AWS EC2
* 🐧 Ubuntu
* ⚡ Nginx Reverse Proxy
* 🚀 PM2 Process Manager
* 📌 Elastic IP
* 🔒 HTTPS / SSL using Let's Encrypt

The React frontend is built using Vite and served as a production build through Nginx.

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/09asad/devlinker-frontend.git
```

### 2. Move into the project directory

```bash
cd devlinker-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

---

## 📁 Project Structure

```text
src/
├── components/
├── pages/
├── store/
├── utils/
├── App.jsx
└── main.jsx
```

---

## 🔗 Related Repository

### Backend

https://github.com/09asad/devlinker-backend

The backend repository contains the Node.js + Express server, MongoDB integration, authentication, Socket.IO server, premium membership logic, and Razorpay payment integration.

---

## 🔮 Future Improvements

* 🎯 Skill-based developer matching
* 🤝 Project collaboration
* 👥 Developer communities
* 📞 Voice calling between connections
* 💼 Job and internship opportunities
* 📱 Dedicated mobile application
* 🤖 AI-assisted developer matching
* 🔔 Advanced real-time notifications

---

## 👨‍💻 Author

**Asad Khan**

GitHub: https://github.com/09asad

---

⭐ If you like DevLinker, consider giving the repository a star!
