import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PrestataireProfileScreen = ({ route }) => {
  const { idPresta, idReservation } = route.params;
  const [profileData, setProfileData] = useState(null);
  const navigation = useNavigation(); 

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }
      const response = await axios.get(`http://127.0.0.1:8000/api/prestaProfile/${idPresta}/${idReservation}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [idPresta, idReservation]);

  // Utiliser useFocusEffect pour rafraîchir les commentaires lors du retour sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData(); // Actualise les données du profil
    }, [])
  );

  if (!profileData) return <Text>Chargement...</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderHote />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Profil d'agent : {profileData.prestataire.firstname} {profileData.prestataire.lastname}</Text>
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            {profileData.prestataire.picture ? (
              <Image
                source={{ uri: `http://127.0.0.1:8000/img/${profileData.prestataire.picture}` }}
                style={styles.profileImage}
              />
            ) : (
              <Icon name="account-circle" size={80} color="#000" />
            )}
            <View>
              <Text style={styles.name}>
                {profileData.prestataire.firstname} {profileData.prestataire.lastname}
                <Icon name="verified" size={20} color="#4285F4" />
              </Text>
              <Text style={styles.rating}>{'⭐'.repeat(profileData.average)}</Text>
            </View>
            {profileData.demande.statut === 'en attente' && (
              <TouchableOpacity
                style={styles.actionButtons}
                onPress={() => navigation.navigate('PaymentScreen', { reservationId: profileData.demande.id, prestataireId: profileData.prestataire.id })}
              >
                <Text style={styles.buttonText}>Réserver</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expériences</Text>
            {profileData.prestataire.experiences && profileData.prestataire.experiences.length > 0 ? (
              profileData.prestataire.experiences.map((exp, index) => (
                <View key={index} style={styles.experience}>
                  <Text style={styles.experienceTitle}>{exp.experience}</Text>
                  <Text style={styles.experienceDate}>{exp.dtStart} à {exp.dtEnd}</Text>
                  <Text style={styles.experienceDescription}>{exp.description}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Aucune expérience enregistrée.</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.commentHeader}>
              <Text style={styles.sectionTitle}>Avis et commentaires</Text>
              {profileData.demande.statut === 'payer' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddCommentScreen', { prestataireId: profileData.prestataire.id, idDemande: idReservation, prestataireName: profileData.prestataire.lastname })}
                >
                  <Icon name="add-circle" size={24} color="#E91E63" />
                </TouchableOpacity>
              )}
            </View>
            {profileData.prestataire.comments && profileData.prestataire.comments.length > 0 ? (
              profileData.prestataire.comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    {comment.client.picture ? (
                      <Image
                        source={{ uri: `http://127.0.0.1:8000/img/${comment.client.picture}` }}
                        style={styles.userImage}
                      />
                    ) : (
                      <Icon name="account-circle" size={40} color="#000" style={styles.userImagePlaceholder} />
                    )}
                    <View style={styles.commentDetails}>
                      <Text style={styles.commentName}>
                        {comment.client.firstname} {comment.client.lastname}
                      </Text>
                      <Text style={styles.commentRating}>{'⭐'.repeat(comment.evaluation)}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Aucun commentaire enregistré.</Text>
            )}
          </View>
        </View>
      </ScrollView>
      <FooterHote />
    </View>
  );
};


const styles = StyleSheet.create({
    buttonText: {
        color: '#ff385c',
        fontSize: 14,
        fontWeight: 'bold',
      },
      actionButtons: {
        flexDirection: 'column', // Les boutons sont empilés verticalement
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Espace entre les boutons et le texte de l'agent
      },
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 18,
    color: '#FFD700',
  },
  section: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noDataText: {
    fontStyle: 'italic',
    color: '#666',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  experience: {
    marginBottom: 10,
  },
  experienceTitle: {
    fontWeight: 'bold',
  },
  experienceDate: {
    color: '#666',
  },
  comment: {
    marginBottom: 10,
  },
  commentName: {
    fontWeight: 'bold',
  },
  commentRating: {
    color: '#FFD700',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Cercle parfait
    marginRight: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  comment: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Cercle parfait pour l'image de profil
    marginRight: 10,
  },
  userImagePlaceholder: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  commentDetails: {
    flex: 1,
  },
  commentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentRating: {
    fontSize: 14,
    color: '#FFD700',
    marginVertical: 3,
  },
  commentText: {
    fontSize: 15,
    color: '#555',
  },
  noDataText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});

export default PrestataireProfileScreen;