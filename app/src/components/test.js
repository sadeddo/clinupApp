import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import Footer from './Footer';

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
      <Header />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Invitez des agents à rejoindre votre équipe</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom du prestataire"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.textArea}
          placeholder="Message d'invitation (facultatif)"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
};

export default AddInvit;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  formContainer: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
  textArea: { borderWidth: 1, padding: 10, height: 100, borderRadius: 8 },
  submitButton: { backgroundColor: '#ff385c', padding: 15, borderRadius: 25, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
