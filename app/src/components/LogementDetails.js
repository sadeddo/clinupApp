import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { useNavigation, useRoute } from '@react-navigation/native';

const LogementDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { logementId } = route.params;

  const [logement, setLogement] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération des détails du logement et des tâches associées
  useEffect(() => {
    const fetchLogementDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('Token non trouvé');
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/logements/${logementId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogement(response.data.logement);
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données : ', error);
        setLoading(false);
      }
    };

    fetchLogementDetails();
  }, [logementId]);
  // Fonction pour supprimer une tâche
  const deleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/tache/${taskId}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Succès', 'Tâche supprimée avec succès');
      setTasks(tasks.filter(task => task.id !== taskId)); // Supprimer la tâche de l'état local
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche : ', error);
      Alert.alert('Erreur', 'Impossible de supprimer la tâche');
    }
  };

  // Confirmation avant la suppression
  const confirmDeleteTask = (taskId) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', onPress: () => deleteTask(taskId) },
      ],
      { cancelable: true }
    );
  };
  const handleAddTask = (logementId) => {
    navigation.navigate('AddTask', { logementId });
  }
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="" color="#ff385c" />
      </View>
    );
  }

  if (!logement) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Logement non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Détails du logement */}
        <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={
              logement.img
                ? { uri: `http://127.0.0.1:8000/log/${logement.img}` } // Image réelle du logement
                : require('../../public/assets/images/logement.png') // Image par défaut
            }
            style={logement.img ? styles.imageLogement : styles.placeholderImage} // Style conditionnel
          />
        </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{logement.nom}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.iconText}>🛏️ {logement.nbrChambre}</Text>
              <Text>| </Text>
              <Text style={styles.iconText}>🛁 {logement.nbrBain}</Text>
            </View>
            <Text style={styles.addressText}>📍 {logement.adresse}, {logement.completAdresse}</Text>
            <Text style={styles.addressText}> Accès au logement: {logement.acces}</Text>
            <Text style={styles.addressText}> Description: {logement.description}</Text>
          </View>
        </View>

        {/* Tâches associées au logement */}
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Tâches de ce logement</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddTask(logement.id)}>
              <MaterialIcons name="add" size={20} color="#ff385c" />
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.noTaskContainer}>
              <Image
                source={require('../../public/assets/images/list.png')} // Ajoute l'image indiquant aucune tâche
                style={styles.noTaskImage}
              />
              <Text style={styles.noTaskTitle}>Aucune tâche </Text>
              <Text style={styles.noTaskDescription}>
                Vous pouvez toujours ajouter des tâches pour ce logement
              </Text>
              <TouchableOpacity style={styles.addTaskButton} onPress={() => handleAddTask(logement.id)}>
                <Text style={styles.addTaskButtonText}>Ajouter une tâche</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.nom}</Text>
                  <View style={styles.taskActions}>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteTask(task.id)}>
                      <MaterialIcons name="delete" size={20} color="#ff385c" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.taskDescription}>{task.detail}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                {/* Affichage de l'image */}
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
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContainer: {
      padding: 20,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: 20,
      padding: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 15,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      width: '100%',
      height: 200,
    },
    imageLogement: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      resizeMode: 'cover', // Couvre tout l'espace pour l'image réelle
    },
    placeholderImage: {
      width: 100, // Taille plus petite pour l'image par défaut
      height: 100,
      borderRadius: 10,
      resizeMode: 'contain', // Centré pour l'image par défaut
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: '#f5f5f5',
    },
    infoContainer: {
      width: '100%',
      paddingHorizontal: 10,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 20,
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
      marginRight: 10,
    },
    addressText: {
      fontSize: 14,
      color: '#757575',
    },
    detailButton: {
      backgroundColor: '#f0f0f0',
      borderRadius: 25,
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    buttonText: {
      color: '#333',
      fontSize: 16,
      fontWeight: 'bold',
    },
    tasksContainer: {
      marginTop: 20,
    },
    tasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    tasksTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    addButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ff385c',
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
      fontSize: 14,
      fontWeight: 'bold',
    },
    taskActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButton: {
      marginRight: 10,
    },
    deleteButton: {
      marginLeft: 10,
    },
    taskDescription: {
      fontSize: 14,
      color: '#757575',
    },
    // Styles pour l'affichage "Aucune tâche"
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
  addTaskButton: {
    backgroundColor: '#ff385c',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    height: 110,
    backgroundColor: '#f5f5f5',
  },
  taskImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover', // Pour remplir l'espace pour l'image réelle
  },
  noTaskImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
   
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
  });
  

export default LogementDetails;