import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Image 
} from 'react-native';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  dosage: string;
  manufacturer: string;
  inStock: boolean;
  image: string;
}

const BuyMedicine = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  const medicines: Medicine[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: '$5.99',
      description: 'Relieves fever and mild to moderate pain',
      dosage: '1-2 tablets every 4-6 hours',
      manufacturer: 'Johnson & Johnson',
      inStock: true,
      image: '💊'
    },
    {
      id: '2',
      name: 'Ibuprofen 400mg',
      category: 'Anti-inflammatory',
      price: '$7.50',
      description: 'Reduces inflammation and pain',
      dosage: '1 tablet every 6-8 hours',
      manufacturer: 'Pfizer',
      inStock: true,
      image: '💊'
    },
    {
      id: '3',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      price: '$12.99',
      description: 'Treats bacterial infections',
      dosage: '1 capsule 3 times daily',
      manufacturer: 'GlaxoSmithKline',
      inStock: true,
      image: '💊'
    },
    {
      id: '4',
      name: 'Omeprazole 20mg',
      category: 'Antacid',
      price: '$15.75',
      description: 'Reduces stomach acid production',
      dosage: '1 capsule daily before breakfast',
      manufacturer: 'AstraZeneca',
      inStock: true,
      image: '💊'
    },
    {
      id: '5',
      name: 'Cetirizine 10mg',
      category: 'Antihistamine',
      price: '$8.25',
      description: 'Relieves allergy symptoms',
      dosage: '1 tablet daily',
      manufacturer: 'Sanofi',
      inStock: true,
      image: '💊'
    },
    {
      id: '6',
      name: 'Metformin 500mg',
      category: 'Diabetes',
      price: '$18.50',
      description: 'Controls blood sugar levels',
      dosage: '1 tablet twice daily with meals',
      manufacturer: 'Merck',
      inStock: true,
      image: '💊'
    },
    {
      id: '7',
      name: 'Lisinopril 10mg',
      category: 'Blood Pressure',
      price: '$22.00',
      description: 'Lowers blood pressure',
      dosage: '1 tablet daily',
      manufacturer: 'AstraZeneca',
      inStock: true,
      image: '💊'
    },
    {
      id: '8',
      name: 'Atorvastatin 20mg',
      category: 'Cholesterol',
      price: '$25.99',
      description: 'Lowers cholesterol levels',
      dosage: '1 tablet daily in evening',
      manufacturer: 'Pfizer',
      inStock: true,
      image: '💊'
    },
    {
      id: '9',
      name: 'Sertraline 50mg',
      category: 'Antidepressant',
      price: '$30.50',
      description: 'Treats depression and anxiety',
      dosage: '1 tablet daily',
      manufacturer: 'Pfizer',
      inStock: true,
      image: '💊'
    },
    {
      id: '10',
      name: 'Albuterol Inhaler',
      category: 'Asthma',
      price: '$35.75',
      description: 'Relieves asthma symptoms',
      dosage: '2 puffs as needed',
      manufacturer: 'GlaxoSmithKline',
      inStock: true,
      image: '💊'
    },
    {
      id: '11',
      name: 'Warfarin 5mg',
      category: 'Blood Thinner',
      price: '$28.25',
      description: 'Prevents blood clots',
      dosage: 'As prescribed by doctor',
      manufacturer: 'Bristol-Myers Squibb',
      inStock: true,
      image: '💊'
    },
    {
      id: '12',
      name: 'Levothyroxine 50mcg',
      category: 'Thyroid',
      price: '$16.80',
      description: 'Treats hypothyroidism',
      dosage: '1 tablet daily on empty stomach',
      manufacturer: 'Abbott',
      inStock: true,
      image: '💊'
    },
    {
      id: '13',
      name: 'Amlodipine 5mg',
      category: 'Blood Pressure',
      price: '$19.99',
      description: 'Lowers blood pressure',
      dosage: '1 tablet daily',
      manufacturer: 'Pfizer',
      inStock: true,
      image: '💊'
    },
    {
      id: '14',
      name: 'Metoprolol 25mg',
      category: 'Heart',
      price: '$21.50',
      description: 'Treats high blood pressure and heart conditions',
      dosage: '1 tablet twice daily',
      manufacturer: 'AstraZeneca',
      inStock: true,
      image: '💊'
    },
    {
      id: '15',
      name: 'Losartan 50mg',
      category: 'Blood Pressure',
      price: '$24.75',
      description: 'Lowers blood pressure',
      dosage: '1 tablet daily',
      manufacturer: 'Merck',
      inStock: true,
      image: '💊'
    },
    {
      id: '16',
      name: 'Simvastatin 20mg',
      category: 'Cholesterol',
      price: '$23.40',
      description: 'Lowers cholesterol levels',
      dosage: '1 tablet daily in evening',
      manufacturer: 'Merck',
      inStock: true,
      image: '💊'
    },
    {
      id: '17',
      name: 'Fluoxetine 20mg',
      category: 'Antidepressant',
      price: '$27.80',
      description: 'Treats depression and OCD',
      dosage: '1 capsule daily',
      manufacturer: 'Eli Lilly',
      inStock: true,
      image: '💊'
    },
    {
      id: '18',
      name: 'Tramadol 50mg',
      category: 'Pain Relief',
      price: '$32.99',
      description: 'Relieves moderate to severe pain',
      dosage: '1 tablet every 4-6 hours as needed',
      manufacturer: 'Janssen',
      inStock: true,
      image: '💊'
    },
    {
      id: '19',
      name: 'Diazepam 5mg',
      category: 'Anxiety',
      price: '$29.50',
      description: 'Treats anxiety and muscle spasms',
      dosage: 'As prescribed by doctor',
      manufacturer: 'Roche',
      inStock: true,
      image: '💊'
    },
    {
      id: '20',
      name: 'Morphine 10mg',
      category: 'Pain Relief',
      price: '$45.75',
      description: 'Severe pain relief',
      dosage: 'As prescribed by doctor',
      manufacturer: 'Purdue Pharma',
      inStock: true,
      image: '💊'
    }
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredMedicines([]);
    } else {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(text.toLowerCase()) ||
        medicine.category.toLowerCase().includes(text.toLowerCase()) ||
        medicine.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };

  const renderMedicineCard = ({ item }: { item: Medicine }) => (
    <TouchableOpacity style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineImage}>{item.image}</Text>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <Text style={styles.medicineCategory}>{item.category}</Text>
          <Text style={styles.medicinePrice}>{item.price}</Text>
          <View style={styles.stockContainer}>
            <Text style={[styles.stockStatus, { color: item.inStock ? '#27ae60' : '#e74c3c' }]}>
              {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.medicineDetails}>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Dosage:</Text>
          <Text style={styles.detailValue}>{item.dosage}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Manufacturer:</Text>
          <Text style={styles.detailValue}>{item.manufacturer}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={[styles.addToCartButton, !item.inStock && styles.disabledButton]}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const displayMedicines = searchQuery.trim() === '' ? medicines : filteredMedicines;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicines</Text>
        <Text style={styles.subtitle}>Browse and order prescription medications</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines by name, category, or description..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <FlatList
        data={displayMedicines}
        renderItem={renderMedicineCard}
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
  medicineCard: {
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
  medicineHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  medicineImage: {
    fontSize: 50,
    marginRight: 15,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  medicineCategory: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 3,
  },
  medicinePrice: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  medicineDetails: {
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  addToCartButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuyMedicine; 