# ServiceHub — Backend API

ServiceHub Backend is a RESTful API built with Node.js, Express.js, and MongoDB. It powers the ServiceHub freelancer marketplace by handling authentication, authorization, user management, and project operations.

## Features

- User Registration and Login
- JWT-Based Authentication
- Access and Refresh Token Handling
- Email OTP Verification
- Forgot Password and Password Recovery
- Protected API Routes
- Role-Based Authorization
- Client Project Creation and Management
- Project Status Updates
- Admin Project Management
- Client Listing for Admin
- Input Validation and Error Handling
- MongoDB Database Integration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Nodemailer

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database
- Email service credentials for OTP and password recovery

### Installation

1. Clone the repository:

   ```bash
   git clone YOUR_BACKEND_REPOSITORY_URL
   ```

2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and configure the environment variables required by your application.

   Example:

   ```env
   PORT=5000
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
   ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
   REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET
   CLIENT_URL=http://localhost:5173/client/clientDashboard
   ADMIN_URL=http://localhost:5173/admin/adminDashboard
   ```

   Add any additional variables required by your implementation, such as email credentials and token expiry settings. Use the exact names referenced in your code.

5. Start the development server using the script configured in `package.json`:

   ```bash
   npm run dev
   ```

## API Modules

### Authentication

- User Registration
- User Login
- Email OTP Verification
- Password Recovery
- Fetch Authenticated User Information
- Logout

### Project Management

- Create a Project
- Fetch Client Projects
- Fetch All Projects for Admin
- Update Project Details
- Update Project Status
- Delete or Hide Projects According to User Role

### Administration

- Fetch All Clients
- View and Manage Client Projects
- Update Project Status

Refer to the backend route files for the exact endpoints, HTTP methods, request bodies, and response formats.

## Authorization

ServiceHub uses authentication middleware to identify authenticated users and role-based checks to restrict access to protected resources.

- **Client:** Can create and manage their own projects.
- **Admin:** Can access administrative project management features and view registered clients.

Project ownership and permissions are validated on the server.

## Database

MongoDB is used to store application data, while Mongoose defines the database models and manages database operations.

## Environment Variables

The application uses environment variables for database configuration, authentication secrets, frontend origins, and email service settings.

**Never commit `.env` files, database credentials, JWT secrets, or email passwords to GitHub.**

## Error Handling

The backend uses centralized asynchronous error handling and structured API responses to manage errors and communicate results to the frontend.

## Future Improvements

- Real-Time Messaging with Socket.IO
- Freelancer Profiles and Service Listings
- Project Assignment and Collaboration Features

## Author

Developed as part of the ServiceHub full-stack portfolio project.

## License

This project is available for learning and portfolio demonstration. Add a formal license if you intend to distribute it under specific terms.