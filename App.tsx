import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './Screens/Home'; // or './screens/Home'
import DoctorConsultant from './Screens/DoctorConsultant';
import Medicines from './Screens/Medicine';
import Login from './Screens/Login';
import SurgicalEquipment from './Screens/SurgicalEquipment';
import LabTests from './Screens/Labtest';
import Profile from './Screens/Profile';
import LoaderScreen from './Screens/LoaderScreen';
// If you have LabTests, FirstAid, HealthCheckup screens, import them here as well
// import LabTests from './Screens/LabTests';
import FirstAid from './Screens/FirstAid';
import HealthCheckup from './Screens/HealthCheckup';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoaderScreen" screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoaderScreen" component={LoaderScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name='Home' component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="DoctorConsultant" component={DoctorConsultant} options={{ title: 'Doctor Consultation' }}/>
        <Stack.Screen name="Medicine" component={Medicines} options={{ title: 'Medicines' }}/>
        <Stack.Screen name="SurgicalEquipment" component={SurgicalEquipment} options={{ title: 'Surgical Equipment' }}/>
        {/* Uncomment and add these screens if implemented */}
        <Stack.Screen name="LabTests" component={LabTests} options={{ title: 'Lab Tests' }}/>
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'Your Profile' }}/>
        <Stack.Screen name="FirstAid" component={FirstAid} options={{ title: 'First Aid' }}/>
        <Stack.Screen name="HealthCheckup" component={HealthCheckup} options={{ title: 'Health Checkup' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}