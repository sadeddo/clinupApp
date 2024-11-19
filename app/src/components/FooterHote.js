import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, navigation } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importation des icônes FontAwesome
import { useNavigation } from '@react-navigation/native';

const FooterHote = () => {
    const navigation = useNavigation(); 
    return (
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View style={styles.footer}>
      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('DashboardHote')}>
          <Icon name="home" size={22} color="#333" />
          <Text style={styles.footerLink}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ReservationsHote')}>
          <Icon name="calendar" size={22} color="#333" />
          <Text style={styles.footerLink}>Réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ChatPresta')}>
        <Icon name="comment-o" size={22} color="#333" />
        <Text style={styles.footerLink}>Messages</Text>
      </TouchableOpacity>
       
  
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ProfilHote')}>
          <Icon name="cog" size={22} color="#FF385C" />
          <Text style={[styles.footerLink, styles.activeLink]}>Profil</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    footer: {
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-around', // Distribution uniforme des éléments
    },
    footerItem: {
      alignItems: 'center',
    },
    footerLink: {
      textDecorationLine: 'none',
      color: '#333',
      fontSize: 12,
      marginTop: 5,
    },
    activeLink: {
      color: '#FF385C', // Couleur active pour l'élément sélectionné
    },
  });

export default FooterHote;