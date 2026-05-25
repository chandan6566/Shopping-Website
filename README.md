# Shopping Website

A Dockerized full-stack shopping mall application with:

- Frontend using Vite + Tailwind CSS
- Backend using Node.js
- PostgreSQL Database
- Docker Networking
- Nginx Reverse Proxy

---

# Project Architecture

```bash
shopping-mall/
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── index.css
        └── App.jsx
```

---

# Prerequisites

Before starting:

- Launch an EC2 Instance
- Install Docker
- Open the following ports in the Security Group:
  - Port `80`
  - Port `5000`

---

# Create Project Directories

```bash
mkdir Frontend
mkdir Backend
```

---

# Backend Setup

```bash
cd Backend

touch package.json
touch server.js
touch Dockerfile
```

---

# Frontend Setup

```bash
cd Frontend

touch Dockerfile
touch nginx.conf
touch index.html
touch package.json
touch tailwind.config.js
touch postcss.config.js
touch vite.config.js

mkdir src

cd src

touch main.jsx
touch index.css
touch App.jsx
```

---

# Build Docker Images

## Build Frontend Image

```bash
cd Frontend

docker build -t shop-frontend-img .
```

## Build Backend Image

```bash
cd Backend

docker build --no-cache -t shop-backend-img .
```

---

# Create Docker Network

```bash
docker network create shopping

docker network ls
```

---

# Run PostgreSQL Database Container

```bash
docker run -d \
  --name dedicated-sql-db \
  --network shopping \
  -e POSTGRES_USER=shop_admin \
  -e POSTGRES_PASSWORD=SecretPassword123 \
  -e POSTGRES_DB=nexus_store \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

---

# Run Backend Container

```bash
docker run -d \
  --name backend-container \
  --network shopping \
  -e DB_HOST=dedicated-sql-db \
  -e DB_USER=shop_admin \
  -e DB_PASSWORD=SecretPassword123 \
  -e DB_NAME=nexus_store \
  shop-backend-img
```

---

# Run Frontend Container

```bash
docker run -d \
  --name frontend-shopping-service \
  --network shopping \
  -p 80:80 \
  shop-frontend-img
```

---

# Verify Running Containers

```bash
docker ps
```

---

# Access PostgreSQL Database

```bash
docker exec -it dedicated-sql-db psql -U shop_admin -d nexus_store
```

---

# Execute SQL Commands

## View Products

```sql
SELECT * FROM products;
```

## View Orders

```sql
SELECT * FROM orders;
```

## Exit Database Shell

```sql
\q
```

---

# Final Output

## Home Page

![Shopping Website Screenshot 1](https://github.com/user-attachments/assets/4c0f1141-4867-4816-a142-64842b123178)

---

## Products Page

![Shopping Website Screenshot 2](https://github.com/user-attachments/assets/ab81aef6-ffda-4f74-971f-e399d49b98a5)

---

# Technologies Used

- Node.js
- PostgreSQL
- Docker
- Nginx
- Vite
- Tailwind CSS
- React

---

# Author

Chandan R
