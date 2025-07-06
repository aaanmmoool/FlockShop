# Server Setup Guide

## Environment Variables Setup

To fix the JWT signing error, you need to create a `.env` file in the server directory with the following variables:

1. Create a file named `.env` in the `server/` directory
2. Add the following content to the `.env` file:

```
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
MONGODB_URI=mongodb://localhost:27017/flockshop
PORT=5000
```

## Important Notes:

- **JWT_SECRET**: This should be a strong, random string. For production, use a more secure secret.
- **MONGODB_URI**: Make sure MongoDB is running on your system. If you're using MongoDB Atlas, replace with your connection string.
- **PORT**: The server will run on this port (default: 5000)

## MongoDB Setup

Make sure MongoDB is installed and running on your system:

### Windows:
1. Install MongoDB Community Server from the official website
2. Start MongoDB service: `net start MongoDB`

### macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Running the Server

After setting up the `.env` file and ensuring MongoDB is running:

```bash
cd server
npm install
npm run dev
```

The server should now start without the JWT signing error. 