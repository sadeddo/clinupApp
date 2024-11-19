import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import Header from './Header';
import Footer from './Footer';

const screenWidth = Dimensions.get('window').width;

const DashboardPrestataire = () => {
    const [data, setData] = useState({
        today: 0,
        week: 0,
        month: 0,
        monthlyRevenuesSum: {},
        monthlyRevenuesAvg: {},
        dataForChartAll: {},
        monthlyData: [] // Initialize monthlyData
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = await AsyncStorage.getItem('token'); 
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/dashboard/prestataire', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Transform monthlyData from an object to an array
                const transformedMonthlyData = Object.keys(response.data.monthlyData).map(date => ({
                    date,
                    totalHours: response.data.monthlyData[date].totalHours,
                    totalEarnings: response.data.monthlyData[date].totalEarnings
                }));
                setData({ ...response.data, // Spread the response data
                    monthlyData: transformedMonthlyData });
                setLoading(false);
            } catch (error) {
                console.error(error);
                Alert.alert('Erreur', "Impossible de charger les données");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const downloadCsv = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/dashboard/prestataire/download-csv', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const fileUri = `${FileSystem.documentDirectory}revenus_mensuels.csv`;
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];
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

    const renderRow = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.date}</Text>
            <Text style={styles.tableCell}>{item.totalHours}</Text>
            <Text style={styles.tableCell}>{item.totalEarnings} €</Text>
        </View>
    );

    if (loading) {
        return <Text>Chargement...</Text>;
    }

    const renderChartData = (dataObject) => {
        const labels = Object.keys(dataObject);
        const dataPoints = Object.values(dataObject);
        return { labels, data: dataPoints };
    };

    const { labels: sumLabels, data: sumData } = renderChartData(data.monthlyRevenuesSum);
    const { labels: avgLabels, data: avgData } = renderChartData(data.monthlyRevenuesAvg);
    const { labels: allLabels, data: allData } = renderChartData(data.dataForChartAll);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Missions Aujourd'hui</Text>
                    <Text style={styles.cardValue}>{data.today}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Missions Cette Semaine</Text>
                    <Text style={styles.cardValue}>{data.week}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Missions Ce Mois</Text>
                    <Text style={styles.cardValue}>{data.month}</Text>
                </View>
            </View>

            <Text style={styles.chartTitle}>Somme Mensuelle de Vos Revenus</Text>
            <BarChart
                data={{
                    labels: sumLabels,
                    datasets: [{ data: sumData }]
                }}
                width={screenWidth - 40}
                height={220}
                yAxisLabel="€"
                chartConfig={chartConfig}
                fromZero={true} 
                bezier
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Moyenne Mensuelle de Vos Revenus</Text>
            <LineChart
                data={{
                    labels: sumLabels,
                    datasets: [{ data: avgData }]
                }}
                width={screenWidth - 40}
                height={220}
                yAxisLabel="€"
                chartConfig={chartConfig}
                fromZero={true} 
                bezier
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Moyenne des Revenus de Tous les Prestataires</Text>
            <LineChart
                data={{
                    labels: sumLabels,
                    datasets: [{ data: allData }]
                }}
                width={screenWidth - 40}
                height={220}
                fromZero={true} 
                yAxisLabel="€"
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
            {/* Monthly Summary Table */}
            <View style={styles.container}>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>Récapitulatif Mensuel</Text>
                    <TouchableOpacity onPress={downloadCsv} style={styles.downloadButton}>
                        <Text style={styles.downloadButtonText}>Télécharger CSV</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeaderCell, styles.tableCell]}>Date</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCell]}>Nombre d'heure</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCell]}>Total</Text>
                    </View>
                    <FlatList
                        data={data.monthlyData}
                        renderItem={renderRow}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </View>
        </ScrollView>
        <Footer />
    </View>
    );
};

const chartConfig = {
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    color: (opacity = 1) => `rgba(255, 56, 92, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: () => '#FF385C',
    decimalPlaces: 2, // Optional, shows decimal places on y-axis values
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#FF385C'
    }
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#FF385C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '30%'
    },
    cardTitle: { color: '#FFF', fontSize: 14 },
    cardValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
    chart: { marginVertical: 8 },
    table: { marginTop: 20 },
    tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    tableCell: { flex: 1, textAlign: 'center' },
    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
    headerText: { fontSize: 18, fontWeight: 'bold' },
    downloadButton: { backgroundColor: '#FF385C', padding: 10, borderRadius: 5 },
    downloadButtonText: { color: 'white' },
    tableHeaderCell: { fontWeight: 'bold' }
});

export default DashboardPrestataire;
