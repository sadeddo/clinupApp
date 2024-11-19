import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import Footer from './Footer';
import { useRoute, useNavigation } from '@react-navigation/native';

const ReservationsPresta = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('Token non trouvé');
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/prestataire/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservations(response.data.reservations);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'en attente':
        return {
          color: 'rgb(255, 139, 60)',
          borderColor: 'rgb(255, 139, 60)',
          text: 'En attente'
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

  const renderReservation = ({ item }) => {
    const statusStyle = getStatusStyle(item.statut);

    return (
      <View style={styles.reservationCard}>
        <View style={styles.header}>
          <Text style={styles.logementName}>{item.logement.name}</Text>
          <View style={[styles.statusBadge, { borderColor: statusStyle.borderColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              ● {statusStyle.text}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Date & Heure</Text>
          <Text style={styles.infoText}>{item.date} | {item.heure}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Montant</Text>
          <Text style={styles.infoText}>{item.prix}€</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Hôte</Text>
          <Text style={styles.infoText}>{item.logement.hote}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DetailsReservationPresta', { reservationId: item.id })}>
          <Text style={styles.buttonText}>Voir plus</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="" color="#ff385c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Mes réservations</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContainer}
      />
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContainer: { flexGrow: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logementName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontWeight: 'bold',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff385c', // Bordure rouge
    borderRadius: 20,       // Coin arrondi pour simuler le design de l'image
  },
  buttonText: {
    color: 'black',       // Texte en rouge
    fontWeight: 'bold',
    fontSize: 16,           // Légèrement plus grand pour être visible
  },
});

export default ReservationsPresta;
