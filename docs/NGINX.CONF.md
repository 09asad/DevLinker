# Nginx Configuration in DevLinker

## 1. What is Nginx?

Nginx is a web server that serves static frontend files and acts as a reverse proxy to forward requests to the backend.

In DevLinker, Nginx serves the production React frontend and forwards API and Socket.IO requests to the Express backend.

## 2. File Location

Keep `nginx.conf` inside the frontend directory, alongside the frontend `Dockerfile`.

```text
DevLinker/
├── devLinker-backend/
├── devLinker-frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
├── compose.yaml
└── README.md
```

The frontend Dockerfile copies the configuration into Nginx:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:7777/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://backend:7777/socket.io/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 4. Configuration Explained

### `listen 80`

```nginx
listen 80;
```

Nginx listens on port 80 inside the frontend container for incoming HTTP requests.

### `server_name _`

```nginx
server_name _;
```

Acts as a catch-all server name for this server block.

### `root` and `index`

```nginx
root /usr/share/nginx/html;
index index.html;
```

- `root` specifies the directory containing the production frontend files.
- `index` specifies the default page served by Nginx.

The frontend Dockerfile copies the Vite build output from `dist` into this directory.

### API Reverse Proxy

```nginx
location /api/ {
    proxy_pass http://backend:7777/;
}
```

This forwards API requests to the backend container on port `7777`.

- `backend` is the Docker Compose service name.
- `7777` is the backend's listening port.
- Both containers must share a Docker network.

**Important:** Because `proxy_pass` ends with `/`, Nginx removes the matched `/api/` prefix when forwarding the request.

For example:

```text
Browser request:  /api/users
Backend receives: /users
```

The backend routes must match this behavior. If the backend expects `/api/users`, the proxy configuration must be adjusted.

### Forwarding Request Headers

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

These headers forward the original host, client IP information, proxy chain, and original request protocol to the backend.

### Socket.IO Reverse Proxy

```nginx
location /socket.io/ {
    proxy_pass http://backend:7777/socket.io/;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

This forwards Socket.IO traffic to the backend.

- `proxy_http_version 1.1` enables HTTP/1.1 proxying.
- `Upgrade` and `Connection` headers allow WebSocket connection upgrades.
- `proxy_pass` specifies the Socket.IO endpoint on the backend.

These settings allow Socket.IO to establish WebSocket connections through Nginx.

### React Client-Side Routing

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This serves existing files when available. Otherwise, it falls back to `index.html`, allowing React Router to handle frontend routes.

For example, directly opening `/profile` should load the React application instead of returning an Nginx 404, provided the frontend routing is configured correctly.

## 5. How Requests Flow

```text
Browser
   |
   v
Nginx (Frontend Container)
   |
   |-- /           --> Serves React frontend
   |
   |-- /api/       --> Express backend:7777
   |
   |-- /socket.io/ --> Socket.IO backend:7777
```

Nginx acts as the common entry point for frontend and backend traffic.

## 6. Why Did We Use Nginx?

- Serves the production React frontend.
- Reverse-proxies API requests to Express.
- Supports Socket.IO WebSocket connections.
- Enables frontend routing through React Router.
- Allows frontend and backend requests to use the same public entry point.
- Avoids requiring the browser to connect directly to the backend container's internal hostname.

## 7. Interview Answer

**Q: Why did you use Nginx in your Dockerized DevLinker project?**

I used Nginx to serve the production React frontend and act as a reverse proxy for API and Socket.IO requests. It forwards requests to the Express backend running on port `7777` over the Docker Compose network. This gives the application a single entry point and supports WebSocket connections and React client-side routing.

