import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

interface HealthPackage {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  testsIncluded: string;
  provider: string;
  inStock: boolean;
  image: string; // emoji
}

const HealthCheckup = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPackages, setFilteredPackages] = useState<HealthPackage[]>([]);
  const packages: HealthPackage[] = [
    {
      id: '1',
      name: 'Full Body Checkup',
      category: 'Comprehensive',
      price: '₹1999',
      description: 'Covers all major organs and systems. Recommended annually.',
      testsIncluded: 'CBC, LFT, KFT, Lipid, Thyroid, Sugar, Urine, ECG, X-ray',
      provider: 'MediCare Labs',
      inStock: true,
      image: '🩺',
    },
    {
      id: '2',
      name: 'Diabetes Check',
      category: 'Diabetes',
      price: '₹499',
      description: 'Essential tests for diabetes screening and monitoring.',
      testsIncluded: 'Fasting Sugar, HbA1c, Urine Sugar',
      provider: 'HealthPlus Diagnostics',
      inStock: true,
      image: '🍬',
    },
    {
      id: '3',
      name: 'Heart Check',
      category: 'Cardiac',
      price: '₹1299',
      description: 'Tests for heart health and risk factors.',
      testsIncluded: 'ECG, Lipid Profile, TMT, Blood Pressure',
      provider: 'CardioCare',
      inStock: false,
      image: '❤️',
    },
    {
      id: '4',
      name: 'Thyroid Profile',
      category: 'Hormonal',
      price: '₹699',
      description: 'Comprehensive thyroid function tests.',
      testsIncluded: 'TSH, T3, T4',
      provider: 'ThyroLab',
      inStock: true,
      image: '🦋',
    },
    {
      id: '5',
      name: 'Kidney Function Test',
      category: 'Renal',
      price: '₹799',
      description: 'Checks kidney health and function.',
      testsIncluded: 'Urea, Creatinine, Uric Acid, Electrolytes',
      provider: 'RenalCare',
      inStock: true,
      image: '🧪',
    },
    {
      id: '6',
      name: 'Liver Function Test',
      category: 'Hepatic',
      price: '₹899',
      description: 'Assesses liver health and detects disorders.',
      testsIncluded: 'SGPT, SGOT, Bilirubin, Albumin',
      provider: 'LiverPlus',
      inStock: true,
      image: '🧬',
    },
    {
      id: '7',
      name: 'Basic Health Check',
      category: 'Basic',
      price: '₹399',
      description: 'Basic screening for common health issues.',
      testsIncluded: 'CBC, Blood Sugar, Urine Routine',
      provider: 'QuickLab',
      inStock: true,
      image: '📝',
    },
    {
      id: '8',
      name: 'Women Wellness Package',
      category: 'Women',
      price: '₹1499',
      description: 'Special package for women’s health.',
      testsIncluded: 'CBC, Thyroid, Calcium, Vitamin D, Pap Smear',
      provider: 'FemCare Labs',
      inStock: true,
      image: '👩‍⚕️',
    },
    {
      id: '9',
      name: 'Senior Citizen Checkup',
      category: 'Senior',
      price: '₹1799',
      description: 'Comprehensive tests for elderly health.',
      testsIncluded: 'CBC, Lipid, Sugar, Kidney, Liver, ECG, Vitamin B12',
      provider: 'ElderCare Diagnostics',
      inStock: false,
      image: '👴',
    },
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPackages([]);
    } else {
      const filtered = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(text.toLowerCase()) ||
        pkg.category.toLowerCase().includes(text.toLowerCase()) ||
        pkg.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPackages(filtered);
    }
  };

  const renderPackageCard = ({ item }: { item: HealthPackage }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.image}>{item.image}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>{item.price}</Text>
          <View style={styles.stockContainer}>
            <Text style={[styles.stockStatus, { color: item.inStock ? '#27ae60' : '#e74c3c' }] }>
              {item.inStock ? '✅ Available' : '❌ Unavailable'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Tests Included:</Text>
          <Text style={styles.detailValue}>{item.testsIncluded}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Provider:</Text>
          <Text style={styles.detailValue}>{item.provider}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.addToCartButton, !item.inStock && styles.disabledButton]}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const displayPackages = searchQuery.trim() === '' ? packages : filteredPackages;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Checkup Packages</Text>
        <Text style={styles.subtitle}>Choose from a variety of health checkup packages</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search packages by name, category, or description..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      <FlatList
        data={displayPackages}
        renderItem={renderPackageCard}
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
    width: 110,
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

export default HealthCheckup; 