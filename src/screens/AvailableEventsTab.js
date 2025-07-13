import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import AddEventModal from '../components/AddEventModal';

// Available events data that users can enroll in
const availableEvents = [
  {
    id: 1,
    title: 'Tech Meetup: AI & Machine Learning',
    location: 'San Francisco, CA',
    time: 'Tomorrow, 7:00 PM',
    date: 'Dec 15, 2024',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
    attendees: 45,
    category: 'Technology',
    description: 'Join us for an exciting discussion about AI and ML trends',
    price: 'Free'
  },
  {
    id: 2,
    title: 'Hiking Adventure: Mount Tamalpais',
    location: 'Mill Valley, CA',
    time: 'Saturday, 9:00 AM',
    date: 'Dec 16, 2024',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    attendees: 23,
    category: 'Outdoor',
    description: 'Explore beautiful trails and enjoy nature',
    price: '$25'
  },
  {
    id: 3,
    title: 'Wine Tasting & Networking',
    location: 'Napa Valley, CA',
    time: 'Sunday, 2:00 PM',
    date: 'Dec 17, 2024',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    attendees: 67,
    category: 'Social',
    description: 'Network with professionals while enjoying fine wines',
    price: '$45'
  },
  {
    id: 4,
    title: 'Photography Workshop',
    location: 'Golden Gate Park, SF',
    time: 'Next Week, 10:00 AM',
    date: 'Dec 18, 2024',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    attendees: 18,
    category: 'Creative',
    description: 'Learn photography techniques from professionals',
    price: '$35'
  },
  {
    id: 5,
    title: 'Board Game Night',
    location: 'Downtown Oakland, CA',
    time: 'Friday, 6:30 PM',
    date: 'Dec 19, 2024',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop',
    attendees: 34,
    category: 'Social',
    description: 'Fun evening with board games and new friends',
    price: '$15'
  },
  {
    id: 6,
    title: 'Startup Pitch Night',
    location: 'Tech Hub, San Francisco',
    time: 'Wednesday, 6:00 PM',
    date: 'Dec 20, 2024',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
    attendees: 89,
    category: 'Business',
    description: 'Watch innovative startups pitch their ideas',
    price: 'Free'
  }
];

const AvailableEventsTab = ({ onEnrollEvent, customEvents = [], onAddCustomEvent }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { user, canAddEvents, isAdmin, isPremium } = useAuth();

  // Combine default events with custom events
  const allEvents = [...availableEvents, ...customEvents];

  const handleEnrollPress = (event) => {
    Alert.alert(
      'Enroll in Event',
      `Would you like to enroll in "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enroll', 
          onPress: () => {
            onEnrollEvent(event);
            Alert.alert('Success', `You have successfully enrolled in "${event.title}"!`);
          }
        }
      ]
    );
  };

  const handleAddEvent = (newEvent) => {
    onAddCustomEvent(newEvent);
  };

  const getRoleDisplay = () => {
    if (isAdmin()) return 'Admin';
    if (isPremium()) return 'Premium';
    return 'Regular';
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.eventHeaderRight}>
            <Text style={styles.priceText}>{item.price}</Text>
            {item.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.detailText}>{item.attendees} attending</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.enrollButton}
          onPress={() => handleEnrollPress(item)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.enrollButtonText}>Enroll Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tabTitle}>Available Events</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.tabSubtitle}>Discover and enroll in exciting events</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{getRoleDisplay()}</Text>
            </View>
          </View>
        </View>
        
        {canAddEvents() && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={allEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />

      <AddEventModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddEvent={handleAddEvent}
      />
    </View>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Technology: '#007AFF',
    Outdoor: '#4CAF50',
    Social: '#FF9800',
    Creative: '#9C27B0',
    Business: '#FF5722',
    Sports: '#2196F3',
    Education: '#795548',
    Health: '#E91E63',
  };
  return colors[category] || '#666';
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
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
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  enrollButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AvailableEventsTab; 