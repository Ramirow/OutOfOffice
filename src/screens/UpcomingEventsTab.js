import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AttendeeService from '../services/AttendeeService';

// Default upcoming events data with actual dates
const defaultUpcomingEvents = [
  {
    id: 1,
    title: 'Team Building Workshop',
    location: 'Conference Room A',
    time: 'Today, 3:00 PM',
    eventDate: new Date(), // Today's date
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
    status: 'confirmed',
    isDefault: true,
    attendees: 25
  },
  {
    id: 2,
    title: 'Coffee Chat with Design Team',
    location: 'Office Lounge',
    time: 'Tomorrow, 10:00 AM',
    eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop',
    status: 'pending',
    isDefault: true,
    attendees: 12
  }
];

const UpcomingEventsTab = ({ enrolledEvents = [] }) => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

  // Function to check if event date has passed
  const isEventPassed = (eventDate) => {
    if (!eventDate) return false;
    const now = new Date();
    const event = new Date(eventDate);
    return event < now;
  };

  // Function to update event status based on date
  const updateEventStatus = async (event) => {
    if (event.status === 'confirmed' && isEventPassed(event.eventDate || event.date)) {
      // Initialize attendees when event becomes attended
      const eventId = event.id?.toString() || `event_${Date.now()}`;
      const attendees = await AttendeeService.initializeEventAttendees(
        eventId, 
        event.title || 'Event'
      );
      
      return { 
        ...event, 
        status: 'attended',
        attendees: attendees.length,
        eventId: eventId,
      };
    }
    return event;
  };

  // Effect to update events and their statuses
  useEffect(() => {
    const loadEvents = async () => {
      // Update default events
      const updatedDefaultEvents = await Promise.all(
        defaultUpcomingEvents.map(async (event) => {
          const eventId = event.id?.toString() || `default_${event.id}`;
          const updated = await updateEventStatus(event);
          // Get attendee count if event is attended
          if (updated.status === 'attended') {
            const count = await AttendeeService.getAttendeeCount(eventId);
            return { ...updated, attendees: count || updated.attendees || 20, eventId };
          }
          return { ...updated, eventId };
        })
      );

      // Update enrolled events
      const updatedEnrolledEvents = await Promise.all(
        enrolledEvents.map(async (event) => {
          const eventId = event.id?.toString() || `enrolled_${event.id}`;
          const updated = await updateEventStatus(event);
          // Get attendee count if event is attended
          if (updated.status === 'attended') {
            const count = await AttendeeService.getAttendeeCount(eventId);
            return { ...updated, attendees: count || updated.attendees || 20, eventId };
          }
          return { ...updated, eventId };
        })
      );

      const allUpcomingEvents = [...updatedDefaultEvents, ...updatedEnrolledEvents];
      setEvents(allUpcomingEvents);
    };

    loadEvents();

    // Set up interval to check for status updates every minute
    const interval = setInterval(async () => {
      // Get current events from state using a function
      setEvents(prevEvents => {
        // Update asynchronously
        (async () => {
          const updatedEvents = await Promise.all(
            prevEvents.map(async (event) => {
              const updated = await updateEventStatus(event);
              if (updated.status === 'attended' && updated.eventId) {
                const count = await AttendeeService.getAttendeeCount(updated.eventId);
                return { ...updated, attendees: count || updated.attendees || 20 };
              }
              return updated;
            })
          );
          setEvents(updatedEvents);
        })();
        return prevEvents; // Return current state while async operation completes
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [enrolledEvents]);

  // Handle event press - navigate to attendees if attended
  const handleEventPress = (event) => {
    if (event.status === 'attended') {
      navigation.navigate('EventAttendees', { event });
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.upcomingEventCard,
        item.status === 'attended' && styles.attendedEventCard
      ]}
      onPress={() => handleEventPress(item)}
      disabled={item.status !== 'attended'}
    >
      <Image source={{ uri: item.image }} style={styles.upcomingEventImage} />
      <View style={styles.upcomingEventDetails}>
        <View style={styles.eventHeader}>
          <Text style={styles.upcomingEventTitle}>{item.title}</Text>
          {!item.isDefault && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledBadgeText}>ENROLLED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.upcomingEventRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.upcomingEventText}>{item.location}</Text>
        </View>
        <View style={styles.upcomingEventRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.upcomingEventText}>{item.time}</Text>
        </View>
        
        {item.category && (
          <View style={styles.upcomingEventRow}>
            <Ionicons name="pricetag" size={16} color="#666" />
            <Text style={styles.upcomingEventText}>{item.category}</Text>
          </View>
        )}
        
        {item.price && (
          <View style={styles.upcomingEventRow}>
            <Ionicons name="card" size={16} color="#666" />
            <Text style={styles.upcomingEventText}>{item.price}</Text>
          </View>
        )}
        
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: item.status === 'confirmed' ? '#4CAF50' : 
                           item.status === 'attended' ? '#2196F3' : '#FF9800' 
          }
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        {item.status === 'attended' && (
          <View style={styles.attendeesInfo}>
            <Ionicons name="people" size={16} color="#2196F3" />
            <Text style={styles.attendeesText}>
              {item.attendees || 20} attendees • Tap to swipe & connect
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Your Upcoming Events</Text>
      {enrolledEvents.length > 0 && (
        <Text style={styles.enrolledCount}>
          {enrolledEvents.length} event{enrolledEvents.length !== 1 ? 's' : ''} enrolled
        </Text>
      )}
      
      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
          <Text style={styles.emptyStateText}>Start exploring to find events to join!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => `${item.id}-${item.isDefault ? 'default' : 'enrolled'}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.upcomingEventsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
  },
  enrolledCount: {
    fontSize: 16,
    color: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  upcomingEventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  upcomingEventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  attendedEventCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#F3F9FF',
  },
  upcomingEventImage: {
    width: 80,
    height: 100,
  },
  upcomingEventDetails: {
    flex: 1,
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  upcomingEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  enrolledBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  upcomingEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  upcomingEventText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attendeesText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 6,
    fontWeight: '600',
  },
});

export default UpcomingEventsTab; 