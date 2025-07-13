import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Default upcoming events data
const defaultUpcomingEvents = [
  {
    id: 1,
    title: 'Team Building Workshop',
    location: 'Conference Room A',
    time: 'Today, 3:00 PM',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
    status: 'confirmed',
    isDefault: true
  },
  {
    id: 2,
    title: 'Coffee Chat with Design Team',
    location: 'Office Lounge',
    time: 'Tomorrow, 10:00 AM',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop',
    status: 'pending',
    isDefault: true
  }
];

const UpcomingEventsTab = ({ enrolledEvents = [] }) => {
  // Combine default events with enrolled events
  const allUpcomingEvents = [...defaultUpcomingEvents, ...enrolledEvents];

  const renderEventItem = ({ item }) => (
    <View style={styles.upcomingEventCard}>
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
        
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Your Upcoming Events</Text>
      {enrolledEvents.length > 0 && (
        <Text style={styles.enrolledCount}>
          {enrolledEvents.length} event{enrolledEvents.length !== 1 ? 's' : ''} enrolled
        </Text>
      )}
      
      {allUpcomingEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
          <Text style={styles.emptyStateText}>Start exploring to find events to join!</Text>
        </View>
      ) : (
        <FlatList
          data={allUpcomingEvents}
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
});

export default UpcomingEventsTab; 