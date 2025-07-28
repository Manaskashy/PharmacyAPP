import React from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from "react-native";

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#87CEEB',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

const services = [
  {
    id: 1,
    title: 'Doctor Consultation',
    subtitle: 'Video/Clinic visit',
  },
  {
    id: 2,
    title: 'Buy Medicine',
    subtitle: 'Prescription drugs',
  },
  {
    id: 3,
    title: 'Lab Tests',
    subtitle: 'Book tests at home',
  },
  {
    id: 4,
    title: 'Surgical Supplies',
    subtitle: 'Medical equipment',
  },
  {
    id: 5,
    title: 'First Aid',
    subtitle: 'Emergency kits',
  },
  {
    id: 6,
    title: 'Health Checkup',
    subtitle: 'Full body packages',
  },
];

// NOTE: Accept navigation prop!
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Pharmacy App</Text>
      
      <TextInput
        style={Styles.searchBar}
        placeholder="Search services..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Styles.servicesContainer}>
          {services.map((service) => (
            <Pressable
              key={service.id}
              style={Styles.serviceCard}
              onPress={() => {
                if (service.title === "Doctor Consultation") {
                  navigation.navigate('DoctorConsultant');
                } else if (service.title === "Buy Medicine") {
                  navigation.navigate('Medicine');
                } else if (service.title === "Surgical Supplies") {
                  navigation.navigate('SurgicalEquipment');
                } else if (service.title === "Lab Tests") {
                  navigation.navigate('LabTests');
                } else if (service.title === "First Aid") {
                  navigation.navigate('FirstAid');
                } else if (service.title === "Health Checkup") {
                  navigation.navigate('HealthCheckup');
                } else {
                  console.log('Pressed:', service.title);
                }
              }}
            >
              <Text style={Styles.serviceTitle}>{service.title}</Text>
              <Text style={Styles.serviceSubtitle}>{service.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;