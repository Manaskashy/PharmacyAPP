import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { OrderProvider } from './Context/OrderContext';
import { CartProvider } from './Context/CartContext';
import { NotificationProvider } from './Context/NotificationContext';

import HomeScreen from './Screens/Home'; // or './screens/Home'
import DoctorConsultant from './Screens/DoctorConsultant';
import Medicines from './Screens/Medicine';
import Login from './Screens/Login';
import Register from './Screens/Register';
import SurgicalEquipment from './Screens/SurgicalEquipment';
import LabTests from './Screens/Labtest';
import Profile from './Screens/Profile';
import LoaderScreen from './Screens/LoaderScreen';
import FirstAid from './Screens/FirstAid';
import HealthCheckup from './Screens/HealthCheckup';
import Ambulance from './Screens/Ambulance';
import HomeCare from './Screens/HomeCare';
import Vitamins from './Screens/Vitamins';
import HealthVault from './Screens/HealthVault';
import Orders from './Screens/Orders';
import PaymentScreen from './Screens/PaymentScreen';
import Cart from './Screens/Cart';
import Categories from './Screens/Categories';
import OrderTracking from './Screens/OrderTracking';
import AddressBook from './Screens/AddressBook';
import PaymentMethods from './Screens/PaymentMethods';
import InsuranceDetails from './Screens/InsuranceDetails';
import Settings from './Screens/Settings';
import Notifications from './Screens/Notifications';
import Appointments from './Screens/Appointments';
import Chatbot from './Screens/Chatbot';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <OrderProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="LoaderScreen" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="LoaderScreen" component={LoaderScreen} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DoctorConsultant" component={DoctorConsultant} options={{ title: 'Doctor Consultation' }} />
              <Stack.Screen name="Medicine" component={Medicines} options={{ title: 'Medicines' }} />
              <Stack.Screen name="SurgicalEquipment" component={SurgicalEquipment} options={{ title: 'Surgical Equipment' }} />
              <Stack.Screen name="LabTests" component={LabTests} options={{ title: 'Lab Tests' }} />
              <Stack.Screen name="Profile" component={Profile} options={{ title: 'Your Profile' }} />
              <Stack.Screen name="FirstAid" component={FirstAid} options={{ title: 'First Aid' }} />
              <Stack.Screen name="HealthCheckup" component={HealthCheckup} options={{ title: 'Health Checkup' }} />
              <Stack.Screen name="Ambulance" component={Ambulance} options={{ title: 'Ambulance' }} />
              <Stack.Screen name="HomeCare" component={HomeCare} options={{ title: 'Home Care' }} />
              <Stack.Screen name="Vitamins" component={Vitamins} options={{ title: 'Vitamins' }} />
              <Stack.Screen name="HealthVault" component={HealthVault} options={{ title: 'Health Vault' }} />
              <Stack.Screen name="Orders" component={Orders} options={{ title: 'My Orders' }} />
              <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Cart" component={Cart} options={{ title: 'My Cart' }} />
              <Stack.Screen name="Categories" component={Categories} options={{ title: 'All Services' }} />
              <Stack.Screen name="OrderTracking" component={OrderTracking} options={{ title: 'Track Order' }} />
              <Stack.Screen name="AddressBook" component={AddressBook} options={{ title: 'Address Book' }} />
              <Stack.Screen name="PaymentMethods" component={PaymentMethods} options={{ title: 'Payment Methods' }} />
              <Stack.Screen name="InsuranceDetails" component={InsuranceDetails} options={{ title: 'Insurance Details' }} />
              <Stack.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
              <Stack.Screen name="Notifications" component={Notifications} options={{ title: 'Notifications' }} />
              <Stack.Screen name="Appointments" component={Appointments} options={{ title: 'My Appointments' }} />
              <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }} />

            </Stack.Navigator>
          </NavigationContainer>
        </OrderProvider>
      </CartProvider>
    </NotificationProvider>
  );
}