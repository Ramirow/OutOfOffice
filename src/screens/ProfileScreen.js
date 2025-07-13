import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ visible, onClose }) => {
  const { user, updateUserProfile, isAdmin, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  // Profile form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    image: null,
    age: '',
    career: '',
    study: '',
    hobby: '',
    bio: '',
    phone: '',
    location: '',
  });

  // Load user profile data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        image: user.image || null,
        age: user.age || '',
        career: user.career || '',
        study: user.study || '',
        hobby: user.hobby || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user]);

  // Developer utility to show stored data (for debugging)
  const showStoredData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('@OutOfOffice:users');
      const storedAuth = await AsyncStorage.getItem('@OutOfOffice:auth');
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userList = users.map(u => `${u.email} : ${u.password} (hashed)`).join('\n');
        
        Alert.alert(
          'Stored User Data',
          `All Users (passwords are hashed):\n${userList}\n\nCurrent Auth:\n${storedAuth}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve stored data');
    }
  };

  const selectImageFromGallery = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select a photo.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileData(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
        setShowImageOptions(false);
        Alert.alert('Success', 'Profile image updated!');
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileData(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
        setShowImageOptions(false);
        Alert.alert('Success', 'Profile image updated!');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setProfileData(prev => ({ ...prev, image: null }))
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleColor = () => {
    if (isAdmin()) return '#FF5722';
    if (isPremium()) return '#FF9800';
    return '#007AFF';
  };

  const getRoleText = () => {
    if (isAdmin()) return 'Admin User';
    if (isPremium()) return 'Premium User';
    return 'Regular User';
  };

  const renderProfileImage = () => {
    return (
      <View style={styles.imageContainer}>
        {profileData.image ? (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: profileData.image }} 
              style={styles.profileImage}
              onError={() => {
                Alert.alert('Error', 'Failed to load image.');
                setProfileData(prev => ({ ...prev, image: null }));
              }}
            />
            {isEditing && (
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person" size={50} color="#666" />
          </View>
        )}
        
        {isEditing && (
          <TouchableOpacity 
            style={styles.editImageButton} 
            onPress={() => setShowImageOptions(true)}
          >
            <Ionicons name="camera" size={20} color="#007AFF" />
            <Text style={styles.editImageText}>
              {profileData.image ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderImageOptionsModal = () => {
    return (
      <Modal visible={showImageOptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Photo</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to add your profile picture</Text>
            
            <View style={styles.imageOptionsContainer}>
              <TouchableOpacity 
                style={styles.imageOptionButton}
                onPress={selectImageFromGallery}
              >
                <Ionicons name="images" size={40} color="#007AFF" />
                <Text style={styles.imageOptionText}>Gallery</Text>
                <Text style={styles.imageOptionSubtext}>Choose from photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageOptionButton}
                onPress={takePhotoWithCamera}
              >
                <Ionicons name="camera" size={40} color="#007AFF" />
                <Text style={styles.imageOptionText}>Camera</Text>
                <Text style={styles.imageOptionSubtext}>Take a new photo</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFieldRow = (label, field, placeholder, keyboardType = 'default', multiline = false) => {
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.fieldInput, multiline && styles.multilineInput]}
            value={profileData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
          />
        ) : (
          <Text style={styles.fieldValue}>
            {profileData[field] || 'Not specified'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            {/* Debug button - remove in production */}
            <TouchableOpacity onPress={showStoredData} style={styles.debugButton}>
              <Ionicons name="code" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.headerAction}>
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Image */}
          {renderProfileImage()}

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            {renderFieldRow('Full Name', 'name', 'Enter your full name')}
            {renderFieldRow('Email', 'email', 'Enter your email', 'email-address')}
            {renderFieldRow('Age', 'age', 'Enter your age', 'numeric')}
            {renderFieldRow('Phone', 'phone', 'Enter your phone number', 'phone-pad')}
            {renderFieldRow('Location', 'location', 'Enter your location')}
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional & Education</Text>
            {renderFieldRow('Career', 'career', 'Enter your career/job title')}
            {renderFieldRow('Study', 'study', 'Enter your education/studies')}
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal</Text>
            {renderFieldRow('Hobbies', 'hobby', 'Enter your hobbies and interests')}
            {renderFieldRow('Bio', 'bio', 'Tell us about yourself...', 'default', true)}
          </View>

          {/* Role Badge */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={styles.roleText}>{getRoleText()}</Text>
              </View>
              <Text style={styles.roleDescription}>
                {isAdmin() ? 'You have admin privileges to manage all events' : 
                 isPremium() ? 'You can create and manage events' : 
                 'Standard user with event participation access'}
              </Text>
            </View>
          </View>

          {/* Security Status */}
          <View style={[styles.section, styles.securitySection]}>
            <Text style={styles.securityTitle}>🔒 Security Status</Text>
            <Text style={styles.securityText}>
              ✅ Passwords are now hashed for basic security{'\n'}
              ✅ User data persists between app launches{'\n'}
              ✅ Profile data is stored locally on device{'\n'}
              ⚠️ For production: Use bcrypt or similar for stronger hashing
            </Text>
          </View>
        </ScrollView>

        {/* Image Options Modal */}
        {renderImageOptionsModal()}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  debugButton: {
    padding: 5,
  },
  headerAction: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    gap: 6,
  },
  editImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  imageOptionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
  },
  imageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  imageOptionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningSection: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  securitySection: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  fieldRow: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    minHeight: 44,
  },
  roleContainer: {
    alignItems: 'flex-start',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 10,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ProfileScreen; 