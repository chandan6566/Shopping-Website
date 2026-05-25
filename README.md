# Shopping-Website

Part 1: Project Architecture Setup

shopping-mall/
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
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

Login to the Ec2 instance make sure to open the port 5000 and 80 in SG

Make 2 Directories
1.mkdir Frontend
2.mkdir Backend

cd Backend
touch pacakge.json server.js Dockerfile

cd Frontend
touch Dockerfile nginx.conf index.html pacakge.json tailwind.config.js postcss.config.js vite.config.js 

mkdir src
cd src
touch main.jsx index.css App.jsx

Now Building Image
cd Frontend
docker build -t shop-frontend-img .

cd Backend
docker build --no-cache -t shop-backend-img .

Now Create one Dedicated Network in root dir
docker network create shopping
docker network ls

Run one Dedicated psql database
docker run -d \
  --name dedicated-sql-db \
  --network shopping \
  -e POSTGRES_USER=shop_admin \
  -e POSTGRES_PASSWORD=SecretPassword123 \
  -e POSTGRES_DB=nexus_store \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
---------------------------------------------------
Now Run the Container from the images
docker run -d \
  --name backend-container \
  --network shopping \
  -e DB_HOST=dedicated-sql-db \
  -e DB_USER=shop_admin \
  -e DB_PASSWORD=SecretPassword123 \
  -e DB_NAME=nexus_store \
  shop-backend-img
----------------------------------------------------
  docker run -d \
  --name frontend-shopping-service \
  --network mall-network \
  -p 80:80 \
  shop-frontend-img
-----------------------------------------------------
To See if container are running
docker ps
------------------------------------------------------
To go inside the database
docker exec -it dedicated-sql-db psql -U shop_admin -d nexus_store
------------------------------------------------------
Once you are inside the DB you can execute sql cmd's
-- See all your products
SELECT * FROM products;

-- See all orders placed by users
SELECT * FROM orders;

-- Type \q to exit the database shell and return to Ubuntu
\q
-------------------------------------------------------
Final Output
<img width="1440" height="811" alt="image" src="https://github.com/user-attachments/assets/4c0f1141-4867-4816-a142-64842b123178" />
<img width="1440" height="811" alt="image" src="https://github.com/user-attachments/assets/ab81aef6-ffda-4f74-971f-e399d49b98a5" />
