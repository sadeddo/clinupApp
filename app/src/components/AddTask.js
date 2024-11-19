import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';

const AddTask = ({ route }) => {
  const { logementId } = route.params;
  const navigation = useNavigation();

  const [taskType, setTaskType] = useState('Nettoyage des surfaces');
  const [taskDetail, setTaskDetail] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTaskDetails = (type) => {
    switch (type) {
      case 'Nettoyage des surfaces':
        return ['Poussière sur les meubles', 'Nettoyage des fenêtres', 'Nettoyage des tables'];
      case 'Nettoyage des sols':
        return ['Nettoyage des sols avec un aspirateur', 'Nettoyage des sols avec une serpillère'];
      case 'Nettoyage de la cuisine':
        return ['Lavage de la vaisselle', 'Nettoyage des appareils électroménagers'];
      case 'Nettoyage de la salle de bain':
        return ['Nettoyage des parois de douche', 'Nettoyage du pommeau de douche', 'Nettoyage des joints'];
      case 'Nettoyage des toilettes':
        return ['Nettoyage du siège et de la lunette', 'Nettoyage de l\'extérieur des toilettes'];
      case 'Changement des draps et des serviettes':
        return ['Remplacement des draps de lit', 'Lavage des draps'];
      case 'Organisation et rangement':
        return ['Ranger les objets décoratifs', 'Ranger les articles ménagers'];
      case 'Gestion des déchets':
        return ['Sortir les poubelles', 'Nettoyer les poubelles'];
      case 'Gestion de l\'odeur':
        return ['Utilisation de désodorisants', 'Utilisation de bougies parfumées'];
      default:
        return [];
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé');
        setLoading(false);
        return;
      }

      let formData = new FormData();
      formData.append('titre', taskType);
      formData.append('detail', taskDetail);
      formData.append('description', description);

      if (selectedImage) {
        formData.append('img', {
          uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'image.jpg',
        });
      }

      await axios.post(`http://127.0.0.1:8000/api/tache/${logementId}/ajouter`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Succès', 'Tâche ajoutée avec succès');
      navigation.replace('LogementDetails', { logementId });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Ajouter une tâche</Text>

        {/* Astuce section */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>🌟 Astuce</Text>
          <Text style={styles.tipText}>
            Le titre de tâche doit être simple, par exemple : Nettoyage de sol, désinfection d’un balcon etc..
          </Text>
        </View>

        {/* Type de tâche */}
        <Text style={styles.label}>Type de tâche</Text>
        <Dropdown
          style={styles.dropdown}
          data={[
            { label: 'Nettoyage des surfaces', value: 'Nettoyage des surfaces' },
            { label: 'Nettoyage des sols', value: 'Nettoyage des sols' },
            { label: 'Nettoyage de la cuisine', value: 'Nettoyage de la cuisine' },
            { label: 'Nettoyage de la salle de bain', value: 'Nettoyage de la salle de bain' },
            { label: 'Nettoyage des toilettes', value: 'Nettoyage des toilettes' },
            { label: 'Changement des draps et des serviettes', value: 'Changement des draps et des serviettes' },
            { label: 'Organisation et rangement', value: 'Organisation et rangement' },
            { label: 'Gestion des déchets', value: 'Gestion des déchets' },
            { label: 'Gestion de l\'odeur', value: 'Gestion de l\'odeur' },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Sélectionner le type de tâche"
          value={taskType}
          onChange={(item) => {
            setTaskType(item.value);
            setTaskDetail('');
          }}
        />

        {/* Détail de la tâche */}
        <Text style={styles.label}>Détail de la tâche</Text>
        <Dropdown
          style={styles.dropdown}
          data={getTaskDetails(taskType).map((detail) => ({ label: detail, value: detail }))}
          labelField="label"
          valueField="value"
          placeholder="Sélectionner le détail de la tâche"
          value={taskDetail}
          onChange={(item) => setTaskDetail(item.value)}
        />

        {/* Description */}
        <Text style={styles.label}>Avez-vous d'autre remarque? (Optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ajouter les détails de cette tâche ..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />

        {/* Image */}
        <Text style={styles.label}>Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imagePickerText}>
            {selectedImage ? 'Image sélectionnée' : 'Choisir un fichier'}
          </Text>
        </TouchableOpacity>

        {/* Afficher l'image sélectionnée */}
        {selectedImage && (
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.imagePreview}
          />
        )}

        {/* Bouton Ajouter */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? 'Chargement...' : 'Ajouter'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <FooterHote />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tipContainer: {
    backgroundColor: '#e7f7ee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#555',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTask;
