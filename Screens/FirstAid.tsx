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

interface FirstAid {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  manufacturer: string;
  inStock: boolean;
  image: string; // can be emoji or url
}

const FirstAid = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFirstAid, setFilteredFirstAid] = useState<FirstAid[]>([]);
  const firstAid: FirstAid[] = [
    {
      id: '1',
      name: 'Bandage',
      category: 'Wound Care',
      price: '₹50',
      description: 'Used to cover and protect wounds.',
      manufacturer: 'MediCare',
      inStock: true,
      image: '🩹',
    },
    {
      id: '2',
      name: 'Antiseptic Cream',
      category: 'Wound Care',
      price: '₹120',
      description: 'Prevents infection in minor cuts and burns.',
      manufacturer: 'HealthPlus',
      inStock: true,
      image: '🧴',
    },
    {
      id: '3',
      name: 'Thermometer',
      category: 'Diagnostic',
      price: '₹250',
      description: 'Measures body temperature.',
      manufacturer: 'ThermoSafe',
      inStock: false,
      image: '🌡️',
    },
    {
      id: '4',
      name: 'Gauze Pads',
      category: 'Wound Care',
      price: '₹80',
      description: 'Sterile pads for wound dressing.',
      manufacturer: 'CareFirst',
      inStock: true,
      image: '🩺',
    },
    {
      id: '5',
      name: 'Scissors',
      category: 'Tools',
      price: '₹150',
      description: 'Used for cutting bandages and tape.',
      manufacturer: 'SafeCut',
      inStock: true,
      image: '✂️',
    },
    {
      id: '6',
      name: 'Adhesive Tape',
      category: 'Wound Care',
      price: '₹60',
      description: 'Secures bandages and dressings in place.',
      manufacturer: 'StickWell',
      inStock: true,
      image: '📏',
    },
    {
      id: '7',
      name: 'Instant Cold Pack',
      category: 'Emergency',
      price: '₹90',
      description: 'Provides immediate cold therapy for injuries.',
      manufacturer: 'CoolAid',
      inStock: true,
      image: '❄️',
    },
    {
      id: '8',
      name: 'CPR Face Shield',
      category: 'Resuscitation',
      price: '₹200',
      description: 'Protective barrier for performing CPR.',
      manufacturer: 'LifeSaver',
      inStock: false,
      image: '🛡️',
    },
    {
      id: '9',
      name: 'Burn Gel',
      category: 'Burn Care',
      price: '₹180',
      description: 'Soothes and cools minor burns.',
      manufacturer: 'BurnEase',
      inStock: true,
      image: '🔥',
    },
    {
      id: '10',
      name: 'Tweezers',
      category: 'Tools',
      price: '₹70',
      description: 'Removes splinters or debris from wounds.',
      manufacturer: 'PinchPro',
      inStock: true,
      image: '🔬',
    },
    {
      id: '11',
      name: 'Elastic Bandage',
      category: 'Support',
      price: '₹110',
      description: 'Provides support for sprains and strains.',
      manufacturer: 'FlexiWrap',
      inStock: true,
      image: '🧦',
    },
    {
      id: '12',
      name: 'Eye Wash Solution',
      category: 'Eye Care',
      price: '₹130',
      description: 'Cleanses and soothes eyes exposed to irritants.',
      manufacturer: 'ClearView',
      inStock: false,
      image: '👁️',
    },
    {
      id: '13',
      name: 'Gloves (Disposable)',
      category: 'Protection',
      price: '₹40',
      description: 'Protects hands and prevents contamination.',
      manufacturer: 'SafeHands',
      inStock: true,
      image: '🧤',
    },
    {
      id: '14',
      name: 'Alcohol Swabs',
      category: 'Disinfection',
      price: '₹30',
      description: 'Used to disinfect skin before injections.',
      manufacturer: 'Stericlean',
      inStock: true,
      image: '🧻',
    },
    {
      id: '15',
      name: 'First Aid Manual',
      category: 'Guide',
      price: '₹75',
      description: 'Provides instructions for emergency care.',
      manufacturer: 'HealthGuide',
      inStock: true,
      image: '📖',
    },
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredFirstAid([]);
    } else {
      const filtered = firstAid.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.category.toLowerCase().includes(text.toLowerCase()) ||
        item.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredFirstAid(filtered);
    }
  };

  const renderFirstAidCard = ({ item }: { item: FirstAid }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.image}>{item.image || '🩹'}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>{item.price}</Text>
          <View style={styles.stockContainer}>
            <Text style={[styles.stockStatus, { color: item.inStock ? '#27ae60' : '#e74c3c' }] }>
              {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.description}>{item.description}</Text>
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

  const displayFirstAid = searchQuery.trim() === '' ? firstAid : filteredFirstAid;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>First Aid Equipment</Text>
        <Text style={styles.subtitle}>Browse and order essential first aid supplies</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search equipment by name, category, or description..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      <FlatList
        data={displayFirstAid}
        renderItem={renderFirstAidCard}
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
  card: {
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
  headerRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  image: {
    fontSize: 50,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 3,
  },
  price: {
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
  details: {
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
    width: 100,
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

export default FirstAid;