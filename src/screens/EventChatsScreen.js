import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/ChatService';
import UserService from '../services/UserService';
import AttendeeService from '../services/AttendeeService';

const EventChatsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params || {};
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventChats();
  }, [event, user]);

  const loadEventChats = async () => {
    try {
      setLoading(true);
      const eventId = event?.id?.toString() || event?.eventId?.toString() || event?.id;

      if (!eventId || !user?.id) {
        setLoading(false);
        return;
      }

      console.log('EventChatsScreen: Loading chats for eventId:', eventId, 'userId:', user.id);

      // Get all chats for this event
      const allChats = await ChatService.getUserChats(user.id);
      console.log('EventChatsScreen: All chats:', allChats.length, allChats.map(c => ({ id: c.id, eventId: c.eventId })));
      
      // Filter chats for this event (normalize event IDs for comparison)
      const eventChats = allChats.filter(chat => {
        const chatEventId = String(chat.eventId || '');
        const normalizedEventId = String(eventId);
        const matches = chatEventId === normalizedEventId;
        if (!matches) {
          console.log('EventChatsScreen: Chat eventId mismatch:', chatEventId, 'vs', normalizedEventId);
        }
        return matches;
      });
      
      console.log('EventChatsScreen: Filtered event chats:', eventChats.length, eventChats.map(c => ({ id: c.id, eventId: c.eventId, lastMessage: c.lastMessage })));

      // Get matches for this event
      const eventMatches = await AttendeeService.getUserMatches(eventId, user.id);
      console.log('EventChatsScreen: Event matches:', eventMatches?.length || 0, eventMatches);

      // Load user profiles for matches
      const matchesWithProfiles = await Promise.all(
        (eventMatches || []).map(async (match) => {
          const userId = match.userId || match.id?.split('_')[1];
          if (userId) {
            const userProfile = await UserService.getUserById(userId);
            return {
              ...match,
              user: userProfile,
              userId: userId,
            };
          }
          return match;
        })
      );

      // Load user profiles for existing chats
      const chatsWithProfiles = await Promise.all(
        eventChats.map(async (chat) => {
          const otherUserId = chat.otherUserId;
          const otherUser = await UserService.getUserById(otherUserId);
          return {
            ...chat,
            otherUser: otherUser,
          };
        })
      );

      // Separate chats with messages and chats without messages
      const chatsWithMessages = chatsWithProfiles.filter(c => c.otherUser && c.lastMessage);
      const chatsWithoutMessages = chatsWithProfiles.filter(c => c.otherUser && !c.lastMessage);

      // Combine chats and matches, removing duplicates
      const chatUserIds = new Set(chatsWithProfiles.map(c => c.otherUserId));
      const newMatches = matchesWithProfiles.filter(m => {
        const matchUserId = m.userId || m.user?.id;
        return matchUserId && !chatUserIds.has(matchUserId);
      });

      // Convert chats without messages to "match" format so users can start chatting
      const chatsAsMatches = chatsWithoutMessages.map(chat => ({
        type: 'match',
        user: chat.otherUser,
        userId: chat.otherUserId,
        chatId: chat.id, // Store chat ID so we can use existing chat
      }));

      const validMatches = [...newMatches.filter(m => m.user), ...chatsAsMatches];
      
      console.log('EventChatsScreen: Final results - chats with messages:', chatsWithMessages.length, 'matches:', validMatches.length);
      console.log('EventChatsScreen: Chats without messages converted to matches:', chatsAsMatches.length);
      
      setChats(chatsWithMessages);
      setMatches(validMatches);
    } catch (error) {
      console.error('Error loading event chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (chat) => {
    if (!chat.otherUser) return;

    navigation.navigate('Chat', {
      chatId: chat.id,
      event: {
        id: chat.eventId,
        title: chat.eventTitle,
        image: chat.eventImage,
      },
      otherUser: chat.otherUser,
      matches: [chat.otherUser],
    });
  };

  const handleMatchPress = async (match) => {
    if (!match.user) return;

    try {
      const eventId = event?.id?.toString() || event?.eventId?.toString() || event?.id;
      const otherUserId = match.userId || match.user?.id;

      // If chat already exists (from chats without messages), use existing chatId
      let chatId = match.chatId;
      
      if (!chatId) {
        // Create or get chat
        chatId = await ChatService.getOrCreateChat(
          user.id,
          otherUserId,
          eventId,
          event
        );
      }

      // Navigate to chat
      navigation.navigate('Chat', {
        chatId: chatId,
        event: event,
        otherUser: match.user,
        matches: [match.user],
      });
    } catch (error) {
      console.error('Error creating chat:', error);
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

  const renderChatItem = ({ item }) => {
    const otherUser = item.otherUser;
    if (!otherUser) return null;

    const unreadCount = item.unreadCount || 0;
    const hasUnread = unreadCount > 0;

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
            <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]}>
              {otherUser.name || otherUser.email}
            </Text>
            <View style={styles.chatHeaderRight}>
              <Text style={styles.chatTime}>{formatTime(item.lastMessageAt || item.updatedAt)}</Text>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {item.lastMessage && (
            <Text style={[styles.chatPreview, hasUnread && styles.chatPreviewUnread]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderMatchItem = ({ item }) => {
    const matchUser = item.user;
    if (!matchUser) return null;

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => handleMatchPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: matchUser.image || matchUser.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.matchContent}>
          <Text style={styles.matchName}>{matchUser.name || matchUser.email}</Text>
          <Text style={styles.matchSubtext}>Tap to start chatting</Text>
        </View>
        <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasChats = chats.length > 0;
  const hasMatches = matches.length > 0;

  const handleSwipeAgain = () => {
    // Navigate to swipe screen to swipe on more attendees
    navigation.navigate('EventAttendees', { event: event });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{event?.title || 'Event Chats'}</Text>
        <TouchableOpacity onPress={handleSwipeAgain} style={styles.swipeButton}>
          <Ionicons name="people" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {!hasChats && !hasMatches ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Chats Yet</Text>
          <Text style={styles.emptyStateText}>
            You haven't started any conversations for this event yet.
          </Text>
          <TouchableOpacity style={styles.swipeAgainButton} onPress={handleSwipeAgain}>
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.swipeAgainButtonText}>Swipe on Attendees</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <TouchableOpacity style={styles.swipeAgainButton} onPress={handleSwipeAgain}>
              <Ionicons name="people" size={20} color="#fff" />
              <Text style={styles.swipeAgainButtonText}>Swipe on More Attendees</Text>
            </TouchableOpacity>
          }
          data={[
            ...(hasChats ? [{ type: 'header', title: 'Active Chats' }] : []),
            ...chats.map(chat => ({ type: 'chat', ...chat })),
            ...(hasMatches ? [{ type: 'header', title: 'Matches' }] : []),
            ...matches.map(match => ({ type: 'match', ...match })),
          ]}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
              );
            }
            if (item.type === 'chat') {
              return renderChatItem({ item });
            }
            if (item.type === 'match') {
              return renderMatchItem({ item });
            }
            return null;
          }}
          keyExtractor={(item, index) => {
            if (item.type === 'header') return `header-${item.title}`;
            if (item.type === 'chat') return `chat-${item.id}`;
            if (item.type === 'match') return `match-${item.userId || index}`;
            return `item-${index}`;
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  swipeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
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
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
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
  matchContent: {
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
  chatNameUnread: {
    fontWeight: '700',
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  matchSubtext: {
    fontSize: 12,
    color: '#666',
  },
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
  },
  chatPreviewUnread: {
    fontWeight: '600',
    color: '#333',
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
    marginBottom: 20,
  },
  swipeAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  swipeAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventChatsScreen;

