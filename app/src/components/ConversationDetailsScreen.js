import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import Header from './Header';
import Footer from './Footer';

const ConversationDetailsScreen = ({ route }) => {
  const { conversationId } = route.params;
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConversationDetails();
    fetchUserDetails();
    requestMediaLibraryPermission();
  }, [conversationId]);

  // Demander la permission d'accéder à la galerie
  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Désolé, nous avons besoin des permissions pour accéder à vos photos.');
      }
    }
  };

  const fetchConversationDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversation(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la conversation:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
    }
  };
// Fonction pour envoyer un message texte
const sendTextMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      // Ensure both conversation and user are loaded
    if (!conversation || !user) {
        console.error('Conversation or user data not available.');
        return;
      }
  
      // Determine recipient ID based on conversation participants
      const recipientId = conversation.participant1.id === user.id 
        ? conversation.participant2.id 
        : conversation.participant1.id;
  

        console.log(conversationId,recipientId,message);
      await axios.post('http://127.0.0.1:8000/api/conversations/messages/send', 
        {
          conversation_id: conversationId,
          recipient_id: recipientId,
          content: message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('');
      fetchConversationDetails(); // Actualiser la conversation
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setIsLoading(false);
    }
  };
  // Fonction pour sélectionner et envoyer une image
  const sendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const token = await AsyncStorage.getItem('token');
        const recipientId = conversation.participant1.id === user.id 
          ? conversation.participant2.id 
          : conversation.participant1.id;

        // Créer un FormData
        const formData = new FormData();
        formData.append('conversation_id', conversationId);
        formData.append('recipient_id', recipientId);
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
        console.log(formData);

        setIsLoading(true);
        await axios.post('http://127.0.0.1:8000/api/conversations/messages/send', 
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        fetchConversationDetails(); // Actualiser la conversation
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'image:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'image');
    } finally {
      setIsLoading(false);
    }
  };
  // Rendu du message en fonction de son type
  const renderMessage = (item) => {
    const isCurrentUserMessage = isCurrentUser(item.senderName);
    return (
      <View style={[styles.messageContainer, isCurrentUserMessage ? styles.sentMessage : styles.receivedMessage]}>
        {!isCurrentUserMessage && (
          <Image source={{ uri: `http://127.0.0.1:8000/img/${item.senderPicture}` }} style={styles.messageProfilePicture} />
        )}
        <View style={[styles.messageBubble, isCurrentUserMessage ? styles.sentBubble : styles.receivedBubble]}>
          {item.type === 'image' ? (
            <Image 
              source={{ uri: `http://127.0.0.1:8000/message/${item.content}` }} 
              style={styles.messageImage}
            />
          ) : (
            <Text style={styles.messageContent}>{item.content}</Text>
          )}
        </View>
        {isCurrentUserMessage && (
          <Image source={{ uri: `http://127.0.0.1:8000/img/${item.senderPicture}` }} style={styles.messageProfilePicture} />
        )}
      </View>
    );
  };
  if (!conversation || !user) {
    return (
      <View style={styles.container}>
        <Text>Chargement des détails de la conversation...</Text>
      </View>
    );
  }

  const isCurrentUser = (senderName) => {
    return senderName === `${user.firstname} ${user.lastname}`;
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        <View style={styles.participantInfo}>
          {conversation.participant1.id !== user.id ? (
            <>
              <Image source={{ uri: `http://127.0.0.1:8000/img/${conversation.participant2.picture}` }} style={styles.profilePicture} />
              <Text style={styles.participantName}>{conversation.participant2.name}</Text>
            </>
          ) : (
            <>
              <Image source={{ uri: `http://127.0.0.1:8000/img/${conversation.participant1.picture}` }} style={styles.profilePicture} />
              <Text style={styles.participantName}>{conversation.participant1.name}</Text>
            </>
          )}
        </View>
      </View>
      <FlatList
        data={conversation.messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderMessage(item)}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.imageButton} 
          onPress={sendImage}
          disabled={isLoading}
        >
          <Icon name="image" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Envoyer un message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendTextMessage}
          disabled={isLoading || !message.trim()}
        >
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  messageProfilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 15,
  },
  receivedBubble: {
    backgroundColor: '#f0f0f0',
  },
  sentBubble: {
    backgroundColor: 'rgba(230, 241, 253, 1)',
  },
  receivedMessage: {
    flexDirection: 'row',
  },
  sentMessage: {
    flexDirection: 'row-reverse',
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  messageContent: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#7c7c7c',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    opacity: (props) => props.disabled ? 0.5 : 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    maxHeight: 100,
  },
  
});

export default ConversationDetailsScreen;
