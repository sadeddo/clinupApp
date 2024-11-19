import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

const HeaderHote = () => {
  const navigation = useNavigation();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleNotificationPress = () => {
    navigation.navigate('NotifScreen');
  };

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Icon name="bars" size={24} color="#000" />
        </TouchableOpacity>
        
        {/* Logo au centre */}
        <Image
          source={require('../../public/assets/images/logo-clinup.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
          <Icon name="bell" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Sliding Menu from Bottom */}
      <Modal
        isVisible={isMenuVisible}
        onBackdropPress={toggleMenu}
        swipeDirection="down"
        onSwipeComplete={toggleMenu}
        style={styles.bottomModal}
      >
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>


        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Logements'); }}>
            <Text style={styles.menuText}>Mes logements</Text>
          </TouchableOpacity>

       
          <View style={styles.divider} />


        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Invit'); }}>
            <Text style={styles.menuText}>Mes prestataires</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

      
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 24,
  },
  notificationButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 24,
  },
  logo: {
    width: 100,
    height: 40,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
});

export default HeaderHote;
