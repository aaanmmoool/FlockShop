# 🛍️ FlockShop - Collaborative Wishlist Application

FlockShop is a real-time collaborative product wishlist app where multiple users can create, manage, and interact with wishlists. Perfect for group shopping, event planning, or simply organizing your product desires together.

---

## 📸 Preview

![Login Page](./relative/path/to/your/screenshot.png)

---

## 🚀 Features

- 🔐 User authentication (JWT)
- 📋 Create and manage wishlists
- ➕ Add, edit, and remove products
- 💬 Real-time collaboration using Socket.io
- 📧 Invite others to join wishlists
- 👤 Track who added/edited each item
- 📱 Fully responsive design

---

## 🧰 Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React with Vite
- socket.io-client for live updates
- React Router for routing
- Axios for API communication

---

## 🛠️ Setup Instructions

### 🔍 Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

---

### 📦 Backend Setup

```bash
cd server
npm install
Create a .env file in the server folder:

env
Copy
Edit
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
Start the backend:

bash
Copy
Edit
npm run dev
💻 Frontend Setup
bash
Copy
Edit
cd client
npm install
npm run dev
📡 API Endpoints
🔐 Authentication
POST /api/auth/signup — Register

POST /api/auth/login — Login

📁 Wishlists
GET /api/wishlists — Get all wishlists

POST /api/wishlists — Create wishlist

GET /api/wishlists/:id — Get specific wishlist

PUT /api/wishlists/:id — Update wishlist

DELETE /api/wishlists/:id — Delete wishlist

🎁 Products
POST /api/wishlists/:id/products — Add product

PUT /api/wishlists/:id/products/:productId — Update product

DELETE /api/wishlists/:id/products/:productId — Remove product

✉️ Invitations
POST /api/wishlists/:id/invite — Invite user
