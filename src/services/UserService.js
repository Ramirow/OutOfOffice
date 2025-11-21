import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

class UserService {
  // Create/Register a new user
  static async createUser(userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userData.id);
      const userDoc = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(userRef, userDoc);
      console.log('User created in Firestore:', userData.id);
      return { success: true, user: userDoc };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
      
      const updatedUser = await this.getUserById(userId);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Get all users (for admin purposes)
  static async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Generate next incremental user ID (similar to mock users: '1', '2', '3', etc.)
  static async getNextUserId() {
    try {
      const allUsers = await this.getAllUsers();
      let maxId = 0;
      
      // Find the highest numeric ID
      allUsers.forEach((user) => {
        const numericId = parseInt(user.id, 10);
        if (!isNaN(numericId) && numericId > maxId) {
          maxId = numericId;
        }
      });
      
      // Return the next ID as a string (like mock users)
      return (maxId + 1).toString();
    } catch (error) {
      console.error('Error generating next user ID:', error);
      // Fallback to timestamp if query fails
      return Date.now().toString();
    }
  }

  // Migrate initial mock users to Firestore (one-time operation)
  static async migrateInitialUsers(initialUsers) {
    try {
      const migrationPromises = initialUsers.map(async (user) => {
        // Check by email first (more reliable)
        const existingUserByEmail = await this.getUserByEmail(user.email);
        
        // Normalize email
        const normalizedUser = {
          ...user,
          email: user.email.toLowerCase(),
        };
        
        if (!existingUserByEmail) {
          // User doesn't exist, create it
          await this.createUser(normalizedUser);
          console.log(`✅ Migrated user: ${normalizedUser.email} (ID: ${normalizedUser.id})`);
        } else {
          // User exists - always update password to ensure it matches the hash function
          // Use the actual user ID from Firestore (not the expected one)
          const actualUserId = existingUserByEmail.id;
          
          // Always update password during migration to fix any mismatches
          await this.updateUser(actualUserId, { password: normalizedUser.password });
          console.log(`🔄 Updated password for user: ${normalizedUser.email} (ID: ${actualUserId})`);
          
          // Check if user ID matches expected (warning only)
          if (actualUserId !== normalizedUser.id) {
            console.log(`⚠️ User ID mismatch for ${normalizedUser.email}. Expected: ${normalizedUser.id}, Found: ${actualUserId} (using found ID)`);
          }
        }
      });
      
      await Promise.all(migrationPromises);
      console.log('✅ Initial users migration completed');
      return true;
    } catch (error) {
      console.error('❌ Error migrating initial users:', error);
      return false;
    }
  }
}

export default UserService;

