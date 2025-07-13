import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutUsTab = () => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.aboutContainer}>
        <View style={styles.aboutHeader}>
          <Ionicons name="business" size={60} color="#007AFF" />
          <Text style={styles.aboutTitle}>OutOfOffice</Text>
          <Text style={styles.aboutSubtitle}>Discover Events & Connect</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            OutOfOffice is designed to help you discover exciting events and connect with like-minded people. 
            Whether you're looking for professional networking, social gatherings, or creative workshops, 
            we've got you covered.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Discover Events</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Like & Save Events</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Track Upcoming Events</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Connect with Others</Text>
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color="#666" />
            <Text style={styles.contactText}>support@outofofficce.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="globe" size={20} color="#666" />
            <Text style={styles.contactText}>www.outofoffice.com</Text>
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  aboutContainer: {
    padding: 20,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  aboutSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  aboutSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AboutUsTab; 