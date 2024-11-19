import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Importer Axios
import Header from './Header';
import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotifPresta = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Fonction pour récupérer les notifications avec Axios
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('Token non trouvé');
          return;
        }
        const response = await axios.get('http://127.0.0.1:8000/api/notifs', {
          headers: {
            Authorization: `Bearer ${token}`, // Ajout du token dans l'en-tête
          },
        });

        setNotifications(response.data.notifications); // Stocke les notifications dans l'état
      } catch (error) {
        console.error('Erreur lors du chargement des notifications :', error);
        Alert.alert('Erreur', 'Impossible de récupérer les notifications. Vérifiez votre connexion ou votre token.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.notificationContainer, !item.isRead ? styles.unreadNotification : null]}
        
      >
        <View style={styles.iconContainer}>
          <Icon name="notifications-outline" size={24} color="#555" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.contentText}>{item.content}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60)); // Différence en heures

    if (diff < 24) {
      return `Il y a ${diff} heures`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff6f61',
  },
  iconContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 50,
    padding: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default NotifPresta;
