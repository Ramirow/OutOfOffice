import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import NotificationService from './src/services/NotificationService';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import EventAttendeesScreen from './src/screens/EventAttendeesScreen';
import EventChatsScreen from './src/screens/EventChatsScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigationRef = useRef(null);

  // Setup notification response handler once (for navigation on tap)
  useEffect(() => {
    NotificationService.setupNotificationResponseHandler();
  }, []);

  // Setup notifications when user is authenticated
  useEffect(() => {
    const setupNotifications = async () => {
      if (isAuthenticated && user?.id) {
        try {
          // Request permissions
          const hasPermissions = await NotificationService.requestPermissions();
          if (hasPermissions) {
            // Setup message listener
            await NotificationService.setupMessageListener(user.id);
          }
        } catch (error) {
          console.error('Error setting up notifications:', error);
        }
      } else {
        // Clean up listener when user logs out
        NotificationService.removeMessageListener();
      }
    };

    if (!isLoading) {
      setupNotifications();
    }

    // Cleanup on unmount
    return () => {
      NotificationService.removeMessageListener();
    };
  }, [isAuthenticated, user?.id, isLoading]);

  // Set navigation ref for notification navigation
  const handleNavigationReady = () => {
    if (navigationRef.current) {
      NotificationService.setNavigationRef(navigationRef.current);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={handleNavigationReady}>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EventAttendees" 
              component={EventAttendeesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EventChats" 
              component={EventChatsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}