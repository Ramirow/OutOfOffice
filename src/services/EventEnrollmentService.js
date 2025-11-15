// EventEnrollmentService.js - Service for persisting enrolled events to Firebase Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ENROLLMENTS_COLLECTION = 'eventEnrollments';

class EventEnrollmentService {
  /**
   * Enroll a user in an event (save to Firestore)
   * @param {string} userId - User ID
   * @param {object} event - Event object
   * @returns {Promise<object>} - Enrolled event with ID
   */
  static async enrollUserInEvent(userId, event) {
    try {
      const enrollmentId = `${userId}_${event.id || Date.now()}`;
      const enrollmentData = {
        userId: userId,
        eventId: event.id || Date.now(),
        event: {
          ...event,
          enrolledAt: Timestamp.now(),
          status: 'confirmed',
        },
        enrolledAt: Timestamp.now(),
        status: 'confirmed',
        createdAt: Timestamp.now(),
      };

      // Save to Firestore
      await setDoc(
        doc(db, ENROLLMENTS_COLLECTION, enrollmentId),
        enrollmentData
      );

      console.log('Event enrollment saved to Firestore:', enrollmentId);
      return {
        id: enrollmentId,
        ...enrollmentData,
        enrolledAt: enrollmentData.enrolledAt.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error enrolling user in event:', error);
      throw new Error('Failed to enroll in event. Please try again.');
    }
  }

  /**
   * Get all enrolled events for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of enrolled events
   */
  static async getUserEnrolledEvents(userId) {
    try {
      const q = query(
        collection(db, ENROLLMENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('enrolledAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const enrolledEvents = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Convert Firestore Timestamp to ISO string if needed
        const enrolledAt = data.enrolledAt instanceof Timestamp 
          ? data.enrolledAt.toDate().toISOString()
          : (data.enrolledAt?.toDate?.()?.toISOString() || data.enrolledAt);
        
        enrolledEvents.push({
          id: docSnapshot.id,
          ...data.event,
          enrolledAt: enrolledAt,
          status: data.status || 'confirmed',
        });
      });

      return enrolledEvents;
    } catch (error) {
      console.error('Error fetching enrolled events:', error);
      // Return empty array on error (graceful degradation)
      return [];
    }
  }

  /**
   * Unenroll a user from an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} - Success status
   */
  static async unenrollUserFromEvent(userId, eventId) {
    try {
      const enrollmentId = `${userId}_${eventId}`;
      await deleteDoc(doc(db, ENROLLMENTS_COLLECTION, enrollmentId));
      console.log('Event unenrollment successful:', enrollmentId);
      return true;
    } catch (error) {
      console.error('Error unenrolling from event:', error);
      return false;
    }
  }

  /**
   * Check if user is enrolled in an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} - Enrollment status
   */
  static async isUserEnrolled(userId, eventId) {
    try {
      const enrollmentId = `${userId}_${eventId}`;
      const docRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Update event status (e.g., from 'confirmed' to 'attended')
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @param {string} status - New status
   * @returns {Promise<boolean>} - Success status
   */
  static async updateEventStatus(userId, eventId, status) {
    try {
      const enrollmentId = `${userId}_${eventId}`;
      const docRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await setDoc(
          docRef,
          {
            status: status,
            updatedAt: Timestamp.now(),
          },
          { merge: true } // Merge with existing data
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating event status:', error);
      return false;
    }
  }

  /**
   * Get all users enrolled in a specific event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} - Array of user IDs
   */
  static async getEventEnrollments(eventId) {
    try {
      const q = query(
        collection(db, ENROLLMENTS_COLLECTION),
        where('eventId', '==', eventId)
      );

      const querySnapshot = await getDocs(q);
      const enrollments = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        enrollments.push({
          userId: data.userId,
          enrolledAt: data.enrolledAt?.toDate?.()?.toISOString() || data.enrolledAt,
          status: data.status,
        });
      });

      return enrollments;
    } catch (error) {
      console.error('Error fetching event enrollments:', error);
      return [];
    }
  }
}

export default EventEnrollmentService;

