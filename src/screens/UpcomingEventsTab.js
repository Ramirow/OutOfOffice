import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AttendeeService from '../services/AttendeeService';
import { useAuth } from '../context/AuthContext';
import EventEnrollmentService from '../services/EventEnrollmentService';

const UpcomingEventsTab = ({ enrolledEvents = [] }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  // Function to parse event date from various formats
  const parseEventDate = (event) => {
    // Try different date formats from event object
    let dateValue = null;
    
    // Check various possible date field locations
    if (event.eventDate) {
      dateValue = event.eventDate;
    } else if (event.date) {
      dateValue = event.date;
    } else if (event.event?.date) {
      dateValue = event.event.date;
    }
    
    if (!dateValue) {
      console.log('No date field found for event:', event.title || event.event?.title || 'Unknown');
      return null;
    }
    
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      const date = dateValue.toDate();
      console.log(`Parsed Firestore Timestamp for "${event.title || event.event?.title}":`, date.toISOString());
      return date;
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      console.log(`Using Date object for "${event.title || event.event?.title}":`, dateValue.toISOString());
      return dateValue;
    }
    
    // Convert to string for parsing
    const dateString = String(dateValue).trim();
    console.log(`Attempting to parse date: "${dateString}" for event: "${event.title || event.event?.title}"`);
    
    // Try parsing common date formats
    // Format 1: "Nov 23, 2025" or "Nov 23, 2024" (with comma and year)
    const fullDateMatch = dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})$/i);
    if (fullDateMatch) {
      const month = fullDateMatch[1];
      const day = parseInt(fullDateMatch[2]);
      const year = parseInt(fullDateMatch[3]);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.indexOf(month.toLowerCase());
      if (monthIndex !== -1) {
        const date = new Date(year, monthIndex, day);
        console.log(`Parsed full date "${dateString}" for "${event.title || event.event?.title}":`, date.toISOString());
        return date;
      }
    }
    
    // Format 2: "23 Nov 2024" or "23 Nov" (without comma)
    const dateWithYearMatch = dateString.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+(\d{4}))?$/i);
    if (dateWithYearMatch) {
      const day = parseInt(dateWithYearMatch[1]);
      const month = dateWithYearMatch[2];
      const year = dateWithYearMatch[4] ? parseInt(dateWithYearMatch[4]) : new Date().getFullYear();
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.indexOf(month.toLowerCase());
      if (monthIndex !== -1) {
        const date = new Date(year, monthIndex, day);
        console.log(`Parsed date with year "${dateString}" for "${event.title || event.event?.title}":`, date.toISOString());
        return date;
      }
    }
    
    // Format 3: "Nov 23" (without year, assume current year)
    const shortDateMatch = dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/i);
    if (shortDateMatch) {
      const currentYear = new Date().getFullYear();
      const month = shortDateMatch[1];
      const day = parseInt(shortDateMatch[2]);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.indexOf(month.toLowerCase());
      if (monthIndex !== -1) {
        const date = new Date(currentYear, monthIndex, day);
        console.log(`Parsed short date "${dateString}" for "${event.title || event.event?.title}":`, date.toISOString());
        return date;
      }
    }
    
    // Format 4: Try native Date parsing (handles ISO, standard formats)
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      console.log(`Parsed via native Date "${dateString}" for "${event.title || event.event?.title}":`, parsed.toISOString());
      return parsed;
    }
    
    console.warn('Failed to parse date:', dateString, 'for event:', event.title || event.event?.title);
    return null;
  };

  // Function to check if event date has passed
  const isEventPassed = (event) => {
    const eventDate = parseEventDate(event);
    if (!eventDate) return false;
    
    const now = new Date();
    // Set time to start of day for fair comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    // Event has passed if event date is before today
    return eventDay < today;
  };

  // Function to update event status based on date
  const updateEventStatus = async (event) => {
    // Check if event date has passed FIRST (before checking current status)
    const eventDate = parseEventDate(event);
    const hasPassed = eventDate && isEventPassed(event);
    
    console.log(`Updating status for "${event.title || event.event?.title}":`, {
      eventDate: eventDate?.toISOString(),
      hasPassed,
      currentStatus: event.status
    });
    
    // If event date has passed, always set status to 'attended'
    if (hasPassed) {
      // Skip if already marked as attended (optimization)
      if (event.status === 'attended') {
        console.log(`Event "${event.title || event.event?.title}" already marked as attended`);
        return event;
      }

      console.log(`Event "${event.title || event.event?.title}" date has passed. Updating to 'attended'...`);

      // Update status to attended in Firestore if enrolled
      if (user?.id) {
        try {
          const eventId = event.eventId?.toString() || 
                         event.id?.toString() ||
                         event.event?.id?.toString();
          
          if (eventId) {
            console.log(`Updating Firestore status for eventId: ${eventId}, userId: ${user.id}`);
            // Update status in Firestore
            await EventEnrollmentService.updateEventStatus(user.id, eventId, 'attended');
            
            // Initialize attendees when event becomes attended (use real users)
            const attendees = await AttendeeService.initializeEventAttendees(
              eventId, 
              event.title || event.event?.title || 'Event',
              user.id, // Exclude current user
              false // Don't use mock data
            );
            
            console.log(`Event "${event.title || event.event?.title}" updated to 'attended' with ${attendees.length} attendees`);
            
            return { 
              ...event, 
              status: 'attended',
              attendees: attendees.length,
              eventId: eventId,
            };
          } else {
            console.warn('No eventId found for event:', event.title || event.event?.title);
          }
        } catch (error) {
          console.error('Error updating event status:', error);
        }
      }
      
      // If not enrolled or update failed, still mark as attended locally
      const eventId = event.eventId?.toString() || 
                     event.id?.toString() ||
                     event.event?.id?.toString() ||
                     `event_${Date.now()}`;
      
      const attendees = await AttendeeService.initializeEventAttendees(
        eventId, 
        event.title || event.event?.title || 'Event',
        user?.id || null,
        false
      );
      
      return { 
        ...event, 
        status: 'attended',
        attendees: attendees.length,
        eventId: eventId,
      };
    }
    
    // Event date is in the future - set status to 'confirmed'
    // If status is already 'confirmed', keep it
    if (event.status === 'confirmed') {
      return event;
    }
    
    // If status is not set or is 'pending', set to 'confirmed'
    return {
      ...event,
      status: 'confirmed'
    };
  };

  // Effect to update events and their statuses
  useEffect(() => {
    const loadEvents = async () => {
      // Only show enrolled events (no mock/default events)
      if (enrolledEvents.length === 0) {
        setEvents([]);
        return;
      }

      // Update enrolled events only
      const updatedEnrolledEvents = await Promise.all(
        enrolledEvents.map(async (event) => {
          // Extract event ID - eventId is now included from getUserEnrolledEvents
          const eventId = event.eventId?.toString() || 
                         event.id?.toString() || 
                         event.event?.id?.toString() ||
                         `enrolled_${Date.now()}`;
          
          console.log(`Processing event "${event.title || event.event?.title}":`, {
            enrollmentId: event.id,
            eventId: eventId,
            date: event.date || event.event?.date,
            status: event.status
          });
          
          // Update status based on date
          const updated = await updateEventStatus(event);
          
          // Get attendee count if event is attended
          if (updated.status === 'attended' && eventId) {
            const count = await AttendeeService.getAttendeeCount(eventId);
            return { 
              ...updated, 
              attendees: count || updated.attendees || 0, 
              eventId: eventId 
            };
          }
          
          return { ...updated, eventId: eventId };
        })
      );

      setEvents(updatedEnrolledEvents);
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
  }, [enrolledEvents, user?.id]);

  // Handle event press - check swipe status and navigate accordingly
  const handleEventPress = async (event) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to view attendees.');
      return;
    }

    // Check if event date has passed (even if status hasn't updated yet)
    const eventDate = parseEventDate(event);
    const hasPassed = eventDate && isEventPassed(event);
    
    console.log(`Event press for "${event.title || event.event?.title}":`, {
      hasPassed,
      currentStatus: event.status,
      eventDate: eventDate?.toISOString()
    });
    
    // If event date has passed, treat it as attended regardless of stored status
    if (hasPassed) {
      // Ensure status is updated if date has passed
      let updatedEvent = event;
      if (event.status !== 'attended') {
        console.log('Updating event status to attended on press...');
        updatedEvent = await updateEventStatus(event);
        // Update local state immediately
        setEvents(prev => prev.map(e => {
          const eId = e.eventId?.toString() || e.id?.toString() || e.event?.id?.toString();
          const uId = updatedEvent.eventId?.toString() || updatedEvent.id?.toString() || updatedEvent.event?.id?.toString();
          return eId === uId ? updatedEvent : e;
        }));
      }
      
      const eventId = updatedEvent.eventId || 
                     updatedEvent.id?.toString() ||
                     updatedEvent.event?.id?.toString() ||
                     `event_${Date.now()}`;
      
      if (!eventId || eventId === `event_${Date.now()}`) {
        console.error('Could not determine eventId for navigation');
        Alert.alert('Error', 'Could not determine event ID. Please try again.');
        return;
      }
      
      console.log('Navigating to swipe screen for eventId:', eventId);
      
      // Check if user has completed swiping
      const hasCompletedSwiping = await AttendeeService.hasCompletedSwiping(eventId, user.id);
      
      if (hasCompletedSwiping) {
        // User has completed swiping, check for matches
        const matches = await AttendeeService.getUserMatches(eventId, user.id);
        
        if (matches && matches.length > 0) {
          // Has matches, navigate to chat
          navigation.navigate('Chat', { event: updatedEvent, matches });
        } else {
          // No matches yet, show popup
          Alert.alert(
            'No Matches Yet',
            'You haven\'t matched with anyone from this event yet. Keep swiping on other events to find connections!',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } else {
        // User hasn't completed swiping, navigate to swipe screen
        navigation.navigate('EventAttendees', { event: updatedEvent });
      }
    } else {
      // Future event - show info message
      Alert.alert(
        'Event Not Started',
        'This event hasn\'t started yet. You can swipe and connect with attendees after the event date.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.upcomingEventCard,
        (item.status === 'attended' || isEventPassed(item)) && styles.attendedEventCard
      ]}
      onPress={() => handleEventPress(item)}
      disabled={false} // Allow all events to be clickable (handleEventPress will check status)
    >
      <Image source={{ uri: item.image }} style={styles.upcomingEventImage} />
      <View style={styles.upcomingEventDetails}>
        <View style={styles.eventHeader}>
          <Text style={styles.upcomingEventTitle}>{item.title || item.event?.title}</Text>
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledBadgeText}>ENROLLED</Text>
          </View>
        </View>
        
        <View style={styles.upcomingEventRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.upcomingEventText}>{item.location || item.event?.location}</Text>
        </View>
        {(item.date || item.event?.date) && (
          <View style={styles.upcomingEventRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.upcomingEventText}>{item.date || item.event?.date}</Text>
          </View>
        )}
        {(item.time || item.event?.time) && (
          <View style={styles.upcomingEventRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.upcomingEventText}>{item.time || item.event?.time}</Text>
          </View>
        )}
        
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
            backgroundColor: (item.status === 'attended' || isEventPassed(item)) ? '#2196F3' :
                           item.status === 'confirmed' ? '#4CAF50' : '#FF9800' 
          }
        ]}>
          <Text style={styles.statusText}>
            {(item.status === 'attended' || isEventPassed(item)) ? 'ATTENDED' : 
             item.status ? item.status.toUpperCase() : 'CONFIRMED'}
          </Text>
        </View>

        {(item.status === 'attended' || isEventPassed(item)) && (
          <View style={styles.attendeesInfo}>
            <Ionicons name="people" size={16} color="#2196F3" />
            <Text style={styles.attendeesText}>
              {item.attendees || 0} attendees • Tap to swipe & connect
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
          keyExtractor={(item, index) => {
            // Create unique key using event ID and index
            const itemId = item.id?.toString() || 
                          item.eventId?.toString() || 
                          item.event?.id?.toString() || 
                          `event_${index}`;
            return `enrolled_${itemId}_${index}`;
          }}
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