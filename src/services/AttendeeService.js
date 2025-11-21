// AttendeeService.js - Service for managing event attendees
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import EventEnrollmentService from './EventEnrollmentService';
import UserService from './UserService';

const ATTENDEES_COLLECTION = 'eventAttendees';

// Generate mock attendees for an event
const generateMockAttendees = (eventTitle, eventId) => [
  {
    id: `${eventId}_1`,
    name: 'Sarah Johnson',
    job: 'UX Designer',
    company: 'Tech Innovations',
    age: 28,
    bio: 'Passionate about creating user-centered designs. Love hiking and photography in my free time.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
    interests: ['Design', 'Photography', 'Hiking'],
    mutualConnections: 3,
    eventId: eventId,
  },
  {
    id: `${eventId}_2`,
    name: 'Michael Chen',
    job: 'Software Engineer',
    company: 'StartupCorp',
    age: 32,
    bio: 'Full-stack developer who enjoys building scalable applications. Coffee enthusiast and weekend rock climber.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    interests: ['Coding', 'Coffee', 'Rock Climbing'],
    mutualConnections: 5,
    eventId: eventId,
  },
  {
    id: `${eventId}_3`,
    name: 'Emily Davis',
    job: 'Product Manager',
    company: 'Digital Solutions',
    age: 29,
    bio: 'Strategic thinker with a passion for innovative products. Love traveling and trying new cuisines.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    interests: ['Product Strategy', 'Travel', 'Cooking'],
    mutualConnections: 2,
    eventId: eventId,
  },
  {
    id: `${eventId}_4`,
    name: 'David Rodriguez',
    job: 'Data Scientist',
    company: 'Analytics Pro',
    age: 35,
    bio: 'Turning data into insights. Enjoy playing chess and reading sci-fi novels in my spare time.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
    interests: ['Data Analysis', 'Chess', 'Sci-Fi'],
    mutualConnections: 1,
    eventId: eventId,
  },
  {
    id: `${eventId}_5`,
    name: 'Lisa Thompson',
    job: 'Marketing Director',
    company: 'Brand Masters',
    age: 31,
    bio: 'Creative marketer who loves building brand stories. Yoga instructor and plant parent.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    interests: ['Marketing', 'Yoga', 'Plants'],
    mutualConnections: 4,
    eventId: eventId,
  },
  {
    id: `${eventId}_6`,
    name: 'James Wilson',
    job: 'Frontend Developer',
    company: 'Web Studio',
    age: 27,
    bio: 'Building beautiful user interfaces. Love playing guitar and exploring new coffee shops.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    interests: ['React', 'Guitar', 'Coffee'],
    mutualConnections: 2,
    eventId: eventId,
  },
  {
    id: `${eventId}_7`,
    name: 'Maria Garcia',
    job: 'Business Analyst',
    company: 'Consulting Group',
    age: 30,
    bio: 'Analyzing business processes and finding solutions. Passionate about fitness and reading.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    interests: ['Business Analysis', 'Fitness', 'Reading'],
    mutualConnections: 3,
    eventId: eventId,
  },
];

class AttendeeService {
  // Get attendees for a specific event from Firestore
  static async getEventAttendees(eventId) {
    try {
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        const data = eventSnap.data();
        return data.attendees || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting event attendees:', error);
      return [];
    }
  }

  // Store attendees for an event in Firestore
  static async storeEventAttendees(eventId, attendees, eventTitle = 'Event') {
    try {
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      const eventData = {
        eventId: eventId,
        eventTitle: eventTitle,
        attendees: attendees,
        updatedAt: Timestamp.now(),
      };
      
      // Check if document exists to preserve createdAt
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) {
        eventData.createdAt = Timestamp.now();
      }
      
      await setDoc(eventRef, eventData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error storing attendees:', error);
      return false;
    }
  }

  // Convert enrolled users to attendee format
  static convertUserToAttendee(user, eventId) {
    return {
      id: `${eventId}_${user.id}`,
      userId: user.id, // Store the actual user ID
      name: user.name || 'Anonymous',
      job: user.career || 'Not specified',
      company: user.study || 'Not specified',
      age: user.age || 25,
      bio: user.bio || `${user.name} attended this event.`,
      image: user.image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
      interests: user.hobby ? user.hobby.split(',').map(h => h.trim()) : ['Networking', 'Events'],
      mutualConnections: Math.floor(Math.random() * 5), // Random for demo
      eventId: eventId,
      email: user.email,
    };
  }

