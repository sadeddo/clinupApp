import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Rating } from 'react-native-ratings';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import { Dropdown } from 'react-native-element-dropdown';
import FooterHote from './FooterHote';

const AddCommentScreen = ({ route, navigation }) => {
  const { prestataireId, idDemande, prestataireName } = route.params;
  const [rating, setRating] = useState(0);
  const [recommendation, setRecommendation] = useState('');
  const [comment, setComment] = useState('');
  const options = [
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' },
  ];

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comment/${prestataireId}/${idDemande}/new`,
        {
          evaluation: rating,
          recommandation: recommendation,
          comment: comment
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        Alert.alert('Succès', 'Votre évaluation a été ajoutée avec succès');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de votre évaluation');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <HeaderHote />
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Approuvé!</Text>
      <Text style={styles.subtitle}>Vous avez approuvé l'entretien avec succès.</Text>
      <Text style={styles.subtitle}>Prenez un instant pour noter l'agent {prestataireName}</Text>

      <Rating
        showRating
        onFinishRating={setRating}
        style={{ paddingVertical: 10 }}
      />

      <View style={styles.prestataireInfo}>
        <Text style={styles.prestataireInfoText}>{prestataireName}</Text>
      </View>

      <Text style={styles.label}>Recommanderiez-vous ce prestataire ?</Text>
      <Dropdown
        style={styles.dropdown}
        data={options}
        labelField="label"
        valueField="value"
        placeholder="Choisr une réponse"
        value={recommendation}
        onChange={(item) => setRecommendation(item.value)}
      />

      <Text style={styles.label}>Écrivez votre évaluation</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={comment}
        onChangeText={setComment}
        placeholder="Décrivez la qualité, le service, Exprimez votre expérience ..."
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Évaluer</Text>
      </TouchableOpacity>
      </ScrollView>
    <FooterHote />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  prestataireInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  prestataireInfoText: {
    fontSize: 18,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF4081',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddCommentScreen;