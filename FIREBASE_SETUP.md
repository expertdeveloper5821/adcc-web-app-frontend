# Firebase Authentication Setup

## Prerequisites
1. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Authentication enabled in Firebase Console
3. Email/Password authentication method enabled

## Setup Instructions

### 1. Get Firebase Configuration
1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Click on the Web app icon (`</>`) if you haven't created a web app yet
4. Copy the Firebase configuration object

### 2. Configure Environment Variables
Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Update Firebase Config
Update `src/config/firebase.ts` with your actual Firebase configuration values.

### 4. Enable Authentication Methods
In Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. (Optional) Enable other providers like Phone, Google, etc.

## Authentication Flow

1. **User Registration/Login**: User authenticates with Firebase (email/password)
2. **Token Verification**: Firebase ID token is sent to backend `/v1/auth/verify`
3. **User Registration**: If new user, complete registration with `/v1/auth/register`
4. **Token Storage**: Access token and refresh token stored in localStorage
5. **Protected Routes**: All dashboard routes require authentication

## API Endpoints Used

- `POST /v1/auth/verify` - Verify Firebase token
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user
- `GET /v1/auth/me` - Get current user profile

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the app - you should see the login page
3. Create a new account or login with existing credentials
4. After successful authentication, you'll be redirected to the dashboard
