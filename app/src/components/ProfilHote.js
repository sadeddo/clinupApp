import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Modal, SafeAreaView, Button, Platform,   } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const API_URL = 'http://127.0.0.1:8000/api/profile'; // API du profil
const API_CHANGE_PASSWORD_URL = 'http://127.0.0.1:8000/api/change-password'; 

const ProfileTabs = createMaterialTopTabNavigator();

function ProfileScreen() {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    adresse: '',
    description: '',
    picture: null,
  });
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Récupérer le token depuis AsyncStorage
        if (!token) {
          Alert.alert('Erreur', 'Token introuvable');
          return;
        }

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // Utiliser le token dans les headers
          },
        });

        console.log("Données récupérées de l'API:", response.data);

        setProfile({
          firstname: response.data.firstname || '',
          lastname: response.data.lastname || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          adresse: response.data.adresse || '',
          description: response.data.description || '',
          picture: response.data.picture || null,
        });

        setLoading(false); // Terminer le chargement une fois les données récupérées
      } catch (error) {
        console.error('Erreur lors du chargement du profil', error);
        setError('Erreur lors de la récupération des données de profil');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Gérer les changements dans les champs de formulaire
  const handleInputChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Soumettre les modifications du profil avec PUT
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Récupérer le token avant de soumettre la requête
      if (!token) {
        Alert.alert('Erreur', 'Token introuvable');
        return;
      }

      // Envoyer les données avec PUT pour mettre à jour le profil
      await axios.put(API_URL, profile, {
        headers: {
          Authorization: `Bearer ${token}`, // Utiliser le token pour l'autorisation
        },
      });

      Alert.alert('Succès', 'Votre profil a été mis à jour.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le profil</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Nom */}
      <View style={styles.inputGroup}>
        <Text>Nom</Text>
        <TextInput
          style={styles.input}
          value={profile.lastname} // Pré-remplissage avec les données du profil
          onChangeText={(value) => handleInputChange('lastname', value)}
        />
      </View>

      {/* Prénom */}
      <View style={styles.inputGroup}>
        <Text>Prénom</Text>
        <TextInput
          style={styles.input}
          value={profile.firstname} // Pré-remplissage avec les données du profil
          onChangeText={(value) => handleInputChange('firstname', value)}
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={profile.email} // Pré-remplissage avec les données du profil
          keyboardType="email-address"
          onChangeText={(value) => handleInputChange('email', value)}
        />
      </View>

      {/* Numéro de téléphone */}
      <View style={styles.inputGroup}>
        <Text>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          value={profile.phoneNumber} // Pré-remplissage avec les données du profil
          keyboardType="phone-pad"
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
        />
      </View>

      {/* Adresse */}
      <View style={styles.inputGroup}>
        <Text>Adresse</Text>
        <TextInput
          style={styles.input}
          value={profile.adresse} // Pré-remplissage avec les données du profil
          onChangeText={(value) => handleInputChange('adresse', value)}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text>Description</Text>
        <TextInput
          style={styles.input}
          multiline
          value={profile.description} // Pré-remplissage avec les données du profil
          onChangeText={(value) => handleInputChange('description', value)}
        />
      </View>

      {/* Bouton de modification */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );
}

// Onglet pour changer le mot de passe
function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
    const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
        Alert.alert('Erreur', 'Le nouveau mot de passe et la confirmation ne correspondent pas.');
        return;
      }
  
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Erreur', 'Token introuvable');
          return;
        }
  
        await axios.post(API_CHANGE_PASSWORD_URL, {
          oldPassword: oldPassword,
          newPassword: newPassword,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        Alert.alert('Succès', 'Votre mot de passe a été mis à jour.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        Alert.alert('Erreur', "Le mot de passe n'a pas pu être changé.");
        console.error(error);
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Changer le mot de passe</Text>
  
        <View style={styles.inputGroup}>
          <Text>Ancien mot de passe</Text>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Entrez l'ancien mot de passe"
            secureTextEntry
          />
        </View>
  
        <View style={styles.inputGroup}>
          <Text>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Entrez le nouveau mot de passe"
            secureTextEntry
          />
        </View>
  
        <View style={styles.inputGroup}>
          <Text>Confirmer le nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez le nouveau mot de passe"
            secureTextEntry
          />
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Changer le mot de passe</Text>
        </TouchableOpacity>
      </View>
    );
  }
// Onglet Général (inchangé)
function GeneralTab() {
  return <ProfileScreen />;
}

function SecurityTab() {
    return <ChangePasswordScreen />;
  }

// Intégrer les onglets dans l'application
function ProfileHote() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white'  }}>
      <View style={{ flex: 1 }}>
      <HeaderHote />
      <ProfileTabs.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ff385c',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#ff385c' },
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <ProfileTabs.Screen name="Général" component={GeneralTab} />
        <ProfileTabs.Screen name="Sécurité" component={SecurityTab} />
      </ProfileTabs.Navigator>
      <FooterHote />
      </View>
    </SafeAreaView>
  );
}

export default ProfileHote;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  experienceItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  experienceDate: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
});


