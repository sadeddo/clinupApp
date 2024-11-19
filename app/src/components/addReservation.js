import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';

const AddReservation = () => {
  const [reservation, setReservation] = useState({
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', }),
    nbrHeure: '',
    prix: '',
    logement_id: null,
    description: '',
  });

  const [logements, setLogements] = useState([]); // Liste des logements de l'utilisateur
  const [selectedDuration, setSelectedDuration] = useState(reservation.nbrHeure);
  const navigation = useNavigation(); 
  const [open, setOpen] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // Pour afficher le date picker
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false); // Pour afficher le time picker
  const [selectedDate, setSelectedDate] = useState(new Date()); // Pour stocker la date sélectionnée
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Récupérer les logements de l'utilisateur
  useEffect(() => {
    const fetchLogements = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Token non trouvé');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/logement/get', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogements(response.data); // Stocker les logements
      } catch (error) {
        console.error('Erreur lors de la récupération des logements', error);
        setError('Impossible de récupérer les logements.');
      }
    };

    fetchLogements();
  }, []);

  const handleInputChange = (name, value) => {
    setReservation({ ...reservation, [name]: value });
  };

  /*const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    handleInputChange('date', currentDate.toISOString().split('T')[0]); // Formater la date en YYYY-MM-DD
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(Platform.OS === 'ios');
    setSelectedTime(currentTime);
    handleInputChange('heure', currentTime.toTimeString().split(' ')[0]); // Formater l'heure en HH:MM:SS
  };*/
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleTimeConfirm = (heure) => {
    setSelectedTime(heure);
    const hours = heure.getHours().toString().padStart(2, '0');
    const minutes = heure.getMinutes().toString().padStart(2, '0');
    handleInputChange('heure', `${hours}:${minutes}`);
    console.log('reservation.heure:', reservation.heure);
    hideTimePicker();
  };
  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setReservation((prevReservation) => ({
      ...prevReservation,
      date: date.toISOString().split('T')[0],
    }));
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Récupérer le token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Token non trouvé');
      setLoading(false);
      return;
    }

    // Valider les champs obligatoires
    if (!reservation.date || !reservation.heure || !reservation.nbrHeure || !reservation.prix || !reservation.logement_id) {
      console.log('reservation.date:', reservation.date);
      console.log('reservation.heure:', reservation.heure);
      Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reservation/ajouter',
        reservation,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Succès', 'Réservation ajoutée avec succès');
      navigation.navigate('ReservationsHote');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réservation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de la réservation');
    } finally {
      setLoading(false);
    }
  };
  const handleDropdownChange = (value) => {
    setSelectedDuration(value);
    handleInputChange('nbrHeure', value);
};


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Ajouter une réservation</Text>

        {/* Sélection de la date */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={showDatePicker}>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={reservation.date ? reservation.date : selectedDate.toISOString().split('T')[0]} // Affiche la date sélectionnée
            editable={false} // L'utilisateur ne peut pas écrire manuellement
            pointerEvents="none" // Désactiver l'interaction pour le champ
          />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          date={selectedDate}
        />

       {/* Sélection de l'heure */}
<Text style={styles.label}>Heure</Text>
<TouchableOpacity onPress={showTimePicker}>
  <TextInput
    style={styles.input}
    placeholder="HH:MM"
    value={
      reservation.heure
        ? reservation.heure
        : selectedTime.getHours().toString().padStart(2, '0') +
          ':' +
          selectedTime.getMinutes().toString().padStart(2, '0')
    }
    editable={false}
    pointerEvents="none"
  />
</TouchableOpacity>
<DateTimePickerModal
  isVisible={isTimePickerVisible}
  mode="time"
  onConfirm={handleTimeConfirm}
  onCancel={hideTimePicker}
  date={selectedTime}
/>


        {/* Durée */}
        <Text style={styles.label}>Durée</Text>
        <Dropdown
          style={styles.picker}
          data={items}
          labelField="label"
          valueField="value"
          placeholder="Choisir la durée"
          value={selectedDuration}
          onChange={(item) => handleDropdownChange(item.value)}
        />

        {/* Prix */}
        <Text style={styles.label}>Prix</Text>
        <TextInput
          style={styles.input}
          placeholder="Montant"
          keyboardType="numeric"
          value={reservation.prix}
          onChangeText={(value) => handleInputChange('prix', value)}
        />

       {/* Sélection du logement */}
<Text style={styles.label}>Logement</Text>
<Dropdown
  style={styles.picker}
  data={logements.map((logement) => ({ label: logement.nom, value: logement.id }))}
  labelField="label"
  valueField="value"
  placeholder="Sélectionner un logement"
  value={reservation.logement_id}
  onChange={(item) => handleInputChange('logement_id', item.value)}
/>

        {/* Description */}
        <Text style={styles.label}>Description (Optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ajouter une description"
          multiline
          numberOfLines={4}
          value={reservation.description}
          onChangeText={(value) => handleInputChange('description', value)}
        />

        {/* Bouton Soumettre */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? 'Chargement...' : 'Soumettre'}</Text>
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
  textArea: {
    height: 100,
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
  picker: {
    height: 50,
    marginBottom: 20,
  },
});

export default AddReservation;
