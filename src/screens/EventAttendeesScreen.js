import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import AttendeeService from '../services/AttendeeService';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const EventAttendeesScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { user } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipedAttendees, setSwipedAttendees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

  // Load attendees when component mounts
  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      const eventId = event.eventId || event.id?.toString() || `event_${event.id}`;
      
      // Get real enrolled users as attendees (exclude current user)
      const storedAttendees = await AttendeeService.initializeEventAttendees(
        eventId,
        event.title || 'Event',
        user?.id || null, // Pass current user ID to exclude them
        false // Don't use mock data
      );
      
      setAttendees(storedAttendees);
      
      if (storedAttendees.length === 0) {
        Alert.alert(
          'No Attendees',
          'There are no other attendees for this event yet. Check back later!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
      Alert.alert('Error', 'Failed to load attendees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (cardIndex) => {
    const attendee = attendees[cardIndex];
    if (!attendee || !user) return;
    
    const eventId = event.eventId || event.id?.toString() || `event_${event.id}`;
    
    // Store the swipe action
    await AttendeeService.updateAttendeeAction(eventId, attendee.id, 'passed');
    
    // Track user's swipe
    await AttendeeService.trackUserSwipe(eventId, user.id, attendee.id, 'passed');
    
    setSwipedAttendees(prev => [...prev, { ...attendee, action: 'passed' }]);
    console.log(`Passed on ${attendee.name}`);
  };

  const handleSwipeRight = async (cardIndex) => {
    const attendee = attendees[cardIndex];
    if (!attendee || !user) return;
    
    const eventId = event.eventId || event.id?.toString() || `event_${event.id}`;
    
    // Store the swipe action
    await AttendeeService.updateAttendeeAction(eventId, attendee.id, 'liked');
    
    // Track user's swipe
    await AttendeeService.trackUserSwipe(eventId, user.id, attendee.id, 'liked');
    
    setSwipedAttendees(prev => [...prev, { ...attendee, action: 'liked' }]);
    Alert.alert(
      'Connection Request Sent!',
      `You've shown interest in connecting with ${attendee.name}. If they're interested too, you'll be matched!`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleSwipeAll = () => {
    Alert.alert(
      'All Done!',
      'You\'ve viewed all attendees from this event. Check your connections to see any matches!',
      [
        { text: 'View Connections', onPress: () => navigation.goBack() },
        { text: 'Stay Here', style: 'cancel' }
      ]
    );
  };

  const renderCard = (attendee, index) => {
    if (!attendee) return null;

    return (
      <View style={styles.card}>
        <Image source={{ uri: attendee.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{attendee.name}, {attendee.age}</Text>
            {attendee.mutualConnections > 0 && (
              <View style={styles.mutualBadge}>
                <Ionicons name="people" size={12} color="#007AFF" />
                <Text style={styles.mutualText}>{attendee.mutualConnections}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.job}>{attendee.job}</Text>
          <Text style={styles.company}>{attendee.company}</Text>
          
          <Text style={styles.bio}>{attendee.bio}</Text>
          
          <View style={styles.interestsContainer}>
            {attendee.interests.map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
      <Text style={styles.noMoreCardsText}>All Done!</Text>
      <Text style={styles.noMoreCardsSubtext}>
        You've viewed all attendees from {event.title}
      </Text>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Events</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Event Attendees</Text>
            <Text style={styles.headerSubtitle}>{event.title}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (attendees.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Event Attendees</Text>
            <Text style={styles.headerSubtitle}>{event.title}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.noMoreCards}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.noMoreCardsText}>No Attendees Yet</Text>
          <Text style={styles.noMoreCardsSubtext}>
            Attendees will appear here after the event
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Events</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Event Attendees</Text>
          <Text style={styles.headerSubtitle}>{event.title}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex) / attendees.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex} of {attendees.length} viewed
        </Text>
      </View>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={attendees}
          renderCard={renderCard}
          renderNoMoreCards={renderNoMoreCards}
          onSwipedLeft={handleSwipeLeft}
          onSwipedRight={handleSwipeRight}
          onSwipedAll={handleSwipeAll}
          onSwiped={(cardIndex) => setCurrentIndex(cardIndex + 1)}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={2}
          stackScale={5}
          stackSeparation={-10}
          cardVerticalMargin={20}
          cardHorizontalMargin={20}
          animateCardOpacity
          swipeBackCard
        />
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={32} color="#FF4458" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={32} color="#66D7A2" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe right to connect • Swipe left to pass
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  swiperContainer: {
    flex: 1,
    paddingTop: 20,
  },
  card: {
    height: height * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '60%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mutualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mutualText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  job: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#66D7A2',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noMoreCardsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default EventAttendeesScreen;