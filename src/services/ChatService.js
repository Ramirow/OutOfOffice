// ChatService.js - Service for managing chat messages and conversations
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

class ChatService {
  /**
   * Get or create a chat between two users for an event
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {string} eventId - Event ID where they matched
   * @param {object} event - Event object
   * @returns {Promise<string>} - Chat ID
   */
  static async getOrCreateChat(userId1, userId2, eventId, event) {
    try {
      // Ensure user IDs are strings for consistent comparison
      const userId1Str = String(userId1);
      const userId2Str = String(userId2);
      
      // Create a consistent chat ID (always use smaller ID first for consistency)
      const sortedUserIds = [userId1Str, userId2Str].sort();
      const chatId = `${sortedUserIds[0]}_${sortedUserIds[1]}_${eventId}`;

      console.log('getOrCreateChat: userId1:', userId1Str, 'userId2:', userId2Str, 'eventId:', eventId, 'chatId:', chatId);

      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        // Create new chat
        await setDoc(chatRef, {
          id: chatId,
          userId1: sortedUserIds[0],
          userId2: sortedUserIds[1],
          eventId: String(eventId),
          eventTitle: event?.title || 'Event',
          eventImage: event?.image || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastMessage: null,
          lastMessageAt: null,
        });
        console.log('Created new chat:', chatId, 'userId1:', sortedUserIds[0], 'userId2:', sortedUserIds[1]);
      } else {
        console.log('Chat already exists:', chatId);
      }

      return chatId;
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
  }

  /**
   * Send a message in a chat
   * @param {string} chatId - Chat ID
   * @param {string} senderId - User ID of sender
   * @param {string} text - Message text
   * @returns {Promise<object>} - Created message
   */
  static async sendMessage(chatId, senderId, text) {
    try {
      const messageData = {
        chatId: chatId,
        senderId: senderId,
        text: text.trim(),
        timestamp: Timestamp.now(),
        read: false,
      };

      // Add message to messages collection
      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const messageDoc = await addDoc(messagesRef, messageData);

      // Update chat's last message and timestamp
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log('Message sent:', messageDoc.id);
      return {
        id: messageDoc.id,
        ...messageData,
        timestamp: messageData.timestamp.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get all messages for a chat
   * @param {string} chatId - Chat ID
   * @returns {Promise<Array>} - Array of messages
   */
  static async getChatMessages(chatId) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        messages.push({
          id: docSnapshot.id,
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        });
      });

      return messages;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  /**
   * Get all chats for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of chats with last message info
   */
  static async getUserChats(userId) {
    try {
      // Ensure userId is a string for consistent comparison
      const userIdStr = String(userId);
      console.log('getUserChats: Searching for chats for user:', userIdStr);

      // Get chats where user is userId1 or userId2
      const q1 = query(
        collection(db, CHATS_COLLECTION),
        where('userId1', '==', userIdStr),
        orderBy('updatedAt', 'desc')
      );

      const q2 = query(
        collection(db, CHATS_COLLECTION),
        where('userId2', '==', userIdStr),
        orderBy('updatedAt', 'desc')
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      console.log(`getUserChats: Found ${snapshot1.size} chats as userId1, ${snapshot2.size} chats as userId2`);

      const chats = [];

      snapshot1.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const chat = {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || data.lastMessageAt,
          otherUserId: String(data.userId2), // The other user in the chat
        };
        console.log('Chat found (userId1):', chat.id, 'otherUserId:', chat.otherUserId, 'lastMessage:', chat.lastMessage);
        chats.push(chat);
      });

      snapshot2.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const chat = {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || data.lastMessageAt,
          otherUserId: String(data.userId1), // The other user in the chat
        };
        console.log('Chat found (userId2):', chat.id, 'otherUserId:', chat.otherUserId, 'lastMessage:', chat.lastMessage);
        chats.push(chat);
      });

      // Sort by lastMessageAt (most recent first)
      chats.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

      console.log(`getUserChats: Returning ${chats.length} total chats`);
      return chats;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }
  }

  /**
   * Get chat details including other user info
   * @param {string} chatId - Chat ID
   * @param {string} currentUserId - Current user ID
   * @returns {Promise<object>} - Chat details with other user info
   */
  static async getChatDetails(chatId, currentUserId) {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        return null;
      }

      const data = chatSnap.data();
      const otherUserId = data.userId1 === currentUserId ? data.userId2 : data.userId1;

      // Get other user's profile info
      const UserService = (await import('./UserService')).default;
      const otherUser = await UserService.getUserById(otherUserId);

      return {
        id: chatSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || data.lastMessageAt,
        otherUserId: otherUserId,
        otherUser: otherUser,
      };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      return null;
    }
  }

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID (marks messages not sent by this user as read)
   * @returns {Promise<boolean>} - Success status
   */
  static async markMessagesAsRead(chatId, userId) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = [];

      querySnapshot.forEach((docSnapshot) => {
        updatePromises.push(
          updateDoc(doc(db, MESSAGES_COLLECTION, docSnapshot.id), {
            read: true,
          })
        );
      });

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }
}

export default ChatService;

