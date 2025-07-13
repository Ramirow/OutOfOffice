import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeTab = ({ onTabChange }) => {
  const handleStartExploring = () => {
    if (onTabChange) {
      onTabChange('explore');
    }
  };

  return (
    <View style={styles.tabContent}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Ionicons name="business" size={80} color="#fff" />
              <Text style={styles.welcomeTitle}>Welcome to OutOfOffice</Text>
              <Text style={styles.welcomeSubtitle}>
                Connect, Network & Discover Amazing Events
              </Text>
            </View>

            <View style={styles.featuresSection}>
              <View style={styles.featureCard}>
                <Ionicons name="people" size={40} color="#007AFF" />
                <Text style={styles.featureTitle}>Network</Text>
                <Text style={styles.featureText}>Connect with professionals</Text>
              </View>

              <View style={styles.featureCard}>
                <Ionicons name="calendar" size={40} color="#007AFF" />
                <Text style={styles.featureTitle}>Events</Text>
                <Text style={styles.featureText}>Discover exciting events</Text>
              </View>

              <View style={styles.featureCard}>
                <Ionicons name="trophy" size={40} color="#007AFF" />
                <Text style={styles.featureTitle}>Grow</Text>
                <Text style={styles.featureText}>Expand your network</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.exploreButton} onPress={handleStartExploring}>
              <Text style={styles.exploreButtonText}>Start Exploring</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 50,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default HomeTab; 