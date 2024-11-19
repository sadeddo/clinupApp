import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import HeaderHote from './HeaderHote';
import Footer from './FooterHote';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';

const Logements = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation(); 
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const fetchLogements = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Token non trouvé');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/logements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogements(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des logements', error);
      setError('Erreur lors de la récupération des logements');
      setLoading(false);
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/subscription/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptionStatus(response.data.status);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogements();
      checkSubscriptionStatus();
    }, [fetchLogements, checkSubscriptionStatus])
  );

  const handleAddLogement = async () => {
    if (subscriptionStatus === 'subscription_needed') {
      Alert.alert(
        "Abonnement nécessaire",
        "Vous devez souscrire à un abonnement pour ajouter un deuxième logement.",
        [{ text: "S'abonner", onPress: () => startSubscription() }]
      );
    } else if (subscriptionStatus === 'upgrade_needed') {
      Alert.alert(
        "Mise à niveau nécessaire",
        "Vous devez passer à un abonnement supérieur pour ajouter plus de logements.",
        [{ text: "Mettre à niveau", onPress: () => startSubscription() }]
      );
    } else {
      navigation.navigate('AddLogement');
    }
  };

  const startSubscription = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/subscription/checkout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentIntent, ephemeralKey, customerId } = response.data;

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customerId,
        merchantDisplayName: 'Clinup',
        allowsDelayedPaymentMethods: true,
      });

      if (!error) {
        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          Alert.alert(`Erreur de paiement: ${paymentError.code}`, paymentError.message);
        } else {
          Alert.alert("Succès", "Votre abonnement a été activé.");
          checkSubscriptionStatus();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session de paiement", error);
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleEditLogement = (logementId) => {
    navigation.navigate('UpdateLogement', { logementId });
  };
  const handleDetailLogement = (logementId) => {
    navigation.navigate('LogementDetails', { logementId });
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
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.titre}>Mes logements</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddLogement}>
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

        {logements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../../public/assets/images/reserEmp.png')} style={styles.image} />
            <Text style={styles.noLogementText}>Aucun logement ajouté</Text>
            <Text style={styles.description}>Ajoutez des logements pour commencer.</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddLogement}>
              <Text style={styles.addButtonText}>Ajouter mes logements</Text>
            </TouchableOpacity>
          </View>
        ) : (
          logements.map((logement) => (
            <View key={logement.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <Image
                  source={logement.img ? { uri: `http://127.0.0.1:8000/log/${logement.img}` } : require('../../public/assets/images/logement.png')}
                  style={logement.img ? styles.imageLog : styles.placeholderImage}
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{logement.nom}</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.iconText}>🛏️ {logement.nbrChambre}</Text>
                  <Text>| </Text>
                  <Text style={styles.iconText}>🛁 {logement.nbrBain}</Text>
                </View>
                <Text style={styles.addressText}>📍 {logement.adresse}</Text>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleEditLogement(logement.id)}>
                    <MaterialIcons name="edit" size={24} color="#757575" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailButton} onPress={() => handleDetailLogement(logement.id)}>
                    <Text style={styles.buttonText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 253, 255, 1)',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
},
addButton: {
    backgroundColor: '#ff385c',
    width: 35,      // Taille ajustée pour être plus petite
    height: 35,     // Taille ajustée pour être plus petite
    borderRadius: 17.5,  // Doit être la moitié de la taille pour rendre le bouton rond
    justifyContent: 'center',
    alignItems: 'center',
},
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Figtree',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  noLogementText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 10,
    padding: 15,
    width: '90%',
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageLog: {
    width: '100%',       
    height: '100%',        // Prend toute la hauteur du conteneur
    borderRadius: 10,
    resizeMode: 'cover',   // Recouvre tout l'espace, coupant si nécessaire
  },
  placeholderImage: {
    width: 90,            // Dimensions spécifiques pour l'image par défaut
    height: 90,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 16,
    marginRight: 15,
  },
  addressText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row', // Aligner les boutons côte à côte
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25, // Pour rendre le bouton circulaire
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Espacement entre les deux boutons
  },
  detailButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Logements;
