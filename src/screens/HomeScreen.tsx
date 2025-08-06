import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';

import { RootState, AppDispatch } from '../store/store';
import { fetchProducts, deleteProduct } from '../store/slices/productsSlice';
import ProductItem from '../components/products/ProductItem';
import QuickRecipeButton from '../components/recipes/QuickRecipeButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Product } from '../types/models';
import { getFreshnessColor, getDaysUntilExpiry } from '../utils/productHelpers';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { products, loading, pendingChanges } = useSelector((state: RootState) => state.products);
  const { user, isPro } = useSelector((state: RootState) => state.auth);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    dispatch(fetchProducts());
    
    return () => unsubscribe();
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts());
    setRefreshing(false);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Usuń produkt',
      'Czy na pewno chcesz usunąć ten produkt?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => dispatch(deleteProduct(productId)),
        },
      ],
    );
  };

  const handleProductConsumed = (product: Product) => {
    Alert.alert(
      'Produkt zużyty',
      `Czy dodać "${product.name}" do listy zakupów?`,
      [
        { text: 'Nie', style: 'cancel' },
        {
          text: 'Tak',
          onPress: () => {
            // Add to shopping list logic
            dispatch(deleteProduct(product.id));
          },
        },
      ],
    );
  };

  const sortedProducts = [...products].sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.expiryDate);
    const daysB = getDaysUntilExpiry(b.expiryDate);
    return daysA - daysB;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Twoja Spiżarnia</Text>
      
      <View style={styles.statusRow}>
        {isPro && pendingChanges > 0 && !isOnline && (
          <View style={styles.offlineStatus}>
            <Icon name="wifi-off" size={16} color="#FF6B6B" />
            <Text style={styles.offlineText}>
              {pendingChanges} zmian oczekuje na synchronizację
            </Text>
          </View>
        )}
        
        <View style={styles.connectionStatus}>
          <Icon 
            name={isOnline ? 'wifi' : 'wifi-off'} 
            size={16} 
            color={isOnline ? '#4CAF50' : '#FF6B6B'} 
          />
          <Text style={[styles.connectionText, { color: isOnline ? '#4CAF50' : '#FF6B6B' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Świeże</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Zużyj wkrótce</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Przeterminowane</Text>
        </View>
      </View>
    </View>
  );

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onDelete={() => handleDeleteProduct(item.id)}
            onConsume={() => handleProductConsumed(item)}
            isPro={isPro}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="fridge-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyText}>Brak produktów w spiżarni</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Text style={styles.addFirstButtonText}>Dodaj pierwszy produkt</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <QuickRecipeButton products={products} />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default HomeScreen;