  // Get real enrolled users as attendees for an event
  static async getRealAttendees(eventId, currentUserId = null) {
    try {
      // Get all enrollments for this event
      const enrollments = await EventEnrollmentService.getEventEnrollments(eventId);
      
      if (enrollments.length === 0) {
        return [];
      }

      // Fetch user profiles for each enrolled user
      const attendeePromises = enrollments
        .filter(enrollment => enrollment.userId !== currentUserId) // Exclude current user
        .map(async (enrollment) => {
          const user = await UserService.getUserById(enrollment.userId);
          if (user) {
            return this.convertUserToAttendee(user, eventId);
          }
          return null;
        });

      const attendees = await Promise.all(attendeePromises);
      
      // Filter out null values (users that couldn't be fetched)
      return attendees.filter(attendee => attendee !== null);
    } catch (error) {
      console.error('Error getting real attendees:', error);
      return [];
    }
  }

  // Initialize attendees for an event (use real enrolled users)
  static async initializeEventAttendees(eventId, eventTitle, currentUserId = null, useMock = false) {
    try {
      // Always try to get real enrolled users first
      const realAttendees = await this.getRealAttendees(eventId, currentUserId);
      
      // Check if attendees already exist in database
      const existingAttendees = await this.getEventAttendees(eventId);
      
      // If we have real enrolled users, use them (replace any mock data)
      if (realAttendees.length > 0) {
        // Always store real attendees, replacing any existing (mock or stale)
        await this.storeEventAttendees(eventId, realAttendees, eventTitle);
        console.log(`✅ Stored ${realAttendees.length} real attendees for event ${eventId}`);
        return realAttendees;
      }
      
      // No real enrolled users yet
      // Check if existing attendees are mock attendees
      if (existingAttendees.length > 0 && !useMock) {
        // Check if they're real users or mock
        // Real users have userId field, mock attendees don't
        const areRealUsers = existingAttendees.some(a => a.userId);
        
        if (!areRealUsers) {
          // They're mock attendees, clear them since no real users enrolled yet
          console.log(`🗑️ Clearing mock attendees for event ${eventId} (no enrolled users yet)`);
          await this.clearAllAttendees(eventId);
          return [];
        }
        
        // They're real users but no longer enrolled? Keep them for now
        // This handles edge case where users might have been unenrolled
        return existingAttendees;
      }
      
      // No existing attendees and no real enrolled users
      // Only use mock data if explicitly requested
      if (useMock) {
        console.log(`⚠️ Using mock attendees for event ${eventId} (useMock=true)`);
        const mockAttendees = generateMockAttendees(eventTitle, eventId);
        await this.storeEventAttendees(eventId, mockAttendees, eventTitle);
        return mockAttendees;
      }

      // Return empty array - no attendees yet (no mock data)
      console.log(`ℹ️ No attendees for event ${eventId} (no enrolled users yet)`);
      return [];
    } catch (error) {
      console.error('Error initializing attendees:', error);
      
      // Only fallback to mock data if explicitly requested
      if (useMock) {
        return generateMockAttendees(eventTitle, eventId);
      }
      
      return [];
    }
  }

  // Add a new attendee to an event
  static async addAttendee(eventId, attendee) {
    try {
      const attendees = await this.getEventAttendees(eventId);
      const newAttendee = {
        ...attendee,
        id: `${eventId}_${Date.now()}`,
        eventId: eventId,
      };
      attendees.push(newAttendee);
      await this.storeEventAttendees(eventId, attendees);
      return newAttendee;
    } catch (error) {
      console.error('Error adding attendee:', error);
      return null;
    }
  }

