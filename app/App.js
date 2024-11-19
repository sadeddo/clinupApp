import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './src/components/Register';
import LoginScreen from './src/components/Login';
import Disponibilites from './src/components/DispoShow';
import ConfigStripe from './src/components/ConfigStripe';
import Profil from './src/components/Profile';
import ProfilHote from './src/components/ProfilHote';
import Logements from './src/components/Logement';
import AddLogement from './src/components/AddLogement';
import UpdateLogement from './src/components/UpdateLogement';
import LogementDetails from './src/components/LogementDetails';
import AddTask from './src/components/AddTask';
import Invit from './src/components/Invit';
import AddInvit from './src/components/AddInvit';
import AddReservation from './src/components/addReservation';
import ReservationsHote from './src/components/ReservationsHote';
import UpdateIcale from './src/components/UpdateIcale';
import DetailsReservationHote from './src/components/DetailsReservationHote';
import DashboardHote from './src/components/DashboardHote';
import PrestataireProfileScreen from './src/components/PrestataireProfileScreen';
import AddCommentScreen from './src/components/AddCommentScreen';
import PaymentScreen from './src/components/PaymentScreen'
import { StripeProvider } from '@stripe/stripe-react-native'; // Ajout de StripeProvider
import 'react-native-url-polyfill/auto';
import ReservationsPresta from './src/components/ReservationsPresta';
import DetailsReservationPresta from './src/components/DetailsReservationPresta';
import ChatScreen from './src/components/ChatScreen';
import ConversationDetailsScreen from './src/components/ConversationDetailsScreen';
import DashboardPresta from './src/components/DashboardPresta';
import EvaluationPresta from './src/components/EvaluationPresta'
import NotifScreen from './src/components/NotifScreen'
import PaymentScreenInvit from './src/components/PaymentScreenInvit';
import NotifPresta from './src/components/NotifPresta'
import ChatPresta from './src/components/ChatPresta'
import ConversationDetailsPresta from './src/components/ConversationDetailsPresta'
// Configuration de deep linking
const linking = {
  prefixes: ['myapp://'],  // Schéma d'URL de votre application
  config: {
    screens: {
      ConfigStripe: 'api/stripe/status', // Définit les routes et paramètres
    },
  },
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51PC23OGrwysY3nEfKzPhtsCMxudBmcgUNrjzxPNCJYk5LPdxrjLTcz4LD9DAiVHJe62DmFFerQnKBzTQmskNG1kX0053s31F6s">
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ReservationsPresta" 
            component={ReservationsPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ConfigStripe" 
            component={ConfigStripe} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="PrestataireProfileScreen" 
            component={PrestataireProfileScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Profil" 
            component={Profil} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="PaymentScreen" 
            component={PaymentScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ProfilHote" 
            component={ProfilHote} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="DashboardHote" 
            component={DashboardHote} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Logements" 
            component={Logements} 
            options={{ title: '' }}
          />
          <Stack.Screen name="AddCommentScreen" component={AddCommentScreen} />
          <Stack.Screen 
            name="AddLogement" 
            component={AddLogement} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="UpdateIcale" 
            component={UpdateIcale} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="DetailsReservationHote" 
            component={DetailsReservationHote} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="UpdateLogement" 
            component={UpdateLogement} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Invit" 
            component={Invit} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="LogementDetails" 
            component={LogementDetails} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="AddTask" 
            component={AddTask} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="AddInvit" 
            component={AddInvit} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="AddReservation" 
            component={AddReservation} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ReservationsHote" 
            component={ReservationsHote} 
            options={{ title: '' }}
          />
           <Stack.Screen 
            name="PaymentScreenInvit" 
            component={PaymentScreenInvit} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="DetailsReservationPresta" 
            component={DetailsReservationPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ChatScreen" 
            component={ChatScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="EvaluationPresta" 
            component={EvaluationPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="DashboardPresta" 
            component={DashboardPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="NotifScreen" 
            component={NotifScreen} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ChatPresta" 
            component={ChatPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="ConversationDetailsPresta" 
            component={ConversationDetailsPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="NotifPresta" 
            component={NotifPresta} 
            options={{ title: '' }}
          />
          <Stack.Screen name="Disponibilites" component={Disponibilites} />
          <Stack.Screen name="ConversationDetailsScreen" component={ConversationDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
