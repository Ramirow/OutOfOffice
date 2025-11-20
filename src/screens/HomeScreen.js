import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import EventEnrollmentService from '../services/EventEnrollmentService';
import CustomEventService from '../services/CustomEventService';
import HomeTab from './HomeTab';
import UpcomingEventsTab from './UpcomingEventsTab';
import AvailableEventsTab from './AvailableEventsTab';
import AboutUsTab from './AboutUsTab';
import ProfileScreen from './ProfileScreen';

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingCustomEvents, setLoadingCustomEvents] = useState(true);
  const { logout, user, isAdmin, isPremium, canAddEvents } = useAuth();

  // Load enrolled events and custom events from Firestore when user logs in
  useEffect(() => {
    if (user?.id) {
      loadEnrolledEvents();
      loadCustomEvents();
    }
  }, [user?.id]);

  // Load enrolled events from Firestore
  const loadEnrolledEvents = async () => {
    try {
      setLoadingEnrollments(true);
      const events = await EventEnrollmentService.getUserEnrolledEvents(user.id);
      setEnrolledEvents(events);
      console.log('Loaded enrolled events from Firestore:', events.length);
    } catch (error) {
      console.error('Error loading enrolled events:', error);
      // Graceful degradation - continue with empty array
      setEnrolledEvents([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Load custom events from Firestore
  const loadCustomEvents = async () => {
    try {
      setLoadingCustomEvents(true);
      const events = await CustomEventService.getAllCustomEvents();
      setCustomEvents(events);
      console.log('Loaded custom events from Firestore:', events.length);
    } catch (error) {
      console.error('Error loading custom events:', error);
      // Graceful degradation - continue with empty array
      setCustomEvents([]);
    } finally {
      setLoadingCustomEvents(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear enrolled events and custom events on logout
      setEnrolledEvents([]);
      setCustomEvents([]);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleEnrollEvent = async (event) => {
    try {
      // Save to Firestore (cloud database)
      const enrolledEvent = await EventEnrollmentService.enrollUserInEvent(
        user.id,
        event
      );

      // Update local state
      setEnrolledEvents(prev => [...prev, enrolledEvent]);
      
      Alert.alert(
        'Enrolled Successfully!', 
        `You've been enrolled in "${event.title}". This will be saved permanently.`
      );
    } catch (error) {
      console.error('Error enrolling in event:', error);
      Alert.alert('Error', 'Failed to enroll in event. Please try again.');
    }
  };

  const handleAddCustomEvent = async (newEvent) => {
    try {
      // Save to Firestore (cloud database)
      const savedEvent = await CustomEventService.createCustomEvent(newEvent, user.id);
      
      // Update local state
      setCustomEvents(prev => [...prev, savedEvent]);
      
      Alert.alert(
        'Success!', 
        `Event "${newEvent.title}" has been created and saved to the cloud!`
      );
    } catch (error) {
      console.error('Error creating custom event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const getRoleDisplay = () => {
    if (isAdmin()) return 'Admin';
    if (isPremium()) return 'Premium';
    return null;
  };

  const getRoleColor = () => {
    if (isAdmin()) return '#FF5722';
    if (isPremium()) return '#FF9800';
    return '#007AFF';
  };

  const renderProfileIcon = () => {
    return (
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => setShowProfile(true)}
      >
        {user?.image ? (
          <Image source={{ uri: user.image }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onTabChange={handleTabChange} />;
      case 'explore':
        return (
          <AvailableEventsTab 
            onEnrollEvent={handleEnrollEvent}
            customEvents={customEvents}
            onAddCustomEvent={handleAddCustomEvent}
          />
        );
      case 'upcoming':
        return <UpcomingEventsTab enrolledEvents={enrolledEvents} />;
      case 'about':
        return <AboutUsTab />;
      default:
        return <HomeTab onTabChange={handleTabChange} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>OutOfOffice</Text>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitle}>Discover Events</Text>
            {getRoleDisplay() && (
              <View style={[styles.roleIndicator, { backgroundColor: getRoleColor() }]}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.roleIndicatorText}>{getRoleDisplay()}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {renderProfileIcon()}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons 
            name="home" 
            size={18} 
            color={activeTab === 'home' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
            HOME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'explore' && styles.activeTab]}
          onPress={() => setActiveTab('explore')}
        >
          <Ionicons 
            name="search" 
            size={18} 
            color={activeTab === 'explore' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>
            EXPLORE
          </Text>
          {customEvents.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{customEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Ionicons 
            name="calendar" 
            size={18} 
            color={activeTab === 'upcoming' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            UPCOMING
          </Text>
          {enrolledEvents.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{enrolledEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Ionicons 
            name="information-circle" 
            size={18} 
            color={activeTab === 'about' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            ABOUT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Profile Modal */}
      <ProfileScreen 
        visible={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileButton: {
    padding: 2,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 