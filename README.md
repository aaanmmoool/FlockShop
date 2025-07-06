# FlockShop Shared Wishlist App

A collaborative product wishlist application where multiple users can create, manage, and interact with wishlists in real-time.

## Features

- User authentication (JWT)
- Create and manage wishlists
- Add, edit, and remove products
- Real-time collaboration using Socket.io
- Invite others to join wishlists
- Track who added/edited each item
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React with Vite
- Socket.io-client for real-time updates
- React Router for navigation
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Wishlists
- `GET /api/wishlists` - Get user's wishlists
- `POST /api/wishlists` - Create new wishlist
- `GET /api/wishlists/:id` - Get specific wishlist
- `PUT /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist

### Products
- `POST /api/wishlists/:id/products` - Add product to wishlist
- `PUT /api/wishlists/:id/products/:productId` - Update product
- `DELETE /api/wishlists/:id/products/:productId` - Remove product

### Invitations
- `POST /api/wishlists/:id/invite` - Invite user to wishlist

## Assumptions and Limitations

- Authentication is implemented with JWT tokens
- Email invitations are mocked (no actual emails sent)
- Real-time updates work for users currently viewing the same wishlist
- Basic error handling and validation implemented

## Future Improvements

- Email notifications for invitations
- Push notifications for real-time updates
- Advanced search and filtering
- Product categories and tags
- Social features (comments, reactions)
- Mobile app development
- Advanced security features 
