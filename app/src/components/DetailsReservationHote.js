import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import HeaderHote from './HeaderHote';
import { MaterialIcons } from '@expo/vector-icons';
import FooterHote from './FooterHote';
import Collapsible from 'react-native-collapsible';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ReservationDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reservationId } = route.params; // Récupérer l'id de la réservation depuis les paramètres de navigation

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour charger les détails de la réservation
  const fetchReservationDetails = async () => {
    setLoading(true);
    setError('');
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      setError('Token manquant.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/reservation/${reservationId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReservation(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationDetails();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReservationDetails();
    });

    // Nettoyage pour éviter la fuite de mémoire
    return unsubscribe;
  }, [navigation, reservationId]);

  if (loading) {
    return <ActivityIndicator size="" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }
  const handleButtonPress = () => {
    if (reservation.intent === 'invit') {
      // Navigate to the PaymentScreen with the necessary parameters
      navigation.navigate('PaymentScreenInvit', {
        reservationId: reservation.id,
      });
    } else {
      // Call handleValidateReservation if intent is not 'invite'
      handleValidateReservation();
    }
  };
  // Fonction pour valider la réservation
  const handleValidateReservation = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erreur', 'Token non trouvé');
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/reservation/${reservationId}/valider`,
        {},
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        Alert.alert('Succès', response.data.success);
        fetchReservationDetails(); // Actualiser les détails de la réservation
      } else {
        Alert.alert('Erreur', response.data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la validation de la réservation');
      console.error(error);
    }
  };
  // Fonction pour générer le PDF (si applicable)
  const handleGeneratePdf = async () => {
    try {
      const response = await axios({
        url: `http://127.0.0.1:8000/generate-receipt/${reservationId}`,
        method: 'GET',
        responseType: 'arraybuffer', // Important pour recevoir les données binaires
      });

      const fileName = `receipt_${reservationId}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(response.data), { encoding: FileSystem.EncodingType.Base64 });

      Alert.alert('Succès', `PDF sauvegardé à: ${fileUri}`);
      // Ici, vous pouvez ajouter du code pour ouvrir le PDF si nécessaire
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };
 // Fonction utilitaire pour convertir ArrayBuffer en Base64
 const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Fonction d'annulation de réservation
  const handleCancelReservation = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erreur', 'Token non trouvé');
      return;
    }

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/reservation/${reservation.id}/annuler-en-attente`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        Alert.alert('Succès', response.data.success);
        fetchReservationDetails(); // Actualiser les détails de la réservation
      } else {
        Alert.alert('Erreur', response.data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'annulation');
      console.error(error);
    }
  };

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
  const statusStyle = getStatusStyle(reservation.statut);
  // Accordion for displaying task details
  const TaskAccordion = ({ task }) => {
    const [isCollapsed, setCollapsed] = useState(true);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <View style={styles.accordionItem}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => setIsOpen(!isOpen)}>
          <Text style={styles.taskTitle}>{task.titre}</Text>
          <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={24} color="black" />
        </TouchableOpacity>
  
        {isOpen && (
          <View style={styles.accordionContent}>
            <Text style={styles.taskDescription}>{task.detail}</Text>
            <View style={styles.taskImageContainer}>
              {task.imgTasks.length > 0 ? (
                task.imgTasks.map(imgTask => (
                  <Image 
                    key={imgTask.id}
                    source={{ uri: `http://127.0.0.1:8000/task/${imgTask.filePath}` }}
                    style={styles.taskImage}
                  />
                ))
              ) : (
                <View style={styles.noTaskImageContainer}>
                  <MaterialIcons name="image" size={40} color="#ccc" />
                  <Text style={styles.noTaskImageText}>Aucune image ajoutée</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <HeaderHote />
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Générer le PDF si le statut est "payer" */}
      {reservation.statut === 'payer' && (
        <TouchableOpacity style={styles.button} onPress={handleGeneratePdf}>
          <Text style={styles.pdfButtonText}>Générer le PDF</Text>
        </TouchableOpacity>
      )}

      {/* Détails de réservation */}
      <Text style={styles.titre}>Détails de la réservation</Text>
      <View style={styles.card}>
      <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Logement: {reservation.logement}</Text>
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
            <Text style={styles.label}>Nombre d'heures</Text>
            <Text style={styles.value}>{reservation.nbrHeure}min</Text>
          </View>
          <View style={styles.borderedItem}>
            <Text style={styles.label}>Montant de la prestation</Text>
            <Text style={styles.value}>{reservation.prix}€</Text>
          </View>
          {(reservation.description != null) && (
          <View style={styles.borderedItem}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{reservation.description}</Text>
          </View>
          )}
        </View>
      </View>

      {/* Bouton Annuler la réservation si applicable */}
      {(reservation.statut === 'en attente') && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReservation}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
       {/* Si confirmé, demander confirmation de l'entretien */}
       {reservation.statut === 'confirmer' && (
       <View style={styles.section}>
       <Text style={styles.sectionTitle}>Résultats</Text>
    
       {/* Video section */}
       <View style={styles.section}>
            {reservation.video && reservation.video.filePath ? (
            <Video
                source={{ uri: `http://127.0.0.1:8000/uploads/videos/${reservation.video.filePath}` }}
                style={{ width: 345, height: 200 }}
                useNativeControls
                resizeMode="contain"
            />
            ) : (
            <Text style={{ textAlign: 'center', padding: 10 }}>Aucune vidéo n'était partagée</Text>
            )}
        </View>
       <View style={styles.card}>

         {/* Task Accordion */}
         {reservation.tasks.length > 0 ? (
           reservation.tasks.map(task => (
             <TaskAccordion key={task.id} task={task} />
           ))
         ) : (
           <View style={styles.noTaskContainer}>
             <Image
               source={require('../../public/assets/images/list.png')}
               style={styles.noTaskImage}
             />
             <Text style={styles.noTaskTitle}>Aucune tâche liée à ce logement</Text>
             <Text style={styles.noTaskDescription}>
               Vous pouvez ajouter des tâches pour ce logement
             </Text>
           </View>
         )}
       </View>

          <Text>L'agent a confirmé toutes les tâches. Êtes-vous satisfait ?</Text>
          <View style={styles.actionButtons}>

          <TouchableOpacity style={styles.profileButton} onPress={handleButtonPress}>
                <Text style={styles.buttonText}>Oui, j’approuve l’entretien</Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile', { id: reservation.prestataire.id })}
        >
          <Text style={styles.buttonText}>Je ne suis pas satisfait</Text>
        </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section Agent (si applicable) */}
{(reservation.statut === 'confirmer' || reservation.statut === 'payer') && reservation.prestataire && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Agent choisi</Text>
    
    {/* Container for the agent */}
    <View style={styles.agentContainer}>
      
      {/* Agent's avatar */}
      <Image
        source={{ uri: `http://127.0.0.1:8000/img/${reservation.prestataire.picture}` }}
        style={styles.avatar}
      />
      
      {/* Agent's name */}
      <Text style={styles.agentName}>{reservation.prestataire.firstname} {reservation.prestataire.lastname}</Text>
      
      {/* Action buttons */}
      <View style={styles.actionButtons}>
        
        {/* Button to view profile */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('PrestataireProfileScreen', { idPresta: reservation.prestataire.id , idReservation: reservation.id })}
        >
          <Text style={styles.buttonText}>Voir profil</Text>
        </TouchableOpacity>
        
        {/* Button to send a message */}
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate('Message', { id: reservation.prestataire.id })}
        >
          <Text style={styles.buttonText}>Envoyer un message</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}


    {/* Agents intéressés si en attente */}
{reservation.statut === 'en attente' && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Agents intéressés</Text>

    {/* Si aucun agent n'est intéressé */}
    {reservation.postulers.length === 0 ? (
      <Text>Aucun agent pour le moment</Text>
    ) : (
      reservation.postulers.map(postuler => (
        <View key={postuler.id} style={styles.agentContainer}>
          
          {/* Avatar de l'agent */}
          <Image
            source={{ uri: `http://127.0.0.1:8000/img/${postuler.picture}` }}
            style={styles.avatar}
          />
          
          {/* Détails de l'agent : nom et commentaire */}
          <View style={styles.agentDetails}>
            <Text style={styles.agentName}>
              {postuler.prestataire} {/* Nom complet de l'agent */}
            </Text>
            <Text style={styles.agentComment}>
              {postuler.comment} {/* Commentaire de l'agent */}
            </Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('PrestataireProfileScreen', { idPresta: postuler.id, idReservation: reservation.id })}
            >
              <Text style={styles.buttonText}>Voir profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => navigation.navigate('Message', { id: postuler.id })}
            >
              <Text style={styles.buttonText}>Envoyer un message</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))
    )}
  </View>
)}


      {/* Tâches liées au logement */}
