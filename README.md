# Alumni Mentorship Platform

A full-stack application connecting alumni and students for mentorship opportunities.

## Features
- **User Authentication**: Secure registration and login using JWT.
- **Smart Match Algorithm**: Automatically matches students with alumni based on a proprietary formula:
  - Skills Match: 40%
  - Domain/Industry: 30%
  - Mentorship Goals: 20%
  - Experience Level: 10%
- **Mentorship Requests**: Send, accept, or reject mentorship requests.
- **Messaging**: Real-time communication between matched users.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB

### Environment Variables
Create a `.env` file in the `server` directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```
   (Or `npm run dev` for nodemon)
2. Start the frontend client:
   ```bash
   cd client
   npm start
   ```

## API Endpoints (Brief List)

- **Auth**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Authenticate a user
- **Users**
  - `GET /api/users/profile` - Get current user profile
  - `GET /api/users/mentors` - Get list of potential mentors
- **Mentorship**
  - `POST /api/mentorship/request` - Send a mentorship request
  - `GET /api/mentorship/requests` - Get incoming/outgoing requests

## Deployment Notes
- **Frontend (Angular)**: Run `ng build --configuration production` to generate static files in the `dist/` directory. Serve these files using a web server like Nginx or configure Node to serve static files.
- **Backend (Node/Express)**: Ensure the `NODE_ENV` environment variable is set to `production`. Use a process manager like PM2 to run the server.

