import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import queryString from 'query-string';

const PaymentPage = () => {
  const [statutStripe, setStatutStripe] = useState(null); // Stocke le statut de Stripe (0 ou 1)
  const [loading, setLoading] = useState(true); // Pour afficher un indicateur de chargement
  const [apiMessage, setApiMessage] = useState(''); // Stocke le message de l'API, si nécessaire

  // Appel API pour récupérer le statut de Stripe
  useEffect(() => {
    const fetchStripeStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Récupérer le token de l'utilisateur
        const response = await axios.get('http://127.0.0.1:8000/api/stripe/status', {
          headers: {
            Authorization: `Bearer ${token}`, // Envoyer le token dans les headers pour l'authentification
          },
        });
        setStatutStripe(response.data.statutStripe); // Mettre à jour l'état avec le statut Stripe
        setLoading(false); // Fin du chargement
      } catch (error) {
        console.error('Erreur lors de la récupération du statut Stripe:', error);
        setLoading(false); // Fin du chargement même en cas d'erreur
      }
    };

    fetchStripeStatus();
  }, []);

  // Gérer le deep linking pour la redirection après Stripe
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('URL reçue : ', url);

      // Extraire le paramètre "status" de l'URL
      const parsedUrl = queryString.parseUrl(url);
      const { status } = parsedUrl.query;
      if (status === 'success') {
        Alert.alert('Succès', 'Votre compte de paiement Stripe a été configuré avec succès !');
        setStatutStripe(true); // Met à jour le statut Stripe dans l'interface
      } else if (status === 'refresh') {
        Alert.alert('Erreur', 'Échec de la configuration du compte Stripe.');
      }
    };

    // Écoute les liens entrants via deep linking
    const linkingListener = Linking.addEventListener('url', handleDeepLink);

    // Vérifie si l'application est ouverte avec un lien profond au démarrage
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      // Nettoyer l'événement lorsqu'on quitte la page
      linkingListener.remove();
    };
  }, []);

  const handleStripeClick = async () => {
    if (statutStripe === false) {
      // Appel à l'API pour obtenir le lien d'onboarding Stripe
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.post('http://127.0.0.1:8000/api/stripe/link', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { url } = response.data;

        // Rediriger l'utilisateur vers l'URL d'onboarding Stripe
        Linking.openURL(url);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer le lien d\'onboarding Stripe.');
        console.error('Erreur lors de la récupération du lien Stripe:', error);
      }
    } else if (statutStripe === true) {
      // Rediriger vers le dashboard Stripe
      Linking.openURL('https://dashboard.stripe.com/login');
    }
  };

  // Si l'application est en train de charger, afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Scroll uniquement sur le contenu principal */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.paymentContent}>
          <Text style={styles.title}>Paiements</Text>
          <View style={styles.paymentInfoCard}>
            <View style={styles.iconContainer}>
              <Image source={require('../../public/assets/images/stripe.png')} style={styles.icon} />
            </View>
            <View style={styles.paymentDetails}>
              {statutStripe === false ? (
                <>
                  <Text style={styles.subTitle}>Configuration d'un compte de paiement</Text>
                  <Text style={styles.description}>
                    Nous ne conservons aucune information relative à votre compte bancaire. Pour la gestion et le traitement sécurisés de tous les paiements, nous faisons confiance à Stripe, leader mondial dans le domaine des solutions de paiement sécurisées.
                  </Text>
                  <Text style={styles.description}>
                    Une fois que le hôte valide votre prestation, le paiement de votre client(e) sera transféré sur votre compte dans un délai d'environ 2 à 3 jours ouvrables.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.subTitle}>Compte de Paiement Configuré</Text>
                  <Text style={styles.description}>
                    Votre compte de paiement Stripe est maintenant configuré et opérationnel. Vous pouvez gérer vos informations de paiement et consulter vos transactions en toute sécurité grâce à Stripe.
                  </Text>
                  <Text style={styles.description}>
                    Lorsque vos prestations seront validées par les hôtes, les paiements de vos clients seront traités et transférés sur votre compte Stripe. Ces fonds seront disponibles dans un délai d'environ 2 à 3 jours ouvrables après chaque transaction réussie.
                  </Text>
                  <Text style={styles.description}>N'hésitez pas à consulter votre tableau de bord Stripe pour des détails supplémentaires.</Text>
                </>
              )}
            </View>

            {apiMessage ? <Text style={styles.errorMessage}>{apiMessage}</Text> : null}

            <TouchableOpacity style={styles.stripeButton} onPress={handleStripeClick}>
              <Text style={styles.stripeButtonText}>
                {statutStripe === false ? 'Commencer' : 'Ouvrir Stripe'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  paymentContent: {
    padding: 10,
  },
  paymentInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  stripeButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 25,
    textAlign: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  stripeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentPage;
