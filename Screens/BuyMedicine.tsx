import React, { Component, useState } from 'react'
import { Text, View ,
     StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  SafeAreaView 
} from 'react-native'

interface Medicine{
    id:string,
    name:string,


}

const BuyMedicine = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMedicines, setFilteredMedcine] = useState<Medicine[]>([]);

      const Medicines: Medicine[] = [
        {
            id: '1',
            name: 'Paracetamol',
        }
      ];


}
