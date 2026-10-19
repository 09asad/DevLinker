# 🚀 DevLinker — Developer Networking Platform

DevLinker is a full-stack developer networking platform that helps developers discover other developers, build professional connections, chat in real time, and grow their tech network.

🌐 **Live Application:** [https://devlinker.tech](https://devlinker.tech)

## ✨ Features

### 🔐 Authentication & Security
- User signup, login, and logout
- JWT-based authentication with HTTP-only cookies
- Protected routes and secure session management
- Password hashing and input validation

### 👨‍💻 Developer Discovery
- Browse and discover developer profiles
- Explore suggested developers through a paginated feed
- Filter existing connections and pending requests

### 🤝 Connection Management
- Send connection requests
- Accept or reject incoming requests
- View accepted connections

### 💬 Real-Time Chat
- One-to-one real-time messaging
- Chat with accepted connections
- WebSocket communication using Socket.IO

### 👤 Profile Management
- View and edit developer profiles
- Update personal and professional information

### 💎 Premium Membership
- Silver and Gold membership plans
- Premium badges and ad-free experience
- Membership-based connection request limits
- Razorpay payment integration
- Payment-based membership activation

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, React Router DOM |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS, DaisyUI |
| API Communication | Axios, REST APIs |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| Real-Time Communication | Socket.IO |
| Payments | Razorpay |
| Containerization | Docker, Docker Compose |
| Web Server / Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Image Registry | Docker Hub |
| Cloud Infrastructure | AWS EC2, Ubuntu |
| Cloud Authentication | AWS IAM OIDC |
| Process Management | PM2 |

## 🏗️ Architecture

```text
                 Developer / Browser
                         |
                         v
                   Nginx (Port 80)
                         |
              +----------+-----------+
              |                      |
              v                      v
       React Frontend          Express Backend
       (Docker Container)      (Docker Container)
                                      |
                         +------------+------------+
                         |            |            |
                         v            v            v
                    MongoDB Atlas  Socket.IO    Razorpay
                                   Real-Time     Payments
                                     Chat
```

The frontend and backend run in separate Docker containers. Nginx serves the production frontend and reverse-proxies API and Socket.IO requests to the backend over the Docker Compose network.

## 🐳 Dockerization

Both the frontend and backend are containerized using separate Docker images.

- **Frontend:** React production build served by Nginx.
- **Backend:** Node.js and Express application running in its own container.
- **Docker Compose:** Manages the application containers and their configuration.
- **Docker Hub:** Stores the frontend and backend images for deployment.

This setup provides consistent environments and makes application deployment and updates easier.

## ⚙️ CI/CD Pipeline

DevLinker uses GitHub Actions to automate building, publishing, and deploying Docker images.

### Continuous Integration (CI)

When code is pushed to the `main` branch:

1. GitHub Actions checks out the repository.
2. Builds the frontend and backend Docker images.
3. Pushes the images to Docker Hub.

### Continuous Deployment (CD)

After the build-and-push job succeeds:

1. GitHub Actions obtains temporary AWS credentials through OIDC.
2. The deployment workflow temporarily allows the runner's IP address to access SSH on EC2.
3. An SSH action connects to EC2 and executes deployment commands.
4. Docker Compose pulls the latest images and updates the running containers.
5. The workflow attempts to remove the temporary SSH Security Group rule.

AWS OIDC avoids storing long-lived AWS access keys in GitHub Secrets. SSH is used to execute deployment commands remotely on EC2.

## ☁️ Production Deployment

DevLinker is deployed on AWS EC2 with the following infrastructure:

- AWS EC2 running Ubuntu
- Custom domain: [devlinker.tech](https://devlinker.tech)
- HTTPS using Let's Encrypt SSL
- Nginx for frontend serving and reverse proxying
- Docker and Docker Compose for containerized deployment
- MongoDB Atlas for database hosting
- GitHub Actions for automated CI/CD
- Docker Hub for image storage

## 📁 Project Structure

```text
DevLinker/
├── .github/
│   └── workflows/
│       └── docker-build-push.yml
├── devLinker-backend/
│   ├── src/
│   ├── Dockerfile
│   └── ...
├── devLinker-frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── docs/
│   ├── DOCKER_CICD.md
│   └── NGINX_CONF.md
├── compose.yaml
├── .gitignore
└── README.md
```

*Note: The workflow filename shown above is illustrative. Use the actual filename present in `.github/workflows/`.*

## 📦 Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/09asad/DevLinker.git
cd DevLinker
```

### Configure Environment Variables

Create the required `.env` files for the frontend and backend according to their configurations.

The backend requires environment variables for MongoDB, JWT authentication, and other integrations used by the application, such as Razorpay.

Never commit real credentials or secret keys to GitHub.

### Run with Docker Compose

Ensure Docker and Docker Compose are installed and running.

From the project root, run:

```bash
docker compose up -d --build
```

This builds the configured images and starts the application containers in the background.

Check the container status:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs
```

Stop the application:

```bash
docker compose down
```

### Access the Application

Open the application using the address configured in your Docker Compose setup, typically:

```text
http://localhost
```

The actual port depends on the port mapping configured in `compose.yaml`.

### Run Frontend and Backend Separately (Development)

For local development without Docker, install dependencies in each application directory.

**Backend:**

```bash
cd devLinker-backend
npm install
npm run dev
```

**Frontend:** Open another terminal:

```bash
cd devLinker-frontend
npm install
npm run dev
```

Ensure the required environment variables, database connection, and frontend API configuration are set before starting the applications.


## 🔮 Future Improvements

- Skill-based developer matching
- Developer communities and project collaboration
- Advanced real-time notifications
- Voice and video calling
- Job and internship opportunities
- AI-assisted developer matching

## 👨‍💻 Author

**Asad Khan**

- GitHub: [@09asad](https://github.com/09asad)
- Live Project: [devlinker.tech](https://devlinker.tech)

---

⭐ If you find DevLinker useful, consider giving the repository a star!
