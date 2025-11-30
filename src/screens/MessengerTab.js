import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/ChatService';
import UserService from '../services/UserService';
import { useCallback } from 'react';

const MessengerTab = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({}); // Cache user profiles

  // Load chats when component mounts
  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user?.id]);

  // Reload chats when tab comes into focus (user navigates back from chat screen)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        console.log('MessengerTab focused - reloading chats for user:', user.id);
        loadChats();
      }
    }, [user?.id])
  );

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log('Loading chats for user:', user.id);
      const userChats = await ChatService.getUserChats(user.id);
      console.log('Found chats:', userChats.length, userChats);
      
      // Load user profiles for each chat
      const chatsWithUsers = await Promise.all(
        userChats.map(async (chat) => {
          const otherUserId = chat.otherUserId;
          console.log('Processing chat:', chat.id, 'otherUserId:', otherUserId);
          
          // Check cache first
          if (userCache[otherUserId]) {
            return {
              ...chat,
              otherUser: userCache[otherUserId],
            };
          }
          
          // Fetch user profile
          const otherUser = await UserService.getUserById(otherUserId);
          if (otherUser) {
            console.log('Loaded user profile for:', otherUserId, otherUser.name || otherUser.email);
            setUserCache(prev => ({ ...prev, [otherUserId]: otherUser }));
            return {
              ...chat,
              otherUser: otherUser,
            };
          } else {
            console.warn('Could not load user profile for:', otherUserId);
          }
          
          return chat;
        })
      );
      
      // Filter out chats without user profiles (they'll be loaded on next refresh)
      const validChats = chatsWithUsers.filter(chat => chat.otherUser);
      console.log('Valid chats with user profiles:', validChats.length);
      setChats(validChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleChatPress = (chat) => {
    const otherUser = chat.otherUser;
    if (!otherUser) {
      console.error('Other user not found for chat:', chat.id);
      return;
    }

    // Navigate to chat screen
    navigation.navigate('Chat', {
      chatId: chat.id,
      event: {
        id: chat.eventId,
        title: chat.eventTitle,
        image: chat.eventImage,
      },
      otherUser: otherUser,
      matches: [otherUser], // For compatibility with existing ChatScreen
    });
  };

  const renderChatItem = ({ item }) => {
    const otherUser = item.otherUser;
    if (!otherUser) {
      return null; // Skip if user not loaded yet
    }

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: otherUser.image || otherUser.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{otherUser.name || otherUser.email}</Text>
            <Text style={styles.chatTime}>{formatTime(item.lastMessageAt || item.updatedAt)}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.chatEvent} numberOfLines={1}>
              {item.eventTitle}
            </Text>
            {item.lastMessage ? (
              <Text style={styles.chatPreview} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            ) : (
              <Text style={[styles.chatPreview, { fontStyle: 'italic', color: '#999' }]} numberOfLines={1}>
                No messages yet
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
        <Text style={styles.emptyStateText}>
          Start swiping on attended events to match and chat with other attendees!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Messages</Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadChats}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 10,
  },
  chatsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatEvent: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 8,
    flex: 1,
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MessengerTab;

