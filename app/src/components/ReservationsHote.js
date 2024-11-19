import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const ReservationAndIcalres = () => {
  const [reservations, setReservations] = useState([]);
  const [icalres, setIcalres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(null);
  const [counts, setCounts] = useState({});
  const navigation = useNavigation();

  const handlePublish = async (icalresId) => { 
     setPublishing(icalresId); 

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Token non trouvé');
      setPublishing(null);
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/reservation/${icalresId}/publier`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Succès', 'Votre réservation a été publiée avec succès');
        fetchReservationsAndIcalres();
      } else {
        setError('Une erreur est survenue lors de la publication');
      }
    } catch (error) {
      setError('Erreur lors de la publication');
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication');
    } finally {
      setPublishing(null);
    }
};

  const fetchReservationsAndIcalres = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Token manquant.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/reservation/listes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReservations(response.data.reservations);
      setIcalres(response.data.icalres);
      setCounts(response.data.counts || {});
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
      setLoading(false);
    }
  };

 // Actualiser les données à chaque fois que l'écran devient actif
 useFocusEffect(
  React.useCallback(() => {
    fetchReservationsAndIcalres();
  }, [])
);

  if (loading) {
    return <ActivityIndicator size="" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  const getStatusStyle = (statut, count) => {
    switch (statut) {
      case 'en attente':
        return {
          color: 'rgb(255, 139, 60)',
          borderColor: 'rgb(255, 139, 60)',
          text: (count == null || count === 0) ? 'En attente de réservation' : 'En attente de réponse'
        };
      case 'confirmer':
        return {
          color: 'rgb(7, 84, 201)',
          borderColor: 'rgb(7, 84, 201)',
          text: 'Confirmée'
        };
      case 'Annuler':
        return {
          color: 'rgb(255, 28, 63)',
          borderColor: 'rgb(255, 28, 63)',
          text: 'Annulée'
        };
      case 'payer':
        return {
          color: 'rgb(60, 196, 39)',
          borderColor: 'rgb(60, 196, 39)',
          text: 'Payée'
        };
      default:
        return {
          color: 'rgb(255, 139, 60)',
          borderColor: 'rgb(255, 139, 60)',
          text: 'En attente'
        };
    }
  };

  const renderIcalCard = (ical) => (
    <View key={ical.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{ical.logement}</Text>
        <TouchableOpacity 
            style={styles.modifyButton} 
            onPress={() => navigation.navigate('UpdateIcale', { icalresId: ical.id })}
            >
            <Text style={styles.modifyButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
      style={styles.publishButton}
      onPress={() => handlePublish(ical.id)}
      disabled={!!publishing} 
    >
      <Text style={styles.publishButtonText}>
        {loading ? 'Publication...' : 'Publier'}
      </Text>
    </TouchableOpacity>
      <View style={styles.cardBody}>
        <View style={styles.borderedItem}>
          <Text style={styles.label}>Départ</Text>
          <Text style={styles.value}>{ical.end}</Text>
        </View>
        <View style={styles.borderedItem}>
          <Text style={styles.label}>Heure</Text>
          <Text style={styles.value}>{ical.nbrHeure}</Text>
        </View>
        <View style={styles.borderedItem}>
          <Text style={styles.label}>Durée</Text>
          <Text style={styles.value}>{ical.nbrHeure}min</Text>
        </View>
        <View style={styles.borderedItem}>
          <Text style={styles.label}>Montant</Text>
          <Text style={styles.value}>{ical.prix}€</Text>
        </View>
      </View>
    </View>
  );

  const renderReservationCard = (reservation) => {
    const statusStyle = getStatusStyle(reservation.statut, counts[reservation.id]);
    return (
      <View key={reservation.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{reservation.logement}</Text>
          <TouchableOpacity 
          style={[
            styles.statusButton, 
            { borderColor: statusStyle.borderColor }
          ]}
        >
          <Text style={[styles.statusButtonText, { color: statusStyle.color }]}>
            {statusStyle.text}
          </Text>
        </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.borderedItem}>
            <Text style={styles.label}>Date & Heure</Text>
            <Text style={styles.value}>{reservation.date} | {reservation.heure}</Text>
          </View>
          <View style={styles.borderedItem}>
            <Text style={styles.label}>Nbre d'heures</Text>
            <Text style={styles.value}>{reservation.nbrHeure}min</Text>
          </View>
          <View style={styles.borderedItem}>
            <Text style={styles.label}>Agents intéressés</Text>
            <Text style={styles.value}>{counts[reservation.id] || '0'}</Text>
          </View>
          <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('DetailsReservationHote', { reservationId: reservation.id })} // Naviguer vers la page des détails avec l'ID
      >
        <Text style={styles.detailsButtonText}>Voir Détails</Text>
      </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Réservations iCalres</Text>
        {icalres.length === 0 ? (
          <Text style={styles.emptyMessage}>Aucun événement iCalres disponible.</Text>
        ) : (
          icalres.map(renderIcalCard)
        )}

        <Text style={styles.sectionTitle}>Mes réservations</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('AddReservation')}
        >
          <Text style={styles.buttonText}>Ajouter une réservation</Text>
        </TouchableOpacity>
        {reservations.length === 0 ? (
          <Text style={styles.emptyMessage}>Aucune réservation disponible.</Text>
        ) : (
          reservations.map(renderReservationCard)
        )}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modifyButton: {
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff385c',
  },
  modifyButtonText: {
    color: '#ff385c',
    fontSize: 14,
  },
  publishButton: {
    backgroundColor: '#ff385c',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  publishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusButton: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 14,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
  },
  borderedItem: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReservationAndIcalres;