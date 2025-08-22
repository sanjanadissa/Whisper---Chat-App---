# Whisper Chat Application

A secure messaging application with authentication system.

## Features

- **Authentication System**: Login and registration with OTP verification
- **Real-time Chat**: Send and receive messages in real-time
- **User Management**: User profiles and settings
- **Secure**: JWT token-based authentication

## Authentication Flow

### Login Process

1. User enters email address
2. Clicks "Send OTP" button → calls `auth/send-login-otp` endpoint
3. User enters 6-digit OTP code
4. Clicks "Login" button → calls `auth/login` endpoint
5. Receives JWT token and redirects to chat interface

### Registration Process

1. User enters email address
2. Clicks "Send OTP" button → calls `auth/send-registration-otp` endpoint
3. User fills in additional details (phone, username, full name, description)
4. User enters 6-digit OTP code
5. Clicks "Create Account" button → calls `auth/register` endpoint
6. User is redirected to login screen

### Navigation

- **Login Screen**: Default route (`/login`)
- **Registration Screen**: `/register`
- **Chat Interface**: `/chat` (protected route)
- **Settings Screen**: `/settings` (protected route)

## Backend Endpoints

The frontend communicates with the following backend endpoints:

- `POST /auth/send-login-otp` - Send OTP for login
- `POST /auth/send-registration-otp` - Send OTP for registration
- `POST /auth/login` - Login with OTP
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user info
- `GET /user/getchats` - Get user's chats
- `GET /message/getmessages/{chatId}` - Get messages for a chat
- `POST /message/sendmessage` - Send a message

## Token Management

- JWT tokens are stored in localStorage
- Tokens are automatically included in API requests
- Tokens are cleared on logout
- Protected routes redirect to login if no valid token

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Requirements

Make sure your Spring Boot backend is running on `http://localhost:8080` with the following endpoints available:

- Authentication endpoints in `AuthController`
- User management endpoints
- Message endpoints

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   ├── login-screen/          # Login screen components
│   ├── registration-screen/   # Registration screen components
│   ├── settings-screen/       # Settings screen
│   ├── Sidebar.tsx           # Chat sidebar
│   ├── ChatArea.tsx          # Chat interface
│   └── ProtectedRoute.tsx    # Route protection
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── App.tsx                   # Main app with routing
└── main.tsx                  # App entry point
```

## Technologies Used

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TypeScript** - Type safety

## Security Features

- JWT token-based authentication
- Protected routes
- Automatic token management
- Secure API communication
- Input validation and error handling
