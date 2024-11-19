import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
      
      if (response.data.success) {
        const roles = response.data.roles;
        const token = response.data.token;

        // Stocker le token dans AsyncStorage
        await AsyncStorage.setItem('token', token);
        console.log('Token sauvegardé avec succès.');

        // Redirection en fonction des rôles
        if (roles.includes('ROLE_HOTE')) {
          navigation.navigate('ReservationsHote');
        } else if (roles.includes('ROLE_PRESTATAIRE')) {
          navigation.navigate('ReservationsPresta');
        } else {
          Alert.alert('Erreur', 'Rôle non reconnu.');
        }
      } else {
        Alert.alert('Erreur', 'Identifiants invalides');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion avec le serveur');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec Logo */}
      <View style={styles.header}>
        <Image source={require('../../public/assets/images/logo-clinup.png')} style={styles.logo} />
      </View>

      {/* Formulaire de connexion */}
      <View style={styles.card}>
        <Text style={styles.title}>Se connecter</Text>
        <Text style={styles.subtitle}>Bienvenue, veuillez-vous connecter à votre plateforme</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Se connecter</Text>
        </TouchableOpacity>


        
      </View>
      <Text style={styles.footerText}>
          Vous n'avez pas de compte ? <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>S'inscrire</Text>
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',  // Fond bordeaux
  },
  header: {
    position: 'absolute', // Permet au header de rester en haut
    top: 50,  // Position en haut de l'écran (tu peux ajuster cette valeur)
    alignItems: 'right',
    width: '100%',
    backgroundColor: 'white',

  },
  logo: {
    width: 130,  // Ajuster la taille du logo
    height: 40,
    resizeMode: 'contain',  // Garde le ratio de l'image
  },card: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 20,  // Garde les coins arrondis
      borderColor: '#666',  // Bordure noire
      borderWidth: 1,  // Épaisseur de la bordure (mince)
      padding: 30,
      alignItems: 'center',
      // Les propriétés d'ombre sont supprimées
    },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  submitButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 10,
    borderRadius: 25,
    width: '55%',
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#666',
    textAlign: 'right',  // Aligner le texte à droite
    width: '100%',       // Assure que le texte occupe toute la largeur
    fontSize: 14,
  },
  link: {
    color: '#FF385C',
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});