<View style={styles.tasksContainer}>
    
  <Text style={styles.sectionTitle}>Tâches</Text>
  
  {reservation.tasks.length === 0 ? (
    <View style={styles.noTaskContainer}>
      <Image
        source={require('../../public/assets/images/list.png')} // Icône indiquant qu'il n'y a pas de tâche
        style={styles.noTaskImage}
      />
      <Text style={styles.noTaskTitle}>Aucune tâche liée à ce logement</Text>
      <Text style={styles.noTaskDescription}>
        Vous pouvez ajouter des tâches pour ce logement
      </Text>
    </View>
  ) : (
    reservation.tasks.map(task => (
      <View key={task.id} style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.titre}</Text>
        </View>
        
        {/* Description de la tâche */}
        <Text style={styles.taskDescription}>{task.detail}</Text>
        
        {/* Affichage de l'image de la tâche */}
        <View style={styles.taskImageContainer}>
          {task.img ? (
            <Image 
              source={{ uri: `http://127.0.0.1:8000/taskHote/${task.img}` }} 
              style={styles.taskImage} 
            />
          ) : (
            <View style={styles.noTaskImageContainer}>
              <MaterialIcons name="image" size={40} color="#ccc" />
              <Text style={styles.noTaskImageText}>Aucune image ajoutée</Text>
            </View>
          )}
        </View>
      </View>
    ))
  )}
