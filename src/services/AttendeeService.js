// AttendeeService.js - Service for managing event attendees
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

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

  // Initialize attendees for an event (generate if not exists)
  static async initializeEventAttendees(eventId, eventTitle) {
    try {
      // Check if attendees already exist
      const existingAttendees = await this.getEventAttendees(eventId);
      
      if (existingAttendees.length > 0) {
        // Attendees already exist, return them
        return existingAttendees;
      }

      // Generate new attendees
      const newAttendees = generateMockAttendees(eventTitle, eventId);
      
      // Store them
      await this.storeEventAttendees(eventId, newAttendees);
      
      return newAttendees;
    } catch (error) {
      console.error('Error initializing attendees:', error);
      // Return mock data as fallback
      return generateMockAttendees(eventTitle, eventId);
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
  static async updateAttendeeAction(eventId, attendeeId, action) {
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
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error clearing attendees:', error);
      return false;
    }
  }
}

export default AttendeeService;

