import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import HeaderHote from './HeaderHote';  // Assurez-vous que vous avez le bon chemin pour Header
import FooterHote from './FooterHote';  // Assurez-vous que vous avez le bon chemin pour Footer
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Invit = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); 

  useEffect(() => {
    // Fonction pour récupérer les invitations depuis l'API
    const fetchInvites = async () => {
      try {
        const token = await AsyncStorage.getItem('token');  // Récupère le token JWT depuis AsyncStorage
        if (!token) {
          console.error('Token non trouvé');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/invit/all', {
          headers: {
            Authorization: `Bearer ${token}`,  // Ajoute le token dans les headers
          },
        });

        setInvites(response.data);  // Assurez-vous que le format de réponse correspond à votre structure d'invitation
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des invitations:', error);
        setLoading(false);
      }
    };

    fetchInvites();
  }, []);

  const handleInvitePress = () => {
    // Navigation vers l'écran pour inviter un agent d'entretien
    navigation.navigate('AddInvit');
  };

  const handleRelancePress = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await axios.post(`http://127.0.0.1:8000/api/invit/${id}/relance`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Succès', 'Invitation relancée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la relance de l\'invitation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la relance de l\'invitation.');
    }
  };

// Fonction pour supprimer une invitation
const handleSupprimerPress = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      await axios.delete(`http://127.0.0.1:8000/api/invit/${id}/supprimer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Mettre à jour la liste des invitations après la suppression
      setInvites(invites.filter(invite => invite.id !== id));
      Alert.alert('Succès', 'Invitation supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invitation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de l\'invitation.');
    }
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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mes prestataires</Text>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvitePress}>
            <Text style={styles.inviteButtonText}>Inviter</Text>
          </TouchableOpacity>
        </View>

        {invites.length > 0 ? (
          invites.map((invite) => (
            <View key={invite.id} style={styles.card}>
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{new Date(invite.date).toLocaleDateString()}</Text>
                  {invite.etat === 'en attente' ? (
                    <View style={styles.statusWaiting}>
                      <Text style={styles.statusText}>En attente</Text>
                    </View>
                  ) : invite.etat === 'accepter' ? (
                    <View style={styles.statusAccepted}>
                      <Text style={styles.statusText}>Acceptée</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.infoRow}>
                  <Text>Nom: {invite.nom}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text>Email: {invite.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text>Code d'invitation: {invite.code}</Text>
                </View>

                {invite.etat === 'en attente' && (
                 <TouchableOpacity style={styles.relanceButton} onPress={() => handleRelancePress(invite.id)}>
                 <Text style={styles.relanceButtonText}>Relancer</Text>
               </TouchableOpacity>
                )}
                {invite.etat === 'accepter' && (
                 <TouchableOpacity style={styles.relanceButton} onPress={() => handleSupprimerPress(invite.id)}>
                 <Text style={styles.relanceButtonText}>Supprimer</Text>
               </TouchableOpacity>
               
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Image
              source={require('../../public/assets/images/reserEmp.png')}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Vous n'avez pas encore invité votre équipe de prestataires.</Text>
            <Text style={styles.emptyDescription}>
              Pensez à inviter votre équipe de prestataires pour travailler ensemble et maintenir un suivi de vos travaux.
            </Text>

            <TouchableOpacity style={styles.inviteBigButton} onPress={handleInvitePress}>
              <Text style={styles.inviteBigButtonText}>Inviter mes agents d'entretien</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <FooterHote />
    </View>
  );
};

export default Invit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Styles pour les invitations existantes
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBody: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusWaiting: {
    backgroundColor: '#ffbb33',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAccepted: {
    backgroundColor: '#4caf50',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  infoRow: {
    marginBottom: 5,
  },
  relanceButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  relanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Styles pour l'état vide
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#757575',
    marginBottom: 20,
  },
  inviteBigButton: {
    backgroundColor: '#ff385c',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  inviteBigButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
