import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, FlatList, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import Footer from './Footer';

const EvaluationPresta = () => {
    const [data, setData] = useState({
        average: 0,
        missions: 0,
        tier: '',
        comments: [],
        clientPicture: '' // Ensure clientPicture has a default value
    });
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState('');
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/evaluation', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "Impossible de charger les données");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResponseSubmit = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.post(`http://127.0.0.1:8000/api/evaluation/${selectedCommentId}/response`, {
                response: responseText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            Alert.alert('Success', 'Response saved successfully');
            setResponseText('');
            setSelectedCommentId(null);
            setModalVisible(false);
            fetchData(); // Refresh data to update the comment's response
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Échec de l\'enregistrement de la réponse');
        }
    };

    const openModal = (commentId) => {
        setSelectedCommentId(commentId);
        setModalVisible(true);
    };
    const getIconStyles = (position) => {
        // Determine if the icon at the specified position should be active based on tier
        const isActive = (data.tier === 'Bronze' && position === 0) ||
                         (data.tier === 'Argent' && position <= 1) ||
                         (data.tier === 'Or' && position <= 2);
        return [styles.iconCircle, isActive && styles.activeIcon];
    };
    const renderComment = ({ item }) => (
        <View style={styles.commentContainer}>
            <Image source={{ uri: `http://127.0.0.1:8000/img/${item.clientPicture}` }} style={styles.avatarSmall} />
            <View style={styles.commentContent}>
                <Text style={styles.clientName}>{item.clientName}</Text>
                <Text style={styles.date}>{item.createdAt}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
                <Text style={styles.rating}>{'⭐'.repeat(item.evaluation)}</Text>
                {item.response ? (
                    <View style={styles.responseContainer}>
                        <Text style={styles.responseLabel}>Réponse de l'agent</Text>
                        <Text style={styles.responseText}>{item.response}</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.replyButton} onPress={() => openModal(item.id)}>
                        <Text style={styles.replyButtonText}>Répondre à cette évaluation</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) return <Text>Loading...</Text>;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <Header />
        <ScrollView style={styles.container}>
            <View style={styles.container}>
                {/* Card-like container */}
            <View style={styles.card}>
                <View style={styles.profileContainer}>
                    <Image source={{ uri: `http://127.0.0.1:8000/img/${data.picture}` }} style={styles.avatar} />
                    <Text style={styles.tierText}>Mon palier</Text>
                </View>

                {/* Icon Row with Connecting Line */}
                <View style={styles.iconRow}>
                    <View style={styles.iconLine} />
                    <View style={getIconStyles(0)}>
                        <Text style={styles.icon}>💰</Text>
                    </View>
                    <View style={getIconStyles(1)}>
                        <Text style={styles.icon}>💵</Text>
                    </View>
                    <View style={getIconStyles(2)}>
                        <Text style={styles.icon}>🏅</Text>
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                <Text style={styles.tierText}>Palier actuel</Text>
                <Text style={styles.infoTitle}>{data.tier}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.tierText}>Évaluation</Text>
                <Text style={styles.infoTitle}>{'⭐'.repeat(data.average)}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.tierText}>Missions accomplies</Text>
                <Text style={styles.infoTitle}>{data.missions}</Text>
            </View>
            </View>

            {/* Comments Section */}
            <Text style={styles.sectionTitle}>Avis et commentaires</Text>
                <FlatList
                    data={data.comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id.toString()}
                />

                {/* Modal for Response */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Votre réponse</Text>
                            <TextInput
                                style={styles.input}
                                value={responseText}
                                onChangeText={setResponseText}
                                placeholder="Écrire votre réponse..."
                                multiline
                            />
                            <Button title="Envoyer" onPress={handleResponseSubmit} />
                            <Button title="Annuler" color="red" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </Modal>
        </ScrollView>
        <Footer />
    </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        marginBottom: 10
    },
    tierText: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center'
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
     
        position: 'relative' // Position relative for the line overlay
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d6d6d6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1 // Ensure icons are above the connecting line
    },
    activeIcon: {
        backgroundColor: '#FF385C',
    },
    icon: {
        fontSize: 24,
        color: '#666'
    },
    iconLine: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        height: 2,
        backgroundColor: '#FF385C',
        zIndex: 0 // Ensure line is behind the icons
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    infoTitle: {
        fontSize: 16,
        color: '#666'
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF385C'
    },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
    commentContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10
    },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    commentContent: { flex: 1 },
    clientName: { fontWeight: 'bold', fontSize: 16 },
    date: { color: 'grey', fontSize: 12 },
    commentText: { marginVertical: 5, fontSize: 14 },
    rating: { fontSize: 14, color: 'gold' },
    responseContainer: { marginTop: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#FF385C' },
    responseLabel: { fontWeight: 'bold', color: '#FF385C' },
    responseText: { fontSize: 14, fontStyle: 'italic', color: 'grey' },
    replyButton: {
        borderColor: '#FF385C',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginTop: 10,
        alignItems: 'center'
    },
    replyButtonText: { color: '#FF385C', fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: {
        height: 80,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15
    }
});

export default EvaluationPresta;

