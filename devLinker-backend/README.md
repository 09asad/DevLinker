# 🚀 DevLinker Backend

Backend API for **DevLinker**, a full-stack developer networking platform where developers can connect, send connection requests, and build professional tech networks.

🌐 **Live Application:** https://devlinker.tech

---

## 📌 About

DevLinker Backend is built using **Node.js**, **Express.js**, and **MongoDB Atlas**. It provides secure REST APIs for user authentication, profile management, developer discovery, connection requests, and networking.

The backend follows a modular architecture and uses **JWT authentication with HTTP-only cookies** for secure session management.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt.js
- Cookie Parser
- Validator
- CORS
- PM2
- Nginx
- AWS EC2

---

## ✨ Features

### 🔐 Authentication

- User Signup
- User Login
- JWT Authentication
- HTTP-only Cookie-based Sessions
- Logout

### 👤 Profile Management

- View Profile
- Edit Profile
- Update User Information

### 👨‍💻 Developer Feed

- Browse Suggested Developers
- Pagination Support
- Filters Existing Connections & Pending Requests

### 🤝 Connection Requests

- Send Connection Requests
- Accept Requests
- Reject Requests

### 🌐 Connections

- View All Accepted Connections

### 🛡️ Security

- Password Hashing with bcrypt
- JWT-based Authentication
- Protected Routes
- Input Validation
- Secure Cookie Authentication
- CORS Configuration

---

## 🚀 Production Deployment

The backend is deployed on **AWS EC2** using a production-ready setup:

- 🌍 Custom Domain (**devlinker.tech**)
- 🔒 HTTPS using Let's Encrypt SSL
- ⚡ Nginx Reverse Proxy
- 🚀 PM2 Process Manager
- 📌 Elastic IP
- ☁️ MongoDB Atlas Database

---

## 📡 REST API

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/signup` |
| POST | `/login` |
| POST | `/logout` |

### Profile

| Method | Endpoint |
|---------|----------|
| GET | `/profile/view` |
| PATCH | `/profile/edit` |

### Feed

| Method | Endpoint |
|---------|----------|
| GET | `/feed` |

### Connection Requests

| Method | Endpoint |
|---------|----------|
| POST | `/request/send/:status/:userId` |
| POST | `/request/review/:status/:requestId` |

### Connections

| Method | Endpoint |
|---------|----------|
| GET | `/user/connections` |

---

## 📦 Installation

Clone the repository

```bash
git clone https://github.com/09asad/devlinker-backend.git
```

Navigate to the project

```bash
cd devlinker-backend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
├── config/
├── middleware/
├── models/
├── routes/
├── utils/
├── app.js
└── server.js
```

---

## 🔮 Future Improvements

- 💬 Real-time Chat using Socket.IO
- 🔔 Real-time Notifications
- 🔍 Developer Search
- 🏷️ Skill-based Developer Matching
- 📊 User Activity Dashboard

---

## 🔗 Related Repository

**Frontend Repository**

https://github.com/09asad/devlinker-frontend

---

## 👨‍💻 Author

**Asad Khan**

GitHub: https://github.com/09asad

---

⭐ If you found this project useful, consider giving it a star!
