import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';

const userInfo = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

const activities = [
  {
    id: '1',
    type: 'Purchase',
    description: 'Bought Paracetamol 500mg',
    date: '2024-05-01',
  },
  {
    id: '2',
    type: 'Lab Test',
    description: 'Booked Complete Blood Count',
    date: '2024-05-03',
  },
  {
    id: '3',
    type: 'Purchase',
    description: 'Bought Vitamin D3 Tablets',
    date: '2024-05-10',
  },
  {
    id: '4',
    type: 'Lab Test',
    description: 'Booked Thyroid Profile',
    date: '2024-05-12',
  },
];

const Profile = () => {
  const renderActivity = ({ item }: { item: typeof activities[0] }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityType}>{item.type}</Text>
      <Text style={styles.activityDesc}>{item.description}</Text>
      <Text style={styles.activityDate}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileName}>{userInfo.name}</Text>
        <Text style={styles.profileEmail}>{userInfo.email}</Text>
      </View>
      <Text style={styles.sectionTitle}>Your Activity</Text>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.activityList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  profileHeader: {
    padding: 30,
    backgroundColor: '#3498db',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  activityList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  activityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 3,
  },
  activityDesc: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});

export default Profile; 