# OutOfOffice Clone

A React Native mobile app that combines social event discovery with Tinder-like swiping functionality. Built with Expo, Firebase authentication, and React Navigation.

## Features

- **Authentication**: Firebase email/password login
- **Event Discovery**: Swipeable event cards with Tinder-like interface
- **Navigation**: Seamless navigation between Login and Home screens
- **Modern UI**: Beautiful, responsive design with smooth animations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

## Setup Instructions

### 1. Install Dependencies

```bash
cd OutOfOfficeClone
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password sign-in method
4. Get your Firebase configuration:
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click on the web app icon
   - Copy the config object

5. Update the Firebase configuration in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3. Create Test User

1. In Firebase Console, go to Authentication
2. Click "Add User"
3. Enter an email and password for testing

## Running the App

### Development Mode

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Show a QR code for mobile testing

### Testing on Mobile

1. Install the **Expo Go** app on your phone
2. Scan the QR code displayed in the terminal or browser
3. The app will load on your device

### Testing on Web

```bash
npm run web
```

### Testing on Android Emulator

```bash
npm run android
```

### Testing on iOS Simulator (macOS only)

```bash
npm run ios
```

## App Structure

```
OutOfOfficeClone/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   └── screens/
│       ├── LoginScreen.js       # Login screen with Firebase auth
│       └── HomeScreen.js        # Home screen with swipeable cards
├── App.js                       # Main app with navigation setup
├── package.json
└── README.md
```

## Features Explained

### Login Screen
- Clean, modern design
- Email and password input fields
- Firebase authentication integration
- Loading states and error handling
- Automatic navigation to Home screen after successful login

### Home Screen
- Tinder-like swipeable event cards
- Dummy event data with images, titles, locations, and times
- Smooth animations and gesture handling
- Like/Nope buttons for manual swiping
- Logout functionality
- "No more events" state when all cards are swiped

### Navigation
- React Navigation v6 with stack navigator
- Automatic routing based on authentication state
- No headers (clean, full-screen experience)

## Customization

### Adding More Events
Edit the `dummyEvents` array in `src/screens/HomeScreen.js`:

```javascript
const dummyEvents = [
  {
    id: 6,
    title: 'Your Event Title',
    location: 'Event Location',
    time: 'Event Time',
    image: 'https://your-image-url.com/image.jpg',
    attendees: 25,
    category: 'Category'
  },
  // ... more events
];
```

### Styling
- All styles are defined in StyleSheet objects within each component
- Colors, fonts, and spacing can be easily customized
- Responsive design using Dimensions API

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Ensure Firebase project is properly configured
   - Check that Email/Password authentication is enabled
   - Verify API keys are correct

2. **Gesture Handler Issues**
   - Make sure `react-native-gesture-handler` is installed
   - Ensure `GestureHandlerRootView` wraps the entire app

3. **Navigation Issues**
   - Verify all React Navigation dependencies are installed
   - Check that screens are properly exported

4. **Image Loading Issues**
   - Ensure image URLs are accessible
   - Check network connectivity

### Dependencies

Key dependencies used:
- `expo`: React Native development platform
- `@react-navigation/native`: Navigation library
- `@react-navigation/native-stack`: Stack navigator
- `firebase`: Firebase SDK for authentication
- `react-native-gesture-handler`: Gesture handling
- `@expo/vector-icons`: Icon library

## Next Steps

Potential enhancements:
- User registration screen
- Event creation functionality
- User profiles
- Real-time event data from Firebase
- Push notifications
- Event details screen
- User matching system
- Chat functionality

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check Expo documentation
4. Review React Navigation documentation 