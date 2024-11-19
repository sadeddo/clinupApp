import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import { Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const AddLogement = () => {
    const navigation = useNavigation();
    const [logement, setLogement] = useState({
        nom: '',
        surface: '',
        nbrChambre: 1,
        nbrBain: 1,
        adresse: '',
        completAdresse: '',
        airbnb: '',
        booking: '',
        acces: '',
        description: '',
        img: null, // Image initialisée à null
    });

    const [selectedImage, setSelectedImage] = useState(null); // Pour gérer l'image sélectionnée
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (name, value) => {
        setLogement({ ...logement, [name]: value });
    };

    const handleIncrement = (field) => {
        setLogement((prevState) => ({ ...prevState, [field]: prevState[field] + 1 }));
    };

    const handleDecrement = (field) => {
        setLogement((prevState) => ({ ...prevState, [field]: Math.max(1, prevState[field] - 1) }));
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        if (!result.canceled) {
            const selectedAsset = result.assets[0];
    
            // Extraire le nom de fichier à partir de l'URI si `fileName` est indisponible
            const fileName = selectedAsset.fileName || selectedAsset.uri.split('/').pop();
    
            setSelectedImage({ ...selectedAsset, fileName }); // Mettre à jour `selectedImage` avec `fileName`
        }
    };
    

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        // Récupérer le token
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            setError('Token non trouvé');
            setLoading(false);
            return;
        }

        try {
            // Créer un FormData pour l'envoi de données et du fichier
            let formData = new FormData();
            formData.append('nom', logement.nom);
            formData.append('surface', logement.surface);
            formData.append('nbrChambre', logement.nbrChambre);
            formData.append('nbrBain', logement.nbrBain);
            formData.append('adresse', logement.adresse);
            formData.append('completAdresse', logement.completAdresse);
            formData.append('airbnb', logement.airbnb);
            formData.append('booking', logement.booking);
            formData.append('acces', logement.acces);
            formData.append('description', logement.description);

            // Si une image est sélectionnée, l'ajouter à FormData
            if (selectedImage) {
                const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
                if (!fileInfo.exists) {
                    Alert.alert('Erreur', "Fichier d'image introuvable");
                    setLoading(false);
                    return;
                }
                formData.append('img', {
                    uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                });
            }

            // Envoyer la requête POST au backend
            const response = await axios.post(
                'http://127.0.0.1:8000/api/logements/new',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            Alert.alert('Succès', 'Logement ajouté avec succès');
            navigation.replace('Logements');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du logement:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout du logement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <HeaderHote />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Ajouter un logement</Text>

                {/* Champ pour le nom du logement */}
                <Text style={styles.label}>Nom du logement</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Donnez un nom à votre logement"
                    value={logement.nom}
                    onChangeText={(value) => handleInputChange('nom', value)}
                />

                {/* Surface en m2 */}
                <Text style={styles.label}>Surface en m2</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Surface en m2"
                    keyboardType="numeric"
                    value={logement.surface}
                    onChangeText={(value) => handleInputChange('surface', value)}
                />

                {/* Nombre des chambres */}
                <Text style={styles.label}>Nombre des chambres</Text>
                <View style={styles.counterContainer}>
                    <TouchableOpacity style={styles.counterButton} onPress={() => handleDecrement('nbrChambre')}>
                        <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{logement.nbrChambre}</Text>
                    <TouchableOpacity style={styles.counterButton} onPress={() => handleIncrement('nbrChambre')}>
                        <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Nombre des salles de bain */}
                <Text style={styles.label}>Nombre des salles de bain</Text>
                <View style={styles.counterContainer}>
                    <TouchableOpacity style={styles.counterButton} onPress={() => handleDecrement('nbrBain')}>
                        <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{logement.nbrBain}</Text>
                    <TouchableOpacity style={styles.counterButton} onPress={() => handleIncrement('nbrBain')}>
                        <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Adresse */}
                <Text style={styles.label}>Adresse</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Numéro et rue"
                    value={logement.adresse}
                    onChangeText={(value) => handleInputChange('adresse', value)}
                />

                {/* Complément d'adresse */}
                <Text style={styles.label}>Complément d’adresse</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Appartement, étage, etc."
                    value={logement.completAdresse}
                    onChangeText={(value) => handleInputChange('completAdresse', value)}
                />

                {/* Lien Airbnb */}
                <Text style={styles.label}>Lien Airbnb (Optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez votre lien Ical d'Airbnb"
                    value={logement.airbnb}
                    onChangeText={(value) => handleInputChange('airbnb', value)}
                />

                {/* Lien Booking */}
                <Text style={styles.label}>Lien Booking (Optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez votre lien Ical de Booking"
                    value={logement.booking}
                    onChangeText={(value) => handleInputChange('booking', value)}
                />

                {/* Accès au logement */}
                <Text style={styles.label}>Accès au logement (Optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Accès au logement pour le prestataire"
                    value={logement.acces}
                    onChangeText={(value) => handleInputChange('acces', value)}
                />

                {/* Sélection d'une image */}
                <Text style={styles.label}>Image du logement (Optionnel)</Text>
                <View style={styles.imagePickerContainer}>
                <TextInput
                    style={styles.imageInput}
                    editable={false}
                    placeholder="aucun fichier sélectionné"
                    value={selectedImage ? selectedImage.fileName : ''}
                />

                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                        <Text style={styles.imagePickerButtonText}>Choisir le fichier</Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <Text style={styles.label}>Description (Optionnel)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Décrivez le logement, ses atouts, etc."
                    multiline
                    numberOfLines={4}
                    value={logement.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                />


                {/* Bouton Soumettre */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.submitButtonText}>{loading ? 'Chargement...' : 'Soumettre'}</Text>
                </TouchableOpacity>
            </ScrollView>
            <FooterHote />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(251, 253, 255, 1)',
    },
    scrollContainer: {
        padding: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    counterButton: {
        borderWidth: 1,
        borderColor: '#ff385c',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    counterButtonText: {
        fontSize: 24,
        color: '#ff385c',
    },
    counterValue: {
        fontSize: 18,
    },
    submitButton: {
        backgroundColor: '#ff385c',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
    },
    imageInput: {
        flex: 1,
        padding: 10,
        color: '#000',
        fontSize: 14,
    },
    imagePickerButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: '#ccc',
    },
    imagePickerButtonText: {
        fontSize: 14,
        color: '#007BFF',
    },
});

export default AddLogement;
