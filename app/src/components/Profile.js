import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Modal, SafeAreaView, Button, Platform,   } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Header from './Header';
import Footer from './Footer';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const API_URL = 'http://127.0.0.1:8000/api/profile'; // API du profil
const API_EXPERIENCES_URL = 'http://127.0.0.1:8000/api/experiences'; // API des expériences
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
//onglet Justif
function Justif()  {
  const [selectedFile, setSelectedFile] = useState(null);

  // Fonction pour récupérer un fichier
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      
      // Vérifiez si le fichier est sélectionné
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]; // Prenez le premier fichier sélectionné dans le tableau
        console.log("Fichier sélectionné : ", file);
        setSelectedFile(file);
      } else {
        console.log("Sélection annulée ou aucun fichier choisi");
        setSelectedFile(null);
      }
    } catch (err) {
      console.log("Erreur lors de la sélection du fichier:", err);
    }
  };

  // Fonction pour uploader un fichier
  const uploadDocument = async () => {
    console.log("Fichier à uploader : ", selectedFile);
    
    if (!selectedFile) {
      Alert.alert("Erreur", "Aucun fichier sélectionné");
      return;
    }

    // Récupérer le token JWT depuis AsyncStorage
    const token = await AsyncStorage.getItem("token");

    // Obtenez l'URI du fichier sélectionné
    const fileUri = selectedFile.uri;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      Alert.alert("Erreur", "Fichier introuvable sur le système de fichiers");
      return;
    }

    // Pour iOS et Android, assurez-vous que l'URI est correctement formatée
    let formData = new FormData();
formData.append("filePath", {
  uri: Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""), // Résoudre l'URI pour iOS
  type: "application/pdf", // Type du fichier
  name: selectedFile.name, // Nom du fichier
});

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/justificatif/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envoi du token dans les headers
          },
        }
      );
      Alert.alert("Succès", "Fichier uploadé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'upload:", error.response?.data || error.message);
      Alert.alert("Erreur", "L'upload du fichier a échoué");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Justificatif</Text>

      {/** Sélection du fichier **/}
      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text>{selectedFile ? selectedFile.name : "Choisir un fichier"}</Text>
      </TouchableOpacity>

      {/** Upload du fichier **/}
      <Button title="Envoyer le fichier" onPress={uploadDocument} />
    </View>
  );
};




// Onglet Expériences
function ExperiencesTab() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExperience, setNewExperience] = useState({
    experience: '',
    dtStart: '',
    dtEnd: '',
    description: ''
  });

  // Récupérer les expériences de l'utilisateur connecté
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Erreur', 'Token introuvable');
          return;
        }

        const response = await axios.get(API_EXPERIENCES_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setExperiences(response.data); // Mettre à jour la liste des expériences
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des expériences', error);
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  // Gérer la soumission d'une nouvelle expérience
  const handleAddExperience = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Token introuvable');
        return;
      }

      await axios.post(API_EXPERIENCES_URL, newExperience, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ajouter la nouvelle expérience à la liste sans recharger
      setExperiences([...experiences, newExperience]);
      setModalVisible(false);
      Alert.alert('Succès', 'Votre expérience a été ajoutée.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'expérience.');
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
      <Text style={styles.title}>Vos Expériences</Text>

      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{item.experience}</Text>
            <Text style={styles.experienceDate}>{item.dtStart} à {item.dtEnd}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Ajouter une expérience</Text>
      </TouchableOpacity>

      {/* Modal pour ajouter une nouvelle expérience */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une nouvelle expérience</Text>

            <TextInput
              style={styles.input}
              placeholder="Intitulé de poste"
              value={newExperience.experience}
              onChangeText={(text) => setNewExperience({ ...newExperience, experience: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Date de début (YYYY-MM-DD)"
              value={newExperience.dtStart}
              onChangeText={(text) => setNewExperience({ ...newExperience, dtStart: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Date de fin (YYYY-MM-DD)"
              value={newExperience.dtEnd}
              onChangeText={(text) => setNewExperience({ ...newExperience, dtEnd: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newExperience.description}
              multiline
              onChangeText={(text) => setNewExperience({ ...newExperience, description: text })}
            />

            <TouchableOpacity style={styles.button} onPress={handleAddExperience}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
// Autres onglets (Justificatifs et Sécurité)
function JustificatifsTab() {
    return <Justif />;
}

function SecurityTab() {
    return <ChangePasswordScreen />;
  }

// Intégrer les onglets dans l'application
function ProfileTabsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white'  }}>
      <View style={{ flex: 1 }}>
      <Header />
      <ProfileTabs.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ff385c',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#ff385c' },
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <ProfileTabs.Screen name="Général" component={GeneralTab} />
        <ProfileTabs.Screen name="Justificatifs" component={JustificatifsTab} />
        <ProfileTabs.Screen name="Expériences" component={ExperiencesTab} />
        <ProfileTabs.Screen name="Sécurité" component={SecurityTab} />
      </ProfileTabs.Navigator>
      <Footer />
      </View>
    </SafeAreaView>
  );
}

export default ProfileTabsScreen;

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


