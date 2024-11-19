import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView,FlatList , Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DatePicker from "react-native-modal-datetime-picker";
import DropDownPicker from 'react-native-dropdown-picker';
import HeaderHote from './HeaderHote';
import FooterHote from './FooterHote';
import * as FileSystem from 'expo-file-system';

const ReservationScreen = () => {
    const [logements, setLogements] = useState([]);
    const [logementId, setLogementId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reservationsStats, setReservationsStats] = useState([]);
    const [logementsData, setLogementsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [format, setFormat] = useState('csv'); // Par défaut CSV
    const [open, setOpen] = useState(false); // État pour le Dropdown

    useEffect(() => {
      const fetchData = async () => {
        const token = await AsyncStorage.getItem('token');
  
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/dashboard/hote`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          setReservationsStats(response.data.reservationsStats || []);
          setLogements(response.data.logements.map(logement => ({
            label: logement.nom, value: logement.id
          })) || []);
          setLogementsData(response.data.logementsData || []);
          setError(null); // Réinitialiser l'erreur si la requête est réussie
        } catch (err) {
          console.error('Erreur lors du chargement des données', err);
          setError('Erreur lors du chargement des données'); // Stocker le message d'erreur
        } finally {
          setLoading(false); // Fin du chargement dans tous les cas
        }
      };
  
      fetchData();
    }, []);

    const fetchReservations = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/dashboard/hote`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            logementId,
            startDate,
            endDate,
          },
        });
        setLogementsData(response.data.logementsData || []);
      } catch (error) {
        console.error('Erreur lors du filtrage des données', error);
        setError('Erreur lors du filtrage des données');
      }
    };
    const downloadFile = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/dashboard/hote`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            logementId,
            startDate,
            endDate,
            format,
          },
          responseType: 'blob', // Get the file as binary data (blob)
        });
    
        const fileName = `export_${new Date().toISOString().slice(0, 10)}.${format}`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
        // Convert the binary blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1]; // Extract base64 data
    
          // Save the file in base64 format
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });
    
          Alert.alert('Téléchargement réussi', `Fichier téléchargé avec succès dans: ${fileUri}`);
        };
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
        Alert.alert('Erreur', 'Échec du téléchargement du fichier.');
      }
    };


    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const showEndDatePicker = () => setEndDatePickerVisibility(true);
    const hideEndDatePicker = () => setEndDatePickerVisibility(false);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="" color="#0000ff" />
                <Text>Chargement des données...</Text>
            </View>
        );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderHote />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Statistiques des réservations */}
            <Text style={styles.subHeader}>Statistiques des Réservations</Text>
            <FlatList
                data={reservationsStats}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                renderItem={({ item }) => (
                    <View style={styles.statsItem}>
                        <Text style={styles.statText}>Réservations {item.reservationStatut}:</Text>
                        <Text style={styles.statNumber}>{item.nombreReservations}</Text>
                    </View>
                )}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.header}>Filtrer les réservations</Text>

            {/* Dropdown pour sélectionner le logement */}
            <View style={styles.filterContainer}>
                <Text style={styles.label}>Logement:</Text>
                <DropDownPicker
                    open={open}
                    value={logementId}
                    items={logements}
                    setOpen={setOpen}
                    setValue={setLogementId}
                    placeholder="Tous les logements"
                    style={[styles.dropdown, { zIndex: 1000 }]}
                    dropDownContainerStyle={styles.dropdownContainer}
                    onChangeValue={(value) => setLogementId(value)}
                />
            </View>

            {/* DatePicker pour sélectionner les dates */}
            <View style={styles.dateContainer}>
                <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>Sélectionner Date de début</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>Date de début: {startDate}</Text>

                <TouchableOpacity onPress={showEndDatePicker} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>Sélectionner Date de fin</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>Date de fin: {endDate}</Text>
            </View>

            {/* DatePickers pour les deux dates */}
            <DatePicker
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    setStartDate(date.toISOString().split('T')[0]);
                    hideDatePicker();
                }}
                onCancel={hideDatePicker}
            />
            <DatePicker
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    setEndDate(date.toISOString().split('T')[0]);
                    hideEndDatePicker();
                }}
                onCancel={hideEndDatePicker}
            />

            {/* Bouton pour appliquer les filtres */}
            <Button title="Filtrer" onPress={fetchReservations} color="#4CAF50" />

            {/* Tableau des réservations */}
            <Text style={styles.subHeader}>Liste des Réservations</Text>
            <TouchableOpacity onPress={downloadFile} style={styles.downloadButton}>
                  <Text style={styles.downloadButtonText}>Télécharger {format.toUpperCase()}</Text>
              </TouchableOpacity>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Logement</Text>
                    <Text style={styles.tableHeaderText}>Statut</Text>
                    <Text style={styles.tableHeaderText}>Nbre de Réservations</Text>
                    <Text style={styles.tableHeaderText}>Montant (€)</Text>
                </View>
                {logementsData.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.logementNom}</Text>
                        <Text style={styles.tableCell}>{item.reservationStatut}</Text>
                        <Text style={styles.tableCell}>{item.nombreReservations}</Text>
                        <Text style={styles.tableCell}>{item.totalMontant} €</Text>
                    </View>
                ))}
            </View>
       </ScrollView>
      <FooterHote />
    </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    dropdown: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10 },
    dropdownContainer: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ddd' },
    filterContainer: { marginBottom: 20, zIndex: 1000 },
    label: { fontSize: 16, marginBottom: 5 },
    dateContainer: { marginBottom: 20 },
    dateButton: { padding: 10, backgroundColor: '#007AFF', borderRadius: 5, marginTop: 5, alignItems: 'center' },
    dateButtonText: { color: 'white', fontWeight: 'bold' },
    dateText: { marginTop: 10, fontSize: 16 },
    table: { marginTop: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 5 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#FF385C', padding: 10 },
    tableHeaderText: { flex: 1, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    tableCell: { flex: 1, textAlign: 'center', fontSize: 14 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
    statsItem: {
      backgroundColor: '#FF385C',
      padding: 15,
      marginVertical: 8,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  statText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 5,
  },
  statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
  },
  downloadContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  downloadButton: { backgroundColor: '#FF385C', padding: 10, borderRadius: 5, alignItems: 'center' },
  downloadButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ReservationScreen;
