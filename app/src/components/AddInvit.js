import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  HeaderHote from './HeaderHote'; // Assurez-vous d'importer correctement le Header
import Footer from './FooterHote'; // Assurez-vous d'importer correctement le Footer

const AddInvit = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
  
    const handleSubmit = async () => {
      const token = await AsyncStorage.getItem('token'); // Récupérer le token utilisateur
  
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/invit/ajouter',
          { nom: name, email, message },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ajouter le token dans les headers
            },
          }
        );
  
        Alert.alert('Succès', 'Invitation envoyée avec succès !');
        setName('');
        setEmail('');
        setMessage('');
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', error);
        Alert.alert('Erreur', 'Impossible d\'envoyer l\'invitation.');
      }
    };
  return (
    <View style={styles.container}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Invitez des agents à rejoindre votre équipe</Text>

          {/* Champ Nom du prestataire */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du prestataire</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du prestataire"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Champ E-mail du prestataire */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail du prestataire</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse e-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Champ Message d'invitation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Message d'invitation (facultatif)"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          {/* Bouton Envoyer */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

export default AddInvit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    height: 100,
  },
  submitButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
