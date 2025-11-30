import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AttendeeService from '../services/AttendeeService';
import ChatService from '../services/ChatService';

const ChatScreen = ({ route, navigation }) => {
  const { event, matches, chatId: initialChatId, otherUser: initialOtherUser } = route.params || {};
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState(
    initialOtherUser || (matches && matches.length > 0 ? matches[0] : null)
  );
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const flatListRef = useRef(null);

  // Load or create chat and load messages
  useEffect(() => {
    const loadChat = async () => {
      if (!selectedMatch || !user?.id || !event) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventId = event.id?.toString() || event.eventId?.toString() || event.id;
        
        // Get or create chat
        // Use userId if available (for real users), otherwise fall back to id
        const otherUserId = selectedMatch.userId || selectedMatch.id;
        const chatId = await ChatService.getOrCreateChat(
          user.id,
          otherUserId,
          eventId,
          event
        );
        setCurrentChatId(chatId);

        // Load messages
        const chatMessages = await ChatService.getChatMessages(chatId);
        setMessages(chatMessages);

        // Mark messages as read
        await ChatService.markMessagesAsRead(chatId, user.id);
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [selectedMatch, event, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedMatch || !currentChatId || !user?.id || sending) {
      return;
    }

    try {
      setSending(true);
      const text = messageText.trim();
      setMessageText(''); // Clear input immediately for better UX

      // Send message to Firestore
      const newMessage = await ChatService.sendMessage(
        currentChatId,
        user.id,
        text
      );

      // Add to local state
      setMessages(prev => [...prev, newMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      console.log('Message sent successfully. Chat ID:', currentChatId, 'Message:', text);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === (user?.id || 'current');
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.messageRight : styles.messageLeft
      ]}>
        {!isCurrentUser && (
          <Image
            source={{ uri: selectedMatch?.image }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.messageTextRight : styles.messageTextLeft
          ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  if (!selectedMatch || !matches || matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Matches Yet</Text>
          <Text style={styles.emptyStateText}>
            Keep swiping to find connections!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: selectedMatch.image }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{selectedMatch.name}</Text>
            <Text style={styles.headerSubtitle}>Matched at {event.title}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="attach" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={messageText.trim() ? "#fff" : "#ccc"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#333',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
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
});

export default ChatScreen;

