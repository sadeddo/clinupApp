import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Modal, TextInput, Button,Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from './Header';
import { Video } from 'expo-av'; 
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import Footer from './Footer';

const DetailsReservationPresta = ({ route }) => {
  const { reservationId } = route.params; 
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [invitExists, setInvitExists] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); 
  const [isInvitationModalVisible, setInvitationModalVisible] = useState(false);
  const [comment, setComment] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const navigation = useNavigation();

    const fetchReservationDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('Token non trouvé');
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/prestataire/${reservationId}/reservation`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservation(response.data);
        setHasApplied(response.data.hasApplied);
        setInvitExists(response.data.invitExists);
        if (response.data.video) {
          setVideoUrl(`http://127.0.0.1:8000/uploads/videos/${response.data.video.filePath}`);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de réservation:', error);
        setLoading(false);
      }
    };

    useEffect(() => {
        fetchReservationDetails();
      }, [reservationId]);

  // Fonction pour gérer la postulation avec commentaire
  const handlePostuler = async () => {
    setIsSubmitting(true); // Déclencher le chargement
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/prestataire/${reservationId}/postuler`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 201) {
        Alert.alert('Succès', 'Votre candidature a été envoyée avec succès !');
        setHasApplied(true);
        setModalVisible(false); // Fermer la modal après envoi
        await fetchReservationDetails(); 
      } else {
        console.warn('Réponse inattendue:', response);
        Alert.alert('Erreur', "Une réponse inattendue a été reçue.");
      }
    } catch (error) {
      console.error('Erreur lors de la postulation:', error.response ? error.response.data : error);
      Alert.alert('Erreur', error.response ? error.response.data.message : "Une erreur s'est produite lors de la postulation.");
    } finally {
      setIsSubmitting(false); // Désactiver le chargement
    }
  };

  // Fonction pour afficher la modal de postulation
  const openPostulerModal = () => {
    setModalVisible(true);
  };

  const openInvitationModal = () => {
    setInvitationModalVisible(true);
  };
  // Function for invited application
  const handlePostulerInvit = async () => {
    if (!availability) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre disponibilité.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/prestataire/${reservationId}/postuler/invit`,
        { comment, availability },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
      );
      console.log(response,comment );
      Alert.alert('Succès', 'Votre réponse à l\'invitation a été envoyée avec succès !');
      setHasApplied(true);
      setInvitationModalVisible(false);  // Close modal on success
      await fetchReservationDetails(); 
    } catch (error) {
      console.error('Error submitting invitation response:', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la réponse à l'invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleVideoUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
    });

    // Check if selection was canceled or if assets array is empty
    if (result.canceled || !result.assets || result.assets.length === 0) {
        console.warn('No video selected or selection canceled');
        return;
    }

    const selectedVideo = result.assets[0];
    const uriParts = selectedVideo.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const type = fileType === 'mov' ? 'video/quicktime' : 'video/mp4';

    const formData = new FormData();
    formData.append('filePath', {
        uri: selectedVideo.uri,
        type: type,
        name: `video-${Date.now()}.${fileType}`, // Ensure a unique name with the correct extension
    });

    const token = await AsyncStorage.getItem('token');
    try {
        const uploadResponse = await axios.post(
            `http://127.0.0.1:8000/api/prestataire/${reservationId}/video`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (uploadResponse.status === 200) {
            setVideoUrl(`http://127.0.0.1:8000/uploads/videos/${uploadResponse.data.filePath}`);
            alert('Video uploaded successfully!');
        }
    } catch (error) {
        console.error('Error uploading video:', error);
        alert('Error uploading video');
    }
};


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="" color="#ff385c" />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Impossible de charger les détails de la réservation</Text>
      </View>
    );
  }

  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'en attente':
        return { color: 'rgb(255, 139, 60)', text: 'En attente' };
      case 'confirmer':
        return { color: 'rgb(7, 84, 201)', text: 'Confirmée' };
      case 'Annuler':
        return { color: 'rgb(255, 28, 63)', text: 'Annulée' };
      case 'payer':
        return { color: 'rgb(60, 196, 39)', text: 'Payée' };
      default:
        return { color: 'rgb(255, 139, 60)', text: 'En attente' };
    }
  };

  const statusStyle = getStatusStyle(reservation.statut);
  const deleteImage = async (imgId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/prestataire/image/${imgId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Image supprimée avec succès!');
      setReservation((prev) => ({
        ...prev,
        tasks: prev.tasks.map(task => ({
          ...task,
          imgTasks: task.imgTasks.filter(img => img.id !== imgId),
        })),
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      alert('Erreur lors de la suppression de l\'image');
    }
  };
   // Function to add an image
   const addImage = async (task) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const selectedImage = result.assets[0];
    const formData = new FormData();
    formData.append('filePath', {
      uri: selectedImage.uri,
      type: 'image/jpeg', // Adjust type if necessary
      name: `image-${Date.now()}.jpg`,
    });

    const token = await AsyncStorage.getItem('token');
    try {
      const uploadResponse = await axios.post(
        `http://127.0.0.1:8000/api/prestataire/task/${task.id}/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (uploadResponse.status === 201) {
        alert('Image ajoutée avec succès');
        navigation.replace('DetailsReservationPresta', { reservationId });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'ajout de l\'image');
    }
  };
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
                    <View key={imgTask.id} style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: `http://127.0.0.1:8000/task/${imgTask.filePath}` }}
                        style={styles.taskImage}
                      />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteImage(imgTask.id)}
                      >
                        <MaterialIcons name="close" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.noTaskImageContainer}>
                    <MaterialIcons name="image" size={40} color="#ccc" />
                    <Text style={styles.noTaskImageText}>Aucune image ajoutée</Text>
                  </View>
                )}
              </View>
              {/* Button to add an image */}
                <TouchableOpacity style={styles.addButton}  onPress={() => addImage(task)}>
                    <Text style={styles.addButtonText}>Ajouter une image</Text>
                </TouchableOpacity>
            </View>
          )}
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
       {/* Bouton "Postuler" basé sur les conditions */}
       {!hasApplied && reservation.statut === 'en attente' && (
          <View style={styles.buttonContainer}>
            {invitExists ? (
              <TouchableOpacity style={styles.applyButton} onPress={openInvitationModal}>
                <Text style={styles.applyButtonText}>Postuler par Invitation</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.applyButton} onPress={openPostulerModal}>
                <Text style={styles.applyButtonText}>Postuler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Modal for entering comment and availability */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isInvitationModalVisible}
          onRequestClose={() => setInvitationModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Répondre à l'invitation</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Entrez votre commentaire ici"
                value={comment}
                onChangeText={setComment}
                multiline
              />

              <Text style={styles.availabilityText}>Êtes-vous disponible ?</Text>
              <View style={styles.availabilityOptions}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    availability === 'available' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setAvailability('available')}
                >
                  <Text style={styles.optionText}>Je suis disponible</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    availability === 'not_available' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setAvailability('not_available')}
                >
                  <Text style={styles.optionText}>Je ne suis pas disponible</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonContainer}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ff385c" />
                ) : (
                  <Button title="Envoyer" onPress={handlePostulerInvit} />
                )}
                <Button title="Annuler" color="red" onPress={() => setInvitationModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>


        {/* Modal pour entrer un commentaire lors de la postulation */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
            >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Entrer un commentaire pour votre candidature</Text>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Entrez votre commentaire ici"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />
                <View style={styles.modalButtonContainer}>
                    {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ff385c" />
                    ) : (
                    <Button title="Envoyer" onPress={handlePostuler} />
                    )}
                    <Button title="Annuler" color="red" onPress={() => setModalVisible(false)} />
                </View>
                </View>
            </View>
            </Modal>

        <Text style={styles.title}>Détails de réservation</Text>

        <View style={styles.reservationCard}>
          <Text style={styles.logementName}>{reservation.logement.name}</Text>
          <View style={[styles.statusBadge, { borderColor: statusStyle.color }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              ● {statusStyle.text}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Date & Heure</Text>
            <Text style={styles.infoText}>{reservation.date} | {reservation.heure}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nombre d'heures</Text>
            <Text style={styles.infoText}>{reservation.nbrHeure}min</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Montant</Text>
            <Text style={styles.infoText}>{reservation.prix}€</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoText}>{reservation.description}</Text>
          </View>
        </View>
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
            {task.image ? (
              <Image 
                source={{ uri: `http://127.0.0.1:8000/taskHote/${task.image}` }} 
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

        {/* Result Section */}
        {reservation.statut === 'confirmer' && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Résultat de la prestation complète</Text>
            {videoUrl ? (
              <Video
              source={{ uri: videoUrl }}
              style={{ width: 345, height: 200 }}
              useNativeControls
              shouldPlay
              resizeMode="contain"
              isLooping
              onError={(error) => console.error("Video Error:", error)}
            />
            ) : (
              <TouchableOpacity style={styles.uploadContainer} onPress={handleVideoUpload}>
                <Image source={require('../../public/assets/images/image-gallery.png')} style={styles.placeholderImage} />
                <Text style={styles.uploadText}>Merci d'insérer une vidéo complète du logement une fois la prestation terminée</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Si confirmé, demander confirmation de l'entretien */}
       {reservation.statut === 'confirmer' && (
       <View style={styles.section}>
       <Text style={styles.sectionTitle}>Résultats</Text>
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
       </View>
    )}

          {/* Section Hôte */}
          <Text style={styles.sectionTitle}>Hôte</Text>
        <View style={styles.hostCard}>
          <View style={styles.hostInfo}>
            <Image
                source={{ uri: `http://127.0.0.1:8000/img/${reservation.logement.hote.picture}` }}
                style={styles.avatar}
                onError={() => console.error("Erreur de chargement de l'image")}
            />
            <View style={styles.hostDetails}>
              <Text style={styles.hostName}>{reservation.logement.hote.firstname} {reservation.logement.hote.lastname}</Text>
              <Text style={styles.hostRole}>Hôte</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Envoyer un message</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
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
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logementName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
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
  resultContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  uploadContainer: { 
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  placeholderImage: { 
    width: 60, 
    height: 60, 
    marginBottom: 10 
  },
  uploadText: { 
    color: '#ff385c', 
    textAlign: 'center', 
    fontSize: 14 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  hostCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  hostDetails: {
    alignItems: 'flex-start',
  },
  hostName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hostRole: {
    fontSize: 14,
    color: '#757575',
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ff385c',
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#ff385c',
    fontWeight: 'bold',
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
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 2,
  },
  buttonContainer: { marginVertical: 20, alignItems: 'center' },
  applyButton: { backgroundColor: '#ff385c', padding: 10, borderRadius: 8 },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentInput: {
    height: 100,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default DetailsReservationPresta;
