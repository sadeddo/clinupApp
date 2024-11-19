import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import Footer from './Footer';

LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'fr';

export default function Disponibilites() {
  const [items, setItems] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null); // Stocker l'événement sélectionné
  const [isModalVisible, setModalVisible] = useState(false); // Contrôle de la visibilité du modal
  const [modifiedStart, setModifiedStart] = useState('');
  const [modifiedEnd, setModifiedEnd] = useState('');

  useEffect(() => {
    const fetchDisponibilites = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error("Token not found");
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/disponibilites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedEvents = response.data.reduce((acc, event) => {
          const eventDate = event.start.split(' ')[0];
          const eventStart = event.start.split(' ')[1].slice(0, 5);
          const eventEnd = event.end.split(' ')[1].slice(0, 5);

          if (!acc[eventDate]) {
            acc[eventDate] = [];
          }

          acc[eventDate].push({
            id: event.id, // ID de l'événement pour identifier chaque élément
            start: eventStart,
            end: eventEnd,
            name: `Disponible de ${eventStart} à ${eventEnd}`,
            height: 100, // Hauteur de l'événement
          });

          return acc;
        }, {});

        setItems(formattedEvents);
      } catch (error) {
        console.error("Erreur lors de la récupération des disponibilités", error);
      }
    };

    fetchDisponibilites();
  }, []);

  const handleEventPress = (event) => {
    setSelectedEvent(event); // Sélectionner l'événement
    setModifiedStart(event.start); // Pré-remplir avec les données actuelles
    setModifiedEnd(event.end);
    setModalVisible(true); // Afficher le modal
  };

  const handleUpdateEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://127.0.0.1:8000/api/disponibilites/${selectedEvent.id}`, {
        start: modifiedStart,
        end: modifiedEnd,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Mettre à jour localement l'événement modifié
    setItems(prevItems => {
      const updatedItems = { ...prevItems };
      const eventDate = Object.keys(updatedItems).find(date => 
        updatedItems[date].some(event => event.id === selectedEvent.id)
      );

      if (eventDate) {
        updatedItems[eventDate] = updatedItems[eventDate].map(event =>
          event.id === selectedEvent.id ? { ...event, start: modifiedStart, end: modifiedEnd, name: `Disponible de ${modifiedStart} à ${modifiedEnd}` } : event
        );
      }

      return updatedItems;
    });

      Alert.alert('Succès', 'Disponibilité mise à jour avec succès');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour de la disponibilité');
      console.error(error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/disponibilites/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Mettre à jour localement en supprimant l'événement
    setItems(prevItems => {
      const updatedItems = { ...prevItems };
      const eventDate = Object.keys(updatedItems).find(date => 
        updatedItems[date].some(event => event.id === selectedEvent.id)
      );

      if (eventDate) {
        updatedItems[eventDate] = updatedItems[eventDate].filter(event => event.id !== selectedEvent.id);

        // Supprimer complètement la date si plus aucun événement
        if (updatedItems[eventDate].length === 0) {
          delete updatedItems[eventDate];
        }
      }

      return updatedItems;
    });
      Alert.alert('Succès', 'Disponibilité supprimée avec succès');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la suppression de la disponibilité');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
       <Header />
      <Agenda
        items={items}
        selected={new Date().toISOString().split('T')[0]} // Date actuelle comme sélectionnée
        renderItem={(item) => {
          return (
            <TouchableOpacity onPress={() => handleEventPress(item)}>
              <View style={styles.item}>
                <Text>{item.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        renderEmptyData={() => {
          return (
            <View style={styles.emptyDate}>
              <Text>Aucune disponibilité pour ce jour.</Text>
            </View>
          );
        }}
        theme={{
          selectedDayBackgroundColor: '#92DCAF',
          dotColor: '#92DCAF',
          todayTextColor: '#00adf5',
        }}
      />

      {/* Modal pour modification ou suppression */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Modifier la disponibilité</Text>

            <TextInput
              style={styles.input}
              value={modifiedStart}
              onChangeText={setModifiedStart}
              placeholder="Heure de début"
            />
            <TextInput
              style={styles.input}
              value={modifiedEnd}
              onChangeText={setModifiedEnd}
              placeholder="Heure de fin"
            />

            <Button title="Mettre à jour" onPress={handleUpdateEvent} />
            <Button title="Supprimer" onPress={handleDeleteEvent} color="red" />
            <Button title="Annuler" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#92DCAF',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  emptyDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});
