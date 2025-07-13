import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { login, register, resetUsers } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      console.log('Login successful:', result);
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, name);
      console.log('Registration successful:', result);
      Alert.alert('Success', 'Account created successfully!');
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will reset all users to default demo accounts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetUsers();
              Alert.alert('Success', 'Data reset successfully! You can now use the demo accounts.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
            }
          }
        }
      ]
    );
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsRegistering(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    // Clear form fields when switching modes
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>OutOfOffice</Text>
        <Text style={styles.subtitle}>Find your next adventure</Text>
        
        <View style={styles.form}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !isRegistering && styles.activeToggle]}
              onPress={() => !isRegistering || toggleMode()}
            >
              <Text style={[styles.toggleText, !isRegistering && styles.activeToggleText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isRegistering && styles.activeToggle]}
              onPress={() => isRegistering || toggleMode()}
            >
              <Text style={[styles.toggleText, isRegistering && styles.activeToggleText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isRegistering ? 'Create Account' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Debug section */}
          <TouchableOpacity 
            style={styles.debugToggle}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugToggleText}>
              {showDebug ? 'Hide' : 'Show'} Demo Accounts
            </Text>
          </TouchableOpacity>

          {showDebug && (
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Demo Accounts:</Text>
              
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => fillDemoAccount('demo@example.com', 'password123')}
              >
                <Text style={styles.demoButtonText}>👤 Regular User</Text>
                <Text style={styles.demoButtonSubtext}>demo@example.com / password123</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => fillDemoAccount('admin@test.com', 'admin123')}
              >
                <Text style={styles.demoButtonText}>🛡️ Admin User</Text>
                <Text style={styles.demoButtonSubtext}>admin@test.com / admin123</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => fillDemoAccount('premium@demo.com', 'premium123')}
              >
                <Text style={styles.demoButtonText}>⭐ Premium User</Text>
                <Text style={styles.demoButtonSubtext}>premium@demo.com / premium123</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetData}
              >
                <Text style={styles.resetButtonText}>🔄 Reset All Data</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugToggle: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  debugToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  debugSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  demoButtonSubtext: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen; 