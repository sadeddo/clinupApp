import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';

export default function App({ navigation }) {
  const [role, setRole] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!firstname || !lastname || !email || !password || !role) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis.');
      return;
    }

    axios.post('http://127.0.0.1:8000/api/register', {
      firstname,
      lastname,
      code,
      email,
      password,
      role,
    })
    .then(response => {
      const data = response.data;
      if (data.error) {
        Alert.alert('Erreur', data.error);
      } else {
        Alert.alert('Succès', 'Inscription réussie');
      }
    })
    .catch(error => {
      if (error.response) {
        Alert.alert('Erreur', error.response.data.message || 'Erreur lors de l\'inscription');
      } else if (error.request) {
        Alert.alert('Erreur', 'Le serveur ne répond pas');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header avec Logo */}
        <View style={styles.header}>
          <Image source={require('../../public/assets/images/logo-clinup.png')} style={styles.logo} />
        </View>

        {/* Formulaire de création de compte */}
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenue chez vous</Text>
          <Text style={styles.subtitle}>Il est temps de créer votre compte et nous rejoindre</Text>

          <Text style={styles.label}>Je suis un(e)</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'ROLE_HOTE' && styles.selectedRole]}
              onPress={() => setRole('ROLE_HOTE')}
            >
              <Image source={require('../../public/assets/images/key.png')} style={styles.icon} />
              <Text style={styles.roleText}>Hôte</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'ROLE_PRESTATAIRE' && styles.selectedRole]}
              onPress={() => setRole('ROLE_PRESTATAIRE')}
            >
              <Image source={require('../../public/assets/images/cleaning.png')} style={styles.icon} />
              <Text style={styles.roleText}>Prestataire</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={firstname}
              onChangeText={setFirstname}
            />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={lastname}
              onChangeText={setLastname}
            />
            <TextInput
              style={styles.input}
              placeholder="Code d'invitation"
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
            <Text style={styles.submitButtonText}>Créer mon compte</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
            Vous avez déjà un compte ? <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Se connecter</Text>
          </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width:'100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,  // Ajuster l'espacement du haut
    marginBottom: 50, // Espace entre le header et la carte
    width: '100%',
    // Position en haut de l'écran (tu peux ajuster cette valeur)
    alignItems: 'right',
  },
  logo: {
    width: 130,
    height: 40,
    resizeMode: 'contain',
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#666',
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20, // Pour espacer la carte des autres éléments si nécessaire
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRole: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  roleText: {
    color: 'black',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 5,
    marginBottom:20,
    color: 'gray',
  },
  link: {
    color: '#FF385C',
  },
});
