import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  'Technology',
  'Business',
  'Social',
  'Outdoor',
  'Creative',
  'Sports',
  'Education',
  'Health',
];

const AddEventModal = ({ visible, onClose, onAddEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    time: '',
    date: '',
    category: 'Technology',
    price: '',
    image: '',
    attendees: '0',
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.time.trim()) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    
    if (formData.attendees && isNaN(parseInt(formData.attendees))) {
      newErrors.attendees = 'Attendees must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // Create new event object
    const newEvent = {
      id: Date.now(), // Generate unique ID
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      time: formData.time.trim(),
      date: formData.date.trim(),
      category: formData.category,
      price: formData.price.trim(),
      image: formData.image.trim(),
      attendees: parseInt(formData.attendees) || 0,
    };
    
    onAddEvent(newEvent);
    resetForm();
    onClose();
    
    Alert.alert('Success', 'Event added successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      time: '',
      date: '',
      category: 'Technology',
      price: '',
      image: '',
      attendees: '0',
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event, date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date && event.type !== 'dismissed') {
        setSelectedDate(date);
        handleInputChange('date', formatDate(date));
      }
    } else {
      // On iOS, update the date as user scrolls
      if (date) {
        setSelectedDate(date);
      }
      // Handle dismissal
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };

  const handleConfirmDate = () => {
    handleInputChange('date', formatDate(selectedDate));
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add New Event</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButton}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your event"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="e.g., Central Park, New York or 123 Main St, Los Angeles"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              autoCapitalize="words"
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={[styles.input, errors.time && styles.inputError]}
                placeholder="e.g., 7:00 PM"
                value={formData.time}
                onChangeText={(text) => handleInputChange('time', text)}
              />
              {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.dateInput, errors.date && styles.inputError]}
                  placeholder="e.g., Dec 15, 2024"
                  value={formData.date}
                  onChangeText={(text) => handleInputChange('date', text)}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={openDatePicker}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={22} color="#007AFF" />
                </TouchableOpacity>
              </View>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWrapper}>
                    <View style={styles.datePickerInnerWrapper}>
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                        textColor="#333"
                        accentColor="#007AFF"
                        themeVariant="light"
                        style={styles.datePicker}
                      />
                    </View>
                  </View>
                  {Platform.OS === 'ios' && (
                    <View style={styles.datePickerActions}>
                      <TouchableOpacity
                        style={styles.datePickerCancelButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.datePickerConfirmButton}
                        onPress={handleConfirmDate}
                      >
                        <Text style={styles.datePickerConfirmText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.selectedCategory
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="e.g., Free or $25"
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expected Attendees</Text>
              <TextInput
                style={[styles.input, errors.attendees && styles.inputError]}
                placeholder="0"
                value={formData.attendees}
                onChangeText={(text) => handleInputChange('attendees', text)}
                keyboardType="numeric"
              />
              {errors.attendees && <Text style={styles.errorText}>{errors.attendees}</Text>}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Image URL *</Text>
            <TextInput
              style={[styles.input, errors.image && styles.inputError]}
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChangeText={(text) => handleInputChange('image', text)}
              autoCapitalize="none"
            />
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          </View>
        </ScrollView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 45,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  calendarButton: {
    position: 'absolute',
    right: 12,
    padding: 5,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
  },
  datePickerContainer: {
    marginTop: 10,
    marginHorizontal: 0,
    marginLeft: -15,
    marginRight: -15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderBottomWidth: 1,
    borderBottomColor: '#0056b3',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  datePickerCloseButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  datePickerWrapper: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingLeft: 35,
    paddingRight: 35,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    width: '100%',
    overflow: 'visible',
  },
  datePickerInnerWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 5,
    overflow: 'visible',
  },
  datePicker: {
    width: '100%',
    maxWidth: '100%',
    marginHorizontal: 0,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddEventModal; 