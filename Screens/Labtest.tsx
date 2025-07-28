import { useState } from "react";
import{
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
}from'react-native';

interface test{
    id:string,
    name:string,
    type:string,
    description:string,
    price:string,
    image:string,


};
const LabTests = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredtests, setFilteredtests] = useState<test[]>([]);


  const tests: test[] = [
    {
      id: '1',
      name: 'Complete Blood Count',
      type: 'Blood Test',
      description: 'Measures different components of blood including red and white blood cells, hemoglobin, and platelets.',
      price: '₹400',
      image: 'https://via.placeholder.com/100x100?text=CBC',
    },
    {
      id: '2',
      name: 'Liver Function Test',
      type: 'Blood Test',
      description: 'Assesses the health of your liver by measuring levels of proteins, liver enzymes, and bilirubin.',
      price: '₹700',
      image: 'https://via.placeholder.com/100x100?text=LFT',
    },
    {
      id: '3',
      name: 'Kidney Function Test',
      type: 'Blood Test',
      description: 'Evaluates how well your kidneys are working by measuring levels of urea, creatinine, and other substances.',
      price: '₹650',
      image: 'https://via.placeholder.com/100x100?text=KFT',
    },
    {
      id: '4',
      name: 'Thyroid Profile',
      type: 'Blood Test',
      description: 'Checks the function of your thyroid gland by measuring T3, T4, and TSH levels.',
      price: '₹500',
      image: 'https://via.placeholder.com/100x100?text=Thyroid',
    },
    {
      id: '5',
      name: 'Blood Sugar Test',
      type: 'Blood Test',
      description: 'Measures the amount of glucose in your blood.',
      price: '₹150',
      image: 'https://via.placeholder.com/100x100?text=Sugar',
    },
    {
      id: '6',
      name: 'Lipid Profile',
      type: 'Blood Test',
      description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.',
      price: '₹800',
      image: 'https://via.placeholder.com/100x100?text=Lipid',
    },
    {
      id: '7',
      name: 'Urine Routine',
      type: 'Urine Test',
      description: 'Analyzes urine for a wide range of disorders, such as urinary tract infection, kidney disease, and diabetes.',
      price: '₹200',
      image: 'https://via.placeholder.com/100x100?text=Urine',
    },
    {
      id: '8',
      name: 'Vitamin D Test',
      type: 'Blood Test',
      description: 'Measures the level of vitamin D in your blood.',
      price: '₹1200',
      image: 'https://via.placeholder.com/100x100?text=VitD',
    },
    {
      id: '9',
      name: 'Vitamin B12 Test',
      type: 'Blood Test',
      description: 'Measures the amount of vitamin B12 in your blood.',
      price: '₹900',
      image: 'https://via.placeholder.com/100x100?text=VitB12',
    },
    {
      id: '10',
      name: 'Electrolyte Panel',
      type: 'Blood Test',
      description: 'Measures the levels of electrolytes like sodium, potassium, and chloride in your blood.',
      price: '₹400',
      image: 'https://via.placeholder.com/100x100?text=Electrolyte',
    },
    {
      id: '11',
      name: 'HbA1c',
      type: 'Blood Test',
      description: 'Measures average blood sugar levels over the past 2-3 months.',
      price: '₹600',
      image: 'https://via.placeholder.com/100x100?text=HbA1c',
    },
    {
      id: '12',
      name: 'Prostate Specific Antigen',
      type: 'Blood Test',
      description: 'Screening test for prostate cancer.',
      price: '₹850',
      image: 'https://via.placeholder.com/100x100?text=PSA',
    },
    {
      id: '13',
      name: 'Pregnancy Test',
      type: 'Urine Test',
      description: 'Detects the presence of hCG hormone in urine.',
      price: '₹100',
      image: 'https://via.placeholder.com/100x100?text=Pregnancy',
    },
    {
      id: '14',
      name: 'Malaria Test',
      type: 'Blood Test',
      description: 'Detects malaria parasites in the blood.',
      price: '₹350',
      image: 'https://via.placeholder.com/100x100?text=Malaria',
    },
    {
      id: '15',
      name: 'Dengue NS1 Antigen',
      type: 'Blood Test',
      description: 'Detects dengue virus antigen in the blood.',
      price: '₹900',
      image: 'https://via.placeholder.com/100x100?text=Dengue',
    },
    {
      id: '16',
      name: 'HIV Test',
      type: 'Blood Test',
      description: 'Detects antibodies to HIV in the blood.',
      price: '₹500',
      image: 'https://via.placeholder.com/100x100?text=HIV',
    },
    {
      id: '17',
      name: 'Widal Test',
      type: 'Blood Test',
      description: 'Detects typhoid and paratyphoid fever.',
      price: '₹250',
      image: 'https://via.placeholder.com/100x100?text=Widal',
    },
    {
      id: '18',
      name: 'Semen Analysis',
      type: 'Lab Test',
      description: 'Analyzes semen for fertility assessment.',
      price: '₹700',
      image: 'https://via.placeholder.com/100x100?text=Semen',
    },
    {
      id: '19',
      name: 'Stool Routine',
      type: 'Lab Test',
      description: 'Analyzes stool for infections, digestive problems, and other conditions.',
      price: '₹300',
      image: 'https://via.placeholder.com/100x100?text=Stool',
    },
    {
      id: '20',
      name: 'X-Ray Chest',
      type: 'Imaging',
      description: 'Imaging test to view the chest, lungs, and heart.',
      price: '₹1000',
      image: 'https://via.placeholder.com/100x100?text=XRay',
    },
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredtests([]);
    } else {
      const filtered = tests.filter(tests =>
        tests.name.toLowerCase().includes(text.toLowerCase()) ||
        tests.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredtests(filtered);
    }
  };

  const renderLabTestCard = ({ item }: { item: test }) => (
    <TouchableOpacity style={styles.labTestCard}>
      <View style={styles.labTestHeader}>
        <Image source={{ uri: item.image }} style={styles.labTestImage} />
        <View style={styles.labTestInfo}>
          <Text style={styles.labTestName}>{item.name}</Text>
          <Text style={styles.labTestType}>{item.type}</Text>
          <Text style={styles.labTestPrice}>{item.price}</Text>
        </View>
      </View>
      <View style={styles.labTestDetails}>
        <Text style={styles.labTestDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Test</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const displayTests = searchQuery.trim() === '' ? tests : filteredtests;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lab Tests</Text>
        <Text style={styles.subtitle}>Browse and book diagnostic lab tests</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search lab tests by name or description..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      <FlatList
        data={displayTests}
        renderItem={renderLabTestCard}
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
    backgroundColor: '#e0f7fa',
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
  labTestCard: {
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
  labTestHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  labTestImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
  },
  labTestInfo: {
    flex: 1,
  },
  labTestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  labTestType: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 3,
  },
  labTestPrice: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  labTestDetails: {
    marginBottom: 15,
  },
  labTestDescription: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
    lineHeight: 20,
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

export default LabTests;
