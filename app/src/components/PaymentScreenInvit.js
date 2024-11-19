import React, { useState, useEffect } from 'react';
import { Button, Alert, View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { useStripe } from '@stripe/stripe-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function PaymentScreenInvit() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { reservationId } = route.params;

  // Récupère les détails de la réservation
  const fetchReservationDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/reservation/${reservationId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservation(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la réservation:', error);
    }
  };

  // Récupère les paramètres nécessaires pour initier le paiement
  const fetchPaymentSheetParams = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/reservation/${reservationId}/checkout-session/invit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentIntent, ephemeralKey, customerId } = response.data;
      return { paymentIntent, ephemeralKey, customerId };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      Alert.alert('Erreur', 'Échec de la récupération des paramètres de paiement.');
    }
  };

  // Initialise le PaymentSheet de Stripe avec les paramètres
  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customerId } = await fetchPaymentSheetParams();
    if (!paymentIntent || !ephemeralKey || !customerId) {
      Alert.alert('Erreur', 'Paramètres de paiement manquants.');
      return;
    }

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Clinup',
      paymentIntentClientSecret: paymentIntent,
      customerId: customerId,
      customerEphemeralKeySecret: ephemeralKey,
      allowsDelayedPaymentMethods: true,
      returnURL: 'exp://192.168.0.17:8081/',
    });

    if (!error) {
      setLoading(true);
    }
  };

  // Ouvre le PaymentSheet pour l'utilisateur
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Erreur de paiement: ${error.code}`, error.message);
    } else {
      Alert.alert('Succès', 'Votre paiement est en cours de traitement...');
      verifyPaymentStatus();  // Vérifie le statut du paiement après succès
    }
  };

  // Vérifie le statut du paiement avec le backend
  const verifyPaymentStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/reservation/check-payment-status_invit',
        { reservationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'succeeded') {
        Alert.alert('Succès', 'Votre paiement a été confirmé !');
        // Redirection vers les détails de la réservation après le succès du paiement
        navigation.navigate('DetailsReservationHote', { reservationId });
      } else if (response.data.status === 'failed') {
        Alert.alert('Échec', 'Le paiement a échoué. Veuillez réessayer.');
      } else {
        Alert.alert('Info', 'Paiement en attente de confirmation.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      Alert.alert('Erreur', 'Échec de la vérification du paiement.');
    }
  };

  useEffect(() => {
    initializePaymentSheet();
    fetchReservationDetails();
  }, []);

  if (!reservation) {
    return (
      <View>
        <HeaderHote />
        <Text>Chargement des détails de la réservation...</Text>
        <FooterHote />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Détails de la réservation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date de la réservation:</Text>
            <Text style={styles.value}>{reservation.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prestation</Text>
            <Text style={styles.value}>{reservation.prix} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Frais stripe:</Text>
            <Text style={styles.value}>{reservation.frais} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant total:</Text>
            <Text style={styles.value}>{reservation.prixTotal} €</Text>
          </View>
          <TouchableOpacity style={styles.paymentButton} onPress={openPaymentSheet} disabled={!loading}>
            <Button disabled={!loading} title="Payer" onPress={openPaymentSheet} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FooterHote />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  detailsContainer: { padding: 20, backgroundColor: '#f5f5f5', borderRadius: 10, elevation: 2, marginHorizontal: 20, marginVertical: 30 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  label: { fontSize: 16, color: '#555' },
  value: { fontSize: 16, fontWeight: 'bold' },
  paymentButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
