import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../store/store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addProduct } from '../store/slices/productsSlice';
import ProductForm from '../components/product/ProductForm';
import BarcodeScanner from '../components/product/BarcodeScanner';
import ReceiptScanner from '../components/product/ReceiptScanner';
import { Product } from '../types/models';
import { OpenFoodFactsApiService } from '../services/api/openFoodFactsApi';

type AddProductRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddProductRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isPro } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.products);
  
  const [scanMode, setScanMode] = useState<'none' | 'barcode' | 'receipt'>('none');
  const [scannedData, setScannedData] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (route.params?.barcode) {
      handleBarcodeScan(route.params.barcode);
    }
  }, [route.params?.barcode]);

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const productData = await OpenFoodFactsApiService.scanBarcode(barcode);
      setScannedData(productData);
      setScanMode('none');
      Alert.alert('Sukces', 'Produkt został rozpoznany!');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się rozpoznać produktu');
    }
  };

  const handleReceiptScan = (products: Partial<Product>[]) => {
    setScanMode('none');
    Alert.alert(
      'Sukces',
      `Zeskanowano ${products.length} produktów z paragonu`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Handle multiple products
            products.forEach(product => {
              dispatch(addProduct({
                ...product,
                ownerId: user?.id || '',
                addedBy: user?.displayName || 'Użytkownik',
              } as Omit<Product, 'id'>));
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSubmit = async (formData: Partial<Product>) => {
    try {
      await dispatch(addProduct({
        ...formData,
        ownerId: user?.id || '',
        addedBy: user?.displayName || 'Użytkownik',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<Product, 'id'>)).unwrap();
      
      Alert.alert(
        'Sukces',
        'Produkt został dodany',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać produktu');
    }
  };

  if (scanMode === 'barcode') {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScan}
        onClose={() => setScanMode('none')}
      />
    );
  }

  if (scanMode === 'receipt') {
    return (
      <ReceiptScanner
        onScan={handleReceiptScan}
        onClose={() => setScanMode('none')}
      />
    );
  }

  return (
    <View style={styles.container}>
      {isPro && (
        <View style={styles.scanButtons}>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: '#2196F3' }]}
            onPress={() => setScanMode('barcode')}
          >
            <Icon name="barcode-scan" size={24} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Skanuj kod</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => setScanMode('receipt')}
          >
            <Icon name="receipt" size={24} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Skanuj paragon</Text>
          </TouchableOpacity>
        </View>
      )}

      <ProductForm
        initialData={scannedData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scanButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddProductScreen;
