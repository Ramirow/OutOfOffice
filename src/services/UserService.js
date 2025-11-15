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

  // Migrate initial mock users to Firestore (one-time operation)
  static async migrateInitialUsers(initialUsers) {
    try {
      const migrationPromises = initialUsers.map(async (user) => {
        const existingUser = await this.getUserById(user.id);
        if (!existingUser) {
          await this.createUser(user);
          console.log(`Migrated user: ${user.email}`);
        }
      });
      
      await Promise.all(migrationPromises);
      console.log('Initial users migration completed');
      return true;
    } catch (error) {
      console.error('Error migrating initial users:', error);
      return false;
    }
  }
}

export default UserService;

