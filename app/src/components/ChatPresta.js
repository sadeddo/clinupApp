import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';


const ChatPresta = () => {
  const [conversations, setConversations] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations :', error);
    }
  };
  const handleConversationPress = (conversationId) => {
    navigation.navigate('ConversationDetailsPresta', { conversationId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item.id)}>
      <Image source={{ uri: `http://127.0.0.1:8000/img/${item.participantPicture}` }} style={styles.profilePicture} />
      <View style={styles.conversationDetails}>
        <Text style={styles.participantName}>
          {item.participantName}
        </Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.lastMessageTimestamp}>{item.lastMessageTimestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderHote />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      <FooterHote />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  conversationDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#7c7c7c',
  },
  lastMessageTimestamp: {
    fontSize: 12,
    color: '#7c7c7c',
  },
});

export default ChatPresta;