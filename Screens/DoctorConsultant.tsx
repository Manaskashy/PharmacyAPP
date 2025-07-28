import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  SafeAreaView 
} from 'react-native';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
}

const DoctorConsultant = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthcare.com',
      phone: '+1 (555) 123-4567',
      specialization: 'Cardiologist',
      experience: '15 years',
      rating: 4.8,
      image: '👩‍⚕️'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@healthcare.com',
      phone: '+1 (555) 234-5678',
      specialization: 'Neurologist',
      experience: '12 years',
      rating: 4.9,
      image: '👨‍⚕️'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@healthcare.com',
      phone: '+1 (555) 345-6789',
      specialization: 'Pediatrician',
      experience: '8 years',
      rating: 4.7,
      image: '👩‍⚕️'
    },
    {
      id: '4',
      name: 'Dr. David Thompson',
      email: 'david.thompson@healthcare.com',
      phone: '+1 (555) 456-7890',
      specialization: 'Orthopedic Surgeon',
      experience: '20 years',
      rating: 4.9,
      image: '👨‍⚕️'
    },
    {
      id: '5',
      name: 'Dr. Lisa Wang',
      email: 'lisa.wang@healthcare.com',
      phone: '+1 (555) 567-8901',
      specialization: 'Dermatologist',
      experience: '10 years',
      rating: 4.6,
      image: '👩‍⚕️'
    },
    {
      id: '6',
      name: 'Dr. Robert Kim',
      email: 'robert.kim@healthcare.com',
      phone: '+1 (555) 678-9012',
      specialization: 'Psychiatrist',
      experience: '18 years',
      rating: 4.8,
      image: '👨‍⚕️'
    }
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDoctors([]);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(text.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorImage}>{item.image}</Text>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialization}>{item.specialization}</Text>
          <Text style={styles.doctorExperience}>{item.experience} experience</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>📧 Email:</Text>
          <Text style={styles.contactValue}>{item.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>📞 Phone:</Text>
          <Text style={styles.contactValue}>{item.phone}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Consultation</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const displayDoctors = searchQuery.trim() === '' ? doctors : filteredDoctors;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Consultation</Text>
        <Text style={styles.subtitle}>Find and book appointments with our specialists</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor name or specialization..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <FlatList
        data={displayDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    position: 'relative',
  },
  searchInput: {
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    position: 'absolute',
    right: 35,
    top: 35,
    fontSize: 18,
  },
  listContainer: {
    padding: 20,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  doctorImage: {
    fontSize: 50,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 3,
  },
  doctorExperience: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    width: 60,
  },
  contactValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorConsultant;