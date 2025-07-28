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

interface Equipment {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  manufacturer: string;
  inStock: boolean;
  image: string;
}

const SurgicalEquipment = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);

  const equipment: Equipment[] = [
    {
      id: '1',
      name: 'Stethoscope',
      category: 'Medical Equipment',
      price: '$45.00',
      description: 'Used to listen to heart and lung sounds',
      manufacturer: '3M Littmann',
      inStock: true,
      image: '🩺'
    },
    {
      id: '2',
      name: 'Surgical Scalpel',
      category: 'Surgical Equipment',
      price: '$12.99',
      description: 'Precision blade used in surgeries',
      manufacturer: 'Swann-Morton',
      inStock: true,
      image: '🔪'
    },
    {
      id: '3',
      name: 'Thermometer',
      category: 'Medical Equipment',
      price: '$9.99',
      description: 'Measures body temperature',
      manufacturer: 'Braun',
      inStock: true,
      image: '🌡️'
    },
    {
      id: '4',
      name: 'Blood Pressure Monitor',
      category: 'Medical Equipment',
      price: '$39.99',
      description: 'Monitors blood pressure levels',
      manufacturer: 'Omron',
      inStock: true,
      image: '🩸'
    },
    {
      id: '5',
      name: 'Surgical Mask',
      category: 'Surgical Equipment',
      price: '$0.50',
      description: 'Protective mask for procedures',
      manufacturer: '3M',
      inStock: true,
      image: '😷'
    },
    {
      id: '6',
      name: 'Syringe 5ml',
      category: 'Medical Equipment',
      price: '$0.25',
      description: 'Used to inject or withdraw fluids',
      manufacturer: 'BD',
      inStock: true,
      image: '💉'
    },
    {
      id: '7',
      name: 'Crutches',
      category: 'Medical Equipment',
      price: '$29.99',
      description: 'Assist with walking after injury',
      manufacturer: 'Drive Medical',
      inStock: true,
      image: '🦯'
    },
    {
      id: '8',
      name: 'Surgical Gloves',
      category: 'Surgical Equipment',
      price: '$0.30',
      description: 'Sterile gloves for medical procedures',
      manufacturer: 'Ansell',
      inStock: true,
      image: '🧤'
    },
    {
      id: '9',
      name: 'IV Drip Stand',
      category: 'Medical Equipment',
      price: '$75.00',
      description: 'Holds IV fluid bags',
      manufacturer: 'Hospitech',
      inStock: true,
      image: '🧷'
    },
    {
      id: '10',
      name: 'Wheelchair',
      category: 'Medical Equipment',
      price: '$149.00',
      description: 'Manual wheelchair for mobility assistance',
      manufacturer: 'Invacare',
      inStock: true,
      image: '♿'
    },
    {
      id: '11',
      name: 'Defibrillator',
      category: 'Medical Equipment',
      price: '$799.00',
      description: 'Used for emergency cardiac resuscitation',
      manufacturer: 'Philips',
      inStock: true,
      image: '⚡'
    },
    {
      id: '12',
      name: 'Pulse Oximeter',
      category: 'Medical Equipment',
      price: '$19.99',
      description: 'Measures oxygen saturation',
      manufacturer: 'Zacurate',
      inStock: true,
      image: '🫁'
    },
    {
      id: '13',
      name: 'Surgical Scissors',
      category: 'Surgical Equipment',
      price: '$8.99',
      description: 'Used for cutting tissues and sutures',
      manufacturer: 'Miltex',
      inStock: true,
      image: '✂️'
    },
    {
      id: '14',
      name: 'Otoscope',
      category: 'Medical Equipment',
      price: '$39.99',
      description: 'Examines ears and eardrum',
      manufacturer: 'Welch Allyn',
      inStock: true,
      image: '👂'
    },
    {
      id: '15',
      name: 'Bandage Roll',
      category: 'Medical Equipment',
      price: '$2.99',
      description: 'Wraps wounds or injuries',
      manufacturer: 'Band-Aid',
      inStock: true,
      image: '🩹'
    },
    {
      id: '16',
      name: 'Surgical Gown',
      category: 'Surgical Equipment',
      price: '$12.50',
      description: 'Protective gown for surgeries',
      manufacturer: 'Cardinal Health',
      inStock: true,
      image: '🧥'
    },
    {
      id: '17',
      name: 'Hospital Bed',
      category: 'Medical Equipment',
      price: '$999.00',
      description: 'Adjustable bed for patient comfort',
      manufacturer: 'Hill-Rom',
      inStock: true,
      image: '🛏️'
    },
    {
      id: '18',
      name: 'Infusion Pump',
      category: 'Medical Equipment',
      price: '$450.00',
      description: 'Delivers fluids and medications',
      manufacturer: 'Baxter',
      inStock: true,
      image: '💧'
    },
    {
      id: '19',
      name: 'Medical Trolley',
      category: 'Medical Equipment',
      price: '$120.00',
      description: 'Mobile trolley for tools and instruments',
      manufacturer: 'Medline',
      inStock: true,
      image: '🛒'
    },
    {
      id: '20',
      name: 'Surgical Retractor',
      category: 'Surgical Equipment',
      price: '$29.00',
      description: 'Holds incision or wound open',
      manufacturer: 'Aesculap',
      inStock: true,
      image: '🔧'
    },
    {
      id: '21',
      name: 'Surgical Drapes',
      category: 'Surgical Equipment',
      price: '$6.00',
      description: 'Sterile covering used during surgery',
      manufacturer: 'Medline',
      inStock: true,
      image: '🧻'
    },
    {
      id: '22',
      name: 'ECG Machine',
      category: 'Medical Equipment',
      price: '$499.00',
      description: 'Records heart activity',
      manufacturer: 'GE Healthcare',
      inStock: true,
      image: '📈'
    },
    {
      id: '23',
      name: 'Anesthesia Mask',
      category: 'Surgical Equipment',
      price: '$15.00',
      description: 'Used for administering anesthesia',
      manufacturer: 'Ambu',
      inStock: true,
      image: '🎭'
    },
    {
      id: '24',
      name: 'Medical Examination Light',
      category: 'Medical Equipment',
      price: '$230.00',
      description: 'Bright, focused light for examinations',
      manufacturer: 'DRE',
      inStock: true,
      image: '💡'
    },
    {
      id: '25',
      name: 'Surgical Needle Holder',
      category: 'Surgical Equipment',
      price: '$14.99',
      description: 'Holds needle during suturing',
      manufacturer: 'Hu-Friedy',
      inStock: true,
      image: '🪡'
    },
    {
      id: '26',
      name: 'Medical Waste Bin',
      category: 'Medical Equipment',
      price: '$18.00',
      description: 'For disposal of medical waste',
      manufacturer: 'Rubbermaid',
      inStock: true,
      image: '🗑️'
    },
    {
      id: '27',
      name: 'Tourniquet',
      category: 'Medical Equipment',
      price: '$3.50',
      description: 'Used to control blood flow',
      manufacturer: 'Zefon',
      inStock: true,
      image: '🩼'
    },
    {
      id: '28',
      name: 'Sterilization Tray',
      category: 'Surgical Equipment',
      price: '$35.00',
      description: 'Holds instruments for sterilization',
      manufacturer: 'Aesculap',
      inStock: true,
      image: '📦'
    },
    {
      id: '29',
      name: 'Surgical Headlight',
      category: 'Surgical Equipment',
      price: '$120.00',
      description: 'Head-mounted light for precision',
      manufacturer: 'Enova',
      inStock: true,
      image: '🔦'
    },
    {
      id: '30',
      name: 'Medical Cotton Roll',
      category: 'Medical Equipment',
      price: '$1.50',
      description: 'Used for cleaning or dressing wounds',
      manufacturer: 'Johnson & Johnson',
      inStock: true,
      image: '🧽'
    },
    {
      id: '31',
      name: 'Autoclave Machine',
      category: 'Medical Equipment',
      price: '$1,200.00',
      description: 'Sterilizes equipment and instruments',
      manufacturer: 'Tuttnauer',
      inStock: true,
      image: '🔥'
    },
    {
      id: '32',
      name: 'Surgical Suction Device',
      category: 'Surgical Equipment',
      price: '$260.00',
      description: 'Removes fluids during surgery',
      manufacturer: 'Medela',
      inStock: true,
      image: '🌀'
    },
    {
      id: '33',
      name: 'Surgical Tape',
      category: 'Medical Equipment',
      price: '$1.00',
      description: 'Used to secure dressings',
      manufacturer: '3M',
      inStock: true,
      image: '📏'
    },
    {
      id: '34',
      name: 'Medical Goggles',
      category: 'Medical Equipment',
      price: '$9.00',
      description: 'Eye protection during procedures',
      manufacturer: 'Honeywell',
      inStock: true,
      image: '🥽'
    },
    {
      id: '35',
      name: 'Scalpel Handle',
      category: 'Surgical Equipment',
      price: '$7.99',
      description: 'Holds surgical blades securely',
      manufacturer: 'Swann-Morton',
      inStock: true,
      image: '🖊️'
    },
    {
      id: '36',
      name: 'Surgical Bowl',
      category: 'Surgical Equipment',
      price: '$11.00',
      description: 'Holds sterilized instruments or fluids',
      manufacturer: 'SteriWare',
      inStock: true,
      image: '🥣'
    },
    {
      id: '37',
      name: 'Medical Clipboard',
      category: 'Medical Equipment',
      price: '$6.50',
      description: 'Holds patient charts and forms',
      manufacturer: 'Officemate',
      inStock: true,
      image: '📋'
    },
    {
      id: '38',
      name: 'Surgical Elevator',
      category: 'Surgical Equipment',
      price: '$22.00',
      description: 'Used in bone or tooth procedures',
      manufacturer: 'Hu-Friedy',
      inStock: true,
      image: '🛠️'
    },
    {
      id: '39',
      name: 'Surgical Forceps',
      category: 'Surgical Equipment',
      price: '$10.99',
      description: 'Grasps tissues during surgery',
      manufacturer: 'Sklar',
      inStock: true,
      image: '🧲'
    },
    {
      id: '40',
      name: 'Medical ID Bracelet',
      category: 'Medical Equipment',
      price: '$4.00',
      description: 'Identifies patient during treatment',
      manufacturer: 'Mediband',
      inStock: true,
      image: '🎟️'
    },
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredEquipments([]);
    } else {
      const filtered = equipment.filter(equipment =>
        equipment.name.toLowerCase().includes(text.toLowerCase()) ||
        equipment.category.toLowerCase().includes(text.toLowerCase()) ||
        equipment.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEquipments(filtered);
    }
  };

  const displayEquipments = searchQuery.trim() === '' ? equipment : filteredEquipments;

  const renderEquipmentCard = ({ item }: { item: Equipment }) => (
    <TouchableOpacity style={styles.equipmentCard}>
      <View style={styles.equipmentHeader}>
        <Text style={styles.equipmentImage}>{item.image}</Text>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          <Text style={styles.equipmentCategory}>{item.category}</Text>
          <Text style={styles.equipmentPrice}>{item.price}</Text>
          <View style={styles.stockContainer}>
            <Text style={[styles.stockStatus, { color: item.inStock ? '#27ae60' : '#e74c3c' }]}>
              {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.equipmentDetails}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Surgical Equipment</Text>
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
        data={displayEquipments}
        renderItem={renderEquipmentCard}
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
  equipmentCard: {
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
  equipmentHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  equipmentImage: {
    fontSize: 50,
    marginRight: 15,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  equipmentCategory: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 3,
  },
  equipmentPrice: {
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
  equipmentDetails: {
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

export default SurgicalEquipment;