  // Update attendee swipe action (liked/passed)
  static async updateAttendeeAction(eventId, attendeeId, action, userId = null) {
    try {
      const attendees = await this.getEventAttendees(eventId);
      const updatedAttendees = attendees.map(attendee => 
        attendee.id === attendeeId 
          ? { ...attendee, swipeAction: action, swipedAt: new Date().toISOString() }
          : attendee
      );
      
      // Update in Firestore
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      await updateDoc(eventRef, {
        attendees: updatedAttendees,
        updatedAt: Timestamp.now(),
      });
      
      // Also track user swipe if userId is provided
      if (userId) {
        await this.trackUserSwipe(eventId, userId, attendeeId, action);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating attendee action:', error);
      return false;
    }
  }

  // Get count of attendees for an event
  static async getAttendeeCount(eventId) {
    try {
      const attendees = await this.getEventAttendees(eventId);
      return attendees.length;
    } catch (error) {
      console.error('Error getting attendee count:', error);
      return 0;
    }
  }

  // Clear all attendees for an event (for testing/debugging)
  static async clearAllAttendees(eventId) {
    try {
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      await updateDoc(eventRef, {
        attendees: [],
        userSwipes: {}, // Also clear swipe data
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error clearing attendees:', error);
      return false;
    }
  }

  // Clear mock attendees and replace with real enrolled users
  static async resetAttendeesWithRealUsers(eventId, eventTitle, currentUserId = null) {
    try {
      // Clear existing attendees (mock or real)
      await this.clearAllAttendees(eventId);
      
      // Get real enrolled users as attendees
      const realAttendees = await this.getRealAttendees(eventId, currentUserId);
      
      if (realAttendees.length > 0) {
        // Store real attendees
        await this.storeEventAttendees(eventId, realAttendees, eventTitle);
        console.log(`Reset attendees for event ${eventId}: ${realAttendees.length} real users`);
        return realAttendees;
      }
      
      console.log(`No enrolled users found for event ${eventId}`);
      return [];
    } catch (error) {
      console.error('Error resetting attendees:', error);
      return [];
    }
  }

  // Check if user has completed swiping on all attendees for an event
  static async hasCompletedSwiping(eventId, userId) {
    try {
      const attendees = await this.getEventAttendees(eventId);
      if (attendees.length === 0) return false;
      
      // Check if user has swiped on all attendees
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        const data = eventSnap.data();
        const userSwipes = data.userSwipes || {}; // { [userId]: { [attendeeId]: action } }
        
        if (userSwipes[userId]) {
          const swipedAttendeeIds = Object.keys(userSwipes[userId]);
          const allAttendeeIds = attendees.map(a => a.id);
          
          // Check if all attendee IDs have been swiped
          return allAttendeeIds.every(attendeeId => swipedAttendeeIds.includes(attendeeId));
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking swipe completion:', error);
      return false;
    }
  }

  // Track user's swipe action (to determine if all are swiped)
  static async trackUserSwipe(eventId, userId, attendeeId, action) {
    try {
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        const data = eventSnap.data();
        const userSwipes = data.userSwipes || {};
        
        if (!userSwipes[userId]) {
          userSwipes[userId] = {};
        }
        
        userSwipes[userId][attendeeId] = {
          action: action,
          swipedAt: Timestamp.now(),
        };
        
        await updateDoc(eventRef, {
          userSwipes: userSwipes,
          updatedAt: Timestamp.now(),
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error tracking user swipe:', error);
      return false;
    }
  }

  // Get matches for a user in an event (mutual likes)
  static async getUserMatches(eventId, userId) {
    try {
      const eventRef = doc(db, ATTENDEES_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (!eventSnap.exists()) {
        return [];
      }
      
      const data = eventSnap.data();
      const userSwipes = data.userSwipes || {};
      const attendees = data.attendees || [];
      
      if (!userSwipes[userId]) {
        return [];
      }
      
      // Get attendees the current user liked
      const userLikedAttendees = Object.keys(userSwipes[userId])
        .filter(attendeeId => userSwipes[userId][attendeeId].action === 'liked');
      
      if (userLikedAttendees.length === 0) {
        return [];
      }
      
      // For demo purposes: return all liked attendees as matches
      // In a real app, we'd check if those attendees also liked the user back
      // Since these are mock attendees (not real users), we simulate matches
      const matches = attendees
        .filter(attendee => userLikedAttendees.includes(attendee.id))
        .map(attendee => ({
          ...attendee,
          matchedAt: new Date().toISOString(),
        }));
      
      return matches;
    } catch (error) {
      console.error('Error getting user matches:', error);
      return [];
    }
  }
}

export default AttendeeService;

