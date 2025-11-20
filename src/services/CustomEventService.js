// CustomEventService.js - Service for managing custom events created by premium/admin users
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CUSTOM_EVENTS_COLLECTION = 'customEvents';

class CustomEventService {
  /**
   * Create/Save a custom event to Firestore
   * @param {object} eventData - Event object with all details
   * @param {string} userId - ID of user creating the event
   * @returns {Promise<object>} - Saved event with ID and timestamps
   */
  static async createCustomEvent(eventData, userId) {
    try {
      const eventId = eventData.id?.toString() || Date.now().toString();
      const eventRef = doc(db, CUSTOM_EVENTS_COLLECTION, eventId);
      
      const customEventDoc = {
        ...eventData,
        id: eventId,
        isCustom: true,
        addedBy: userId,
        addedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(eventRef, customEventDoc);
      console.log('Custom event saved to Firestore:', eventId);
      
      return {
        ...customEventDoc,
        addedAt: customEventDoc.addedAt.toDate().toISOString(),
        createdAt: customEventDoc.createdAt.toDate().toISOString(),
        updatedAt: customEventDoc.updatedAt.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error creating custom event:', error);
      throw new Error('Failed to create custom event. Please try again.');
    }
  }

  /**
   * Get all custom events from Firestore
   * @returns {Promise<Array>} - Array of custom events
   */
  static async getAllCustomEvents() {
    try {
      const q = query(
        collection(db, CUSTOM_EVENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const customEvents = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        customEvents.push({
          ...data,
          id: docSnapshot.id,
          addedAt: data.addedAt?.toDate?.()?.toISOString() || data.addedAt,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        });
      });
      
      return customEvents;
    } catch (error) {
      console.error('Error fetching custom events:', error);
      return [];
    }
  }

  /**
   * Get a specific custom event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<object|null>} - Event object or null if not found
   */
  static async getCustomEventById(eventId) {
    try {
      const eventRef = doc(db, CUSTOM_EVENTS_COLLECTION, eventId.toString());
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        const data = eventSnap.data();
        return {
          ...data,
          id: eventSnap.id,
          addedAt: data.addedAt?.toDate?.()?.toISOString() || data.addedAt,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting custom event:', error);
      return null;
    }
  }

  /**
   * Get custom events created by a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of custom events
   */
  static async getCustomEventsByUser(userId) {
    try {
      const allEvents = await this.getAllCustomEvents();
      return allEvents.filter(event => event.addedBy === userId);
    } catch (error) {
      console.error('Error fetching user custom events:', error);
      return [];
    }
  }

  /**
   * Update a custom event
   * @param {string} eventId - Event ID
   * @param {object} updateData - Data to update
   * @returns {Promise<boolean>} - Success status
   */
  static async updateCustomEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, CUSTOM_EVENTS_COLLECTION, eventId.toString());
      await setDoc(
        eventRef,
        {
          ...updateData,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      console.log('Custom event updated:', eventId);
      return true;
    } catch (error) {
      console.error('Error updating custom event:', error);
      return false;
    }
  }

  /**
   * Delete a custom event
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteCustomEvent(eventId) {
    try {
      const eventRef = doc(db, CUSTOM_EVENTS_COLLECTION, eventId.toString());
      await deleteDoc(eventRef);
      console.log('Custom event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting custom event:', error);
      return false;
    }
  }
}

export default CustomEventService;

