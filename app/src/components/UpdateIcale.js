import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { Dropdown } from 'react-native-element-dropdown';

const EditIcalres = ({ route, navigation }) => {
  const { icalresId } = route.params; // L'ID de l'icalres à modifier

  // États pour le nombre d'heures et le prix
  const [nbrHeure, setNbrHeure] = useState('');
  const [prix, setPrix] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items] = useState([
    { label: "1h00", value: "1h00" },
    { label: "1h30", value: "1h30" },
    { label: "2h00", value: "2h00" },
    { label: "2h30", value: "2h30" },
    { label: "3h00", value: "3h00" },
    { label: "3h30", value: "3h30" },
    { label: "4h00", value: "4h00" },
    { label: "4h30", value: "4h30" },
    { label: "5h00", value: "5h00" },
  ]);

  // Fonction pour récupérer les valeurs actuelles de l'icalres (facultatif)
  useEffect(() => {
    const fetchIcalresDetails = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Token non trouvé');
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/reservation/${icalresId}/getIcal`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNbrHeure(response.data.nbrHeure);
        setPrix(response.data.prix);
      } catch (error) {
        setError('Erreur lors de la récupération des détails');
      }
    };

    fetchIcalresDetails();
  }, [icalresId]);

  // Fonction pour envoyer les données modifiées
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Token non trouvé');
      setLoading(false);
      return;
    }

    // Vérifier que les champs ne sont pas vides
    if (!nbrHeure || !prix) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      setLoading(false);
      return;
    }

    // Envoyer la requête POST pour mettre à jour l'icalres
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/reservation/${icalresId}/editIcal`,
        { nbrHeure, prix },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Succès', 'Modification réussie');
      navigation.navigate('ReservationsHote');
    } catch (error) {
      setError('Erreur lors de la modification');
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Modifier</Text>

        {/* Champ pour le nombre d'heures */}
        <Text style={styles.label}>Nombre d'heure :</Text>
        <Dropdown
          style={styles.dropdown}
          data={items}
          labelField="label"
          valueField="value"
          placeholder="Choisir la durée"
          value={nbrHeure}
          onChange={(item) => setNbrHeure(item.value)}
        />

        {/* Champ pour le prix */}
        <Text style={styles.label}>Montant de la prestation :</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 35"
          keyboardType="numeric"
          value={prix}
          onChangeText={(value) => setPrix(value)}
        />

        {/* Bouton Envoyer */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? 'Envoi...' : 'Envoyer'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <FooterHote />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
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

export default EditIcalres;
