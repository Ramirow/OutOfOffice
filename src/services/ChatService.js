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
      // Validate message text - don't send empty or null messages
      const trimmedText = text?.trim();
      if (!trimmedText || trimmedText.length === 0) {
        throw new Error('Cannot send empty message');
      }

      const messageData = {
        chatId: chatId,
        senderId: senderId,
        text: trimmedText,
        timestamp: Timestamp.now(),
        read: false,
      };

      // Add message to messages collection
      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const messageDoc = await addDoc(messagesRef, messageData);

      // Update chat's last message and timestamp (only if message is valid)
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        lastMessage: trimmedText,
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
  /**
   * Extract actual user ID from event-based attendee ID
   * e.g., "1763916921410_1" -> "1"
   * @param {string} id - ID that might be event-based
   * @returns {string} - Actual user ID
   */
  static extractUserId(id) {
    if (!id) return id;
    const idStr = String(id);
    // If it contains underscore and looks like eventId_userId format, extract userId
    if (idStr.includes('_')) {
      const parts = idStr.split('_');
      // Check if it's likely eventId_userId format (last part is numeric and short)
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        // If last part is a short number (likely user ID), use it
        if (/^\d+$/.test(lastPart) && lastPart.length < 10) {
          return lastPart;
        }
      }
    }
    return idStr;
  }

  static async getUserChats(userId) {
    try {
      // Ensure userId is a string for consistent comparison
      const userIdStr = String(userId);
      console.log('getUserChats: Searching for chats for user:', userIdStr);

      // DEBUG: Get all chats to see what's in the database
      const allChats = await this.getAllChats();

      let snapshot1, snapshot2;

      try {
        // Try queries with orderBy (requires composite index)
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

        [snapshot1, snapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2),
        ]);
      } catch (indexError) {
        // If index error, try without orderBy (fallback)
        console.warn('Index error, trying fallback query without orderBy:', indexError.message);
        
        const q1Fallback = query(
          collection(db, CHATS_COLLECTION),
          where('userId1', '==', userIdStr)
        );

        const q2Fallback = query(
          collection(db, CHATS_COLLECTION),
          where('userId2', '==', userIdStr)
        );

        [snapshot1, snapshot2] = await Promise.all([
          getDocs(q1Fallback),
          getDocs(q2Fallback),
        ]);
      }

      // Also fetch all chats and filter manually to catch chats with event-based IDs
      const allChatsSnapshot = await getDocs(collection(db, CHATS_COLLECTION));
      const manualMatches = [];
      
      allChatsSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const dataUserId1 = String(data.userId1 || '');
        const dataUserId2 = String(data.userId2 || '');
        
        // Extract actual user IDs (handle event-based IDs like "1763916921410_1")
        const actualUserId1 = this.extractUserId(dataUserId1);
        const actualUserId2 = this.extractUserId(dataUserId2);
        
        // Check if this chat belongs to the current user
        if (actualUserId1 === userIdStr || actualUserId2 === userIdStr) {
          // Make sure we don't duplicate chats already found by queries
          const alreadyFound = [...snapshot1.docs, ...snapshot2.docs].some(
            doc => doc.id === docSnapshot.id
          );
          
          if (!alreadyFound) {
            manualMatches.push(docSnapshot);
            console.log('Found chat with event-based ID (manual match):', docSnapshot.id, 
              'original userId1:', dataUserId1, 'extracted:', actualUserId1,
              'original userId2:', dataUserId2, 'extracted:', actualUserId2);
          }
        }
      });

      console.log(`getUserChats: Found ${snapshot1.size} chats as userId1, ${snapshot2.size} chats as userId2`);

      const chats = [];

      // Process chats from query results (with unread counts)
      const chatPromises = [...snapshot1.docs, ...snapshot2.docs, ...manualMatches].map(async (docSnapshot) => {
        const data = docSnapshot.data();
        // Ensure userId1 and userId2 are strings for comparison
        const dataUserId1 = String(data.userId1 || '');
        const dataUserId2 = String(data.userId2 || '');
        
        // Extract actual user IDs (handle event-based IDs)
        const actualUserId1 = this.extractUserId(dataUserId1);
        const actualUserId2 = this.extractUserId(dataUserId2);
        
        // Determine which user is the current user and which is the other user
        let otherUserId;
        if (actualUserId1 === userIdStr) {
          otherUserId = actualUserId2;
        } else if (actualUserId2 === userIdStr) {
          otherUserId = actualUserId1;
        } else {
          // Skip if this chat doesn't belong to current user
          return null;
        }
        
        // Get unread message count for this chat
        const unreadCount = await this.getUnreadMessageCount(docSnapshot.id, userIdStr);
        
        return {
          id: docSnapshot.id,
          ...data,
          userId1: actualUserId1, // Store normalized user IDs
          userId2: actualUserId2,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || data.lastMessageAt,
          otherUserId: otherUserId, // The other user in the chat
          unreadCount: unreadCount, // Number of unread messages
        };
      });

      // Wait for all unread counts to be fetched
      const processedChats = await Promise.all(chatPromises);
      
      // Filter out nulls and duplicates
      processedChats.forEach((chat) => {
        if (chat && !chats.find(c => c.id === chat.id)) {
          console.log('Chat found:', chat.id, 'userId1:', chat.userId1, 'userId2:', chat.userId2, 'otherUserId:', chat.otherUserId, 'lastMessage:', chat.lastMessage, 'unreadCount:', chat.unreadCount);
          chats.push(chat);
        }
      });

      // Remove duplicates by chat ID (in case a chat appears in both queries)
      const uniqueChatsById = chats.filter((chat, index, self) => 
        index === self.findIndex(c => c.id === chat.id)
      );

      // Merge chats for the same users and event (keep the one with most recent message)
      // Group chats by userId1+userId2+eventId combination
      const chatGroups = new Map();
      
      uniqueChatsById.forEach(chat => {
        // Create a key based on normalized user IDs and event ID
        const key = [chat.userId1, chat.userId2, chat.eventId].sort().join('_');
        
        if (!chatGroups.has(key)) {
          chatGroups.set(key, []);
        }
        chatGroups.get(key).push(chat);
      });

      // For each group, keep only the chat with the most recent message
      const mergedChats = [];
      chatGroups.forEach((groupChats, key) => {
        if (groupChats.length === 1) {
          // Only one chat in this group, keep it
          mergedChats.push(groupChats[0]);
        } else {
          // Multiple chats for same users/event - merge them
          console.log(`Merging ${groupChats.length} duplicate chats for key: ${key}`);
          
          // Sort by lastMessageAt (most recent first), then by updatedAt
          groupChats.sort((a, b) => {
            const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });

          // Keep the most recent chat (first one after sorting)
          const bestChat = groupChats[0];
          
          // Sum up unread counts from all chats in the group (in case messages are in different chats)
          const totalUnreadCount = groupChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
          bestChat.unreadCount = totalUnreadCount;
          
          // If there are other chats with messages, we could merge their messages
          // For now, we just keep the most recent one
          mergedChats.push(bestChat);
          
          console.log(`Keeping chat ${bestChat.id} (has ${bestChat.lastMessage ? 'message' : 'no message'}, unread: ${totalUnreadCount}), ignoring ${groupChats.length - 1} duplicate(s)`);
        }
      });

      // Sort by lastMessageAt (most recent first)
      mergedChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

      console.log(`getUserChats: Returning ${mergedChats.length} total chats (after merging duplicates)`);
      return mergedChats;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
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
   * DEBUG: Get all chats in the database (for debugging purposes)
   * @returns {Promise<Array>} - Array of all chats
   */
  static async getAllChats() {
    try {
      const q = query(collection(db, CHATS_COLLECTION));
      const snapshot = await getDocs(q);
      
      const allChats = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        allChats.push({
          id: docSnapshot.id,
          userId1: data.userId1,
          userId2: data.userId2,
          eventId: data.eventId,
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || data.lastMessageAt,
        });
      });
      
      console.log('DEBUG getAllChats: Found', allChats.length, 'total chats in database:');
      allChats.forEach(chat => {
        console.log('  - Chat ID:', chat.id, 'userId1:', chat.userId1, 'userId2:', chat.userId2, 'eventId:', chat.eventId, 'lastMessage:', chat.lastMessage);
      });
      
      return allChats;
    } catch (error) {
      console.error('Error getting all chats:', error);
      return [];
    }
  }

  /**
   * Get unread message count for a chat
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID (counts messages not sent by this user)
   * @returns {Promise<number>} - Number of unread messages
   */
  static async getUnreadMessageCount(chatId, userId) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
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

