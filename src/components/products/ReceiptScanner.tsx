import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Product } from '../../types/models';
import { cloudFunctions } from '../../services/firebase/config';

interface ReceiptScannerProps {
  onScan: (products: Partial<Product>[]) => void;
  onClose: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScan, onClose }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<Partial<Product>[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  const selectImage = (source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
    
    launcher(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri || null);
        processReceipt(response.assets[0].base64 || '');
      }
    });
  };

  const processReceipt = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const result = await cloudFunctions.processReceipt({ image: base64Image });
      const products = result.data as Partial<Product>[];
      
      setExtractedProducts(products);
      setSelectedProducts(new Set(products.map((_, index) => index)));
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się przetworzyć paragonu');
      console.error('Receipt processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleProductSelection = (index: number) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedProducts(newSelection);
  };

  const handleConfirm = () => {
    const productsToAdd = extractedProducts.filter((_, index) => 
      selectedProducts.has(index)
    );
    
    if (productsToAdd.length === 0) {
      Alert.alert('Błąd', 'Wybierz przynajmniej jeden produkt');
      return;
    }
    
    onScan(productsToAdd);
  };

  const renderProductItem = (product: Partial<Product>, index: number) => {
    const isSelected = selectedProducts.has(index);
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.productItem, isSelected && styles.productItemSelected]}
        onPress={() => toggleProductSelection(index)}
      >
        <View style={styles.checkbox}>
          {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name || 'Nieznany produkt'}</Text>
          {product.quantity && (
            <Text style={styles.productQuantity}>
              {product.quantity} {product.unit || ''}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {/* Open edit modal */}}
        >
          <Icon name="pencil" size={20} color="#666666" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skanuj paragon</Text>
        <View style={{ width: 28 }} />
      </View>

      {!imageUri && !isProcessing && (
        <View style={styles.content}>
          <Icon name="receipt" size={80} color="#E0E0E0" />
          <Text style={styles.title}>Wybierz źródło paragonu</Text>
          
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={() => selectImage('camera')}
          >
            <Icon name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.sourceButtonText}>Zrób zdjęcie</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sourceButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => selectImage('gallery')}
          >
            <Icon name="image" size={24} color="#FFFFFF" />
            <Text style={styles.sourceButtonText}>Wybierz z galerii</Text>
          </TouchableOpacity>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Wskazówki:</Text>
            <Text style={styles.tipItem}>• Upewnij się, że paragon jest dobrze oświetlony</Text>
            <Text style={styles.tipItem}>• Zdjęcie powinno być ostre i wyraźne</Text>
            <Text style={styles.tipItem}>• Cały paragon powinien być widoczny</Text>
          </View>
        </View>
      )}

      {imageUri && !isProcessing && extractedProducts.length === 0 && (
        <View style={styles.content}>
          <Image source={{ uri: imageUri }} style={styles.receiptImage} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => {
              setImageUri(null);
              setExtractedProducts([]);
            }}
          >
            <Text style={styles.retakeButtonText}>Zrób ponownie</Text>
          </TouchableOpacity>
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.processingText}>Analizowanie paragonu...</Text>
          <Text style={styles.processingSubtext}>To może potrwać kilka sekund</Text>
        </View>
      )}

      {extractedProducts.length > 0 && !isProcessing && (
        <>
          <ScrollView style={styles.productsList}>
            <Text style={styles.extractedTitle}>
              Znalezione produkty ({extractedProducts.length})
            </Text>
            <Text style={styles.extractedSubtitle}>
              Zaznacz produkty, które chcesz dodać
            </Text>
            
            {extractedProducts.map(renderProductItem)}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => {
                setImageUri(null);
                setExtractedProducts([]);
                setSelectedProducts(new Set());
              }}
            >
              <Text style={styles.cancelButtonText}>Anuluj</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Dodaj ({selectedProducts.size})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 24,
    marginBottom: 32,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 280,
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  tips: {
    marginTop: 48,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  receiptImage: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  retakeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 24,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  productsList: {
    flex: 1,
    padding: 16,
  },
  extractedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  extractedSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productItemSelected: {
    borderColor: '#2196F3',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReceiptScanner;
