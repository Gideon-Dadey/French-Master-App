import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Success',
      'Thank you for your message! We will get back to you soon.',
      [{ text: 'OK', onPress: () => {
        setFormData({ name: '', email: '', whatsapp: '', message: '' });
      }}]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>
            Leave us a message for enquiries and additional information
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>WhatsApp contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your WhatsApp number"
              value={formData.whatsapp}
              onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your message"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>Get in Touch</Text>
          
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={24} color="#1E88E5" />
            <Text style={styles.contactText}>info@thefrenchmastergh.com</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.contactText}>Contact us on WhatsApp</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  contactInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
  },
});