</View>


     
     </ScrollView>
      <FooterHote />
    </View>
  );
};

const styles = StyleSheet.create({
    section: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e5e5',
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      agentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
      },
      agentName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,  // This makes the name take the available space between the image and the buttons
      },
      actionButtons: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      profileButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ff385c',
        marginBottom: 5,
        width: 150,
        alignItems: 'center',
      },
      messageButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ff385c',
        width: 150,
        alignItems: 'center',
      },
      buttonText: {
        color: '#ff385c',
        fontSize: 14,
        fontWeight: 'bold',
      },
    titre: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Figtree',
        marginBottom:13,
      },
    button: {
        backgroundColor: '#ff385c',
        paddingVertical: 10,
        paddingHorizontal: 20, // Ajuster selon la taille de texte désirée
        borderRadius: 25,
        alignSelf: 'flex-start', // Le bouton prendra uniquement la taille de son contenu
        marginBottom:13,
      },
      
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
      value: {
       FontFamily: 'Figtree',
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
      tasksContainer: {
        marginTop: 20,
      },
      taskCard: {
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
      taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      taskDescription: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 10,
      },
      taskImageContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      taskImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
      },
      noTaskContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 20,
      },
      noTaskImage: {
        width: 80,
        height: 80,
        marginBottom: 20,
      },
      noTaskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      noTaskDescription: {
        fontSize: 14,
        textAlign: 'center',
        color: '#757575',
        marginBottom: 20,
      },
      noTaskImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '100%',
        height: 70,
        backgroundColor: '#f5f5f5',
      },
      noTaskImageText: {
        color: '#757575',
        fontSize: 14,
        marginTop: 2,
      },
      accordionItem: {
        marginBottom: 10,
      },
      accordionHeader: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      accordionTitle: {
        fontSize: 16,
        fontWeight: '600',
      },
      accordionBody: {
        padding: 10,
      },
      taskImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
      },
      noImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
      },
      noImage: {
        width: 64,
        height: 64,
      },
      noImageText: {
        marginTop: 5,
        fontSize: 14,
        color: '#999',
      },
      noTaskContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      noTaskImage: {
        width: 64,
        height: 64,
        marginBottom: 10,
      },
      noTaskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      noTaskDescription: {
        fontSize: 14,
        textAlign: 'center',
        color: '#757575',
      },
      section: {
          padding: 10,
          marginVertical: 10,
          backgroundColor: '#fff',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#e5e5e5',
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
        },
        agentContainer: {
          flexDirection: 'row', // Aligne l'avatar et les informations sur la même ligne
          alignItems: 'center', // Aligne verticalement les éléments
          padding: 10,
          backgroundColor: '#f5f5f5',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#ddd',
          marginBottom: 10, // Ajoute un espacement entre les agents
        },
        avatar: {
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 15, // Espace entre l'avatar et les informations de l'agent
        },
        agentDetails: {
          flex: 1, // Prend l'espace restant entre l'avatar et les boutons
        },
        agentName: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        agentComment: {
          fontSize: 14,
          color: '#757575', // Couleur plus discrète pour le commentaire
          marginTop: 5,
        },
        actionButtons: {
          flexDirection: 'column', // Les boutons sont empilés verticalement
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 10, // Espace entre les boutons et le texte de l'agent
        },
        profileButton: {
          backgroundColor: '#fff',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#ff385c',
          marginBottom: 5,
          width: 150,
          alignItems: 'center',
        },
        messageButton: {
          backgroundColor: '#fff',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#ff385c',
          width: 150,
          alignItems: 'center',
        },
        buttonText: {
          color: '#ff385c',
          fontSize: 14,
          fontWeight: 'bold',
        },
});

export default ReservationDetails;
