// NotificationService.js - Service for managing push notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { onSnapshot, query, collection, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import UserService from './UserService';

const MESSAGES_COLLECTION = 'messages';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  static messageListener = null;
  static initialized = false;
  static currentUserId = null;
  static currentChatId = null; // Track currently viewed chat to avoid notifications
  static navigationRef = null; // Reference to navigation container

  /**
   * Request notification permissions
   * @returns {Promise<boolean>} - True if permissions granted
   */
  static async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Setup real-time listener for new messages
   * @param {string} userId - Current user ID
   */
  static async setupMessageListener(userId) {
    // Don't setup if already initialized for this user
    if (this.initialized && this.currentUserId === userId) {
      return;
    }

    // Clean up existing listener
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = null;
    }

    this.currentUserId = userId;
    this.initialized = true;

    try {
      // Get all chats for this user first
      const ChatService = (await import('./ChatService')).default;
      const userChats = await ChatService.getUserChats(userId);
      const chatIds = userChats.map(chat => chat.id);

      if (chatIds.length === 0) {
        console.log('No chats found for user, skipping notification listener setup');
        return;
      }

      // Track processed messages to avoid duplicate notifications
      const processedMessageIds = new Set();

      // Listen to all messages and filter by chatIds and userId
      // Since Firestore doesn't support 'in' queries with orderBy easily,
      // we'll listen to recent messages and filter in the callback
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      this.messageListener = onSnapshot(
        messagesQuery,
        async (snapshot) => {
          const changes = snapshot.docChanges();
          const now = Date.now();
          
          for (const change of changes) {
            if (change.type === 'added') {
              const messageData = change.doc.data();
              const messageId = change.doc.id;

              // Skip if already processed
              if (processedMessageIds.has(messageId)) {
                continue;
              }

              // Only process messages from the last 5 minutes (to avoid old messages triggering notifications)
              const messageTime = messageData.timestamp?.toDate?.()?.getTime() || 0;
              if (now - messageTime > 5 * 60 * 1000) {
                continue;
              }

              // Check if message is for one of user's chats
              if (
                chatIds.includes(messageData.chatId) &&
                messageData.senderId !== userId &&
                !messageData.read
              ) {
                processedMessageIds.add(messageId);
                await this.handleNewMessage(messageData, userId);
              }
            }
          }

          // Clean up old message IDs (keep only last 100)
          if (processedMessageIds.size > 100) {
            const idsArray = Array.from(processedMessageIds);
            idsArray.slice(0, idsArray.length - 100).forEach(id => processedMessageIds.delete(id));
          }
        },
        (error) => {
          console.error('Error in message listener:', error);
        }
      );

      console.log('✅ Message notification listener setup complete for', chatIds.length, 'chats');
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }
  }

  /**
   * Set the current chat ID (to avoid showing notifications for active chat)
   * @param {string} chatId - Currently viewed chat ID
   */
  static setCurrentChatId(chatId) {
    this.currentChatId = chatId;
  }

  /**
   * Clear the current chat ID
   */
  static clearCurrentChatId() {
    this.currentChatId = null;
  }

  /**
   * Handle a new message and show notification
   * @param {object} messageData - Message data from Firestore
   * @param {string} currentUserId - Current user ID
   */
  static async handleNewMessage(messageData, currentUserId) {
    try {
      // Don't notify if user is currently viewing this chat
      if (messageData.chatId === this.currentChatId) {
        return;
      }

      // Get sender's user info
      const sender = await UserService.getUserById(messageData.senderId);
      const senderName = sender?.name || sender?.email || 'Someone';

      // Get chat details (we need to determine which chat this is)
      // The chatId is in messageData
      const chatId = messageData.chatId;

      // Truncate long messages
      const messageText = messageData.text || 'New message';
      const truncatedText = messageText.length > 100 
        ? messageText.substring(0, 100) + '...' 
        : messageText;

      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: senderName,
          body: truncatedText,
          data: {
            chatId: chatId,
            senderId: messageData.senderId,
          },
          sound: true,
        },
        trigger: null, // Show immediately
      });

      console.log('Notification sent for message from:', senderName);
    } catch (error) {
      console.error('Error handling new message notification:', error);
    }
  }

  /**
   * Remove message listener
   */
  static removeMessageListener() {
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = null;
    }
    this.initialized = false;
    this.currentUserId = null;
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification permissions status
   * @returns {Promise<boolean>} - True if permissions granted
   */
  static async hasPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Set navigation reference for handling notification taps
   * @param {object} navigationRef - Navigation container reference
   */
  static setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef;
  }

  /**
   * Setup notification response handler (when user taps notification)
   * This should be called once in App.js
   */
  static setupNotificationResponseHandler() {
    // Handle notification tap when app is in foreground or background
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const notification = response.notification;
      const data = notification.request.content.data;
      
      console.log('Notification tapped:', data);
      
      if (data.chatId && data.senderId && this.navigationRef) {
        await this.handleNotificationNavigation(data.chatId, data.senderId);
      }
    });

    // Handle notification tap when app is opened from quit state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const notification = response.notification;
        const data = notification.request.content.data;
        
        console.log('App opened from notification:', data);
        
        if (data.chatId && data.senderId && this.navigationRef) {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            this.handleNotificationNavigation(data.chatId, data.senderId);
          }, 1000);
        }
      }
    });
  }

  /**
   * Handle navigation to chat when notification is tapped
   * @param {string} chatId - Chat ID from notification
   * @param {string} senderId - Sender user ID
   */
  static async handleNotificationNavigation(chatId, senderId) {
    try {
      // Wait for navigation ref to be available (with timeout)
      let attempts = 0;
      const maxAttempts = 10;
      while (!this.navigationRef && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }

      if (!this.navigationRef) {
        console.warn('Navigation ref not available after waiting');
        return;
      }

      if (!this.currentUserId) {
        console.warn('User ID not available - user may not be logged in');
        return;
      }

      // Get chat details
      const ChatService = (await import('./ChatService')).default;
      const chatDetails = await ChatService.getChatDetails(chatId, this.currentUserId);
      
      if (!chatDetails || !chatDetails.otherUser) {
        console.error('Could not load chat details for navigation');
        return;
      }

      // Get event info from chat
      const event = {
        id: chatDetails.eventId,
        title: chatDetails.eventTitle || 'Event',
        image: chatDetails.eventImage || '',
      };

      // Navigate to Chat screen
      this.navigationRef.navigate('Chat', {
        chatId: chatId,
        event: event,
        otherUser: chatDetails.otherUser,
        matches: [chatDetails.otherUser],
      });

      console.log('✅ Navigated to chat from notification:', chatId);
    } catch (error) {
      console.error('Error navigating to chat from notification:', error);
    }
  }
}

export default NotificationService;

