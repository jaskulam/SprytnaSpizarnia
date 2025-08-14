import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '@/store/store';
import { fetchProducts, selectFilteredProducts } from '@/store/slices/productsSlice';
import { RootStackParamList } from '@/navigation/AppNavigator';
import ProductItem from '@/components/products/ProductItem';
import { colors, spacing, typography } from '@/themes';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const products = useSelector(selectFilteredProducts);
  const { isLoading, isOnline, pendingChanges } = useSelector((state: RootState) => state.products);
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchProducts());
    }
  }, [user, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts());
    setRefreshing(false);
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Twoja Spiżarnia</Text>
      <View style={styles.statusRow}>
        <View style={styles.connectionStatus}>
          <Icon 
            name={isOnline ? 'wifi' : 'wifi-off'} 
            size={16} 
            color={isOnline ? colors.success : colors.danger}
          />
          <Text style={[styles.connectionText, { color: isOnline ? colors.success : colors.danger }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        {pendingChanges > 0 && !isOnline && (
          <Text style={styles.pendingText}>{pendingChanges} zmian w kolejce</Text>
        )}
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <ProductItem 
      product={item} 
      onPress={() => handleProductPress(item.id)}
    />
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Brak produktów</Text>
            <Text style={styles.emptyDesc}>Dodaj pierwszy produkt do swojej spiżarni</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddProduct}>
              <Text style={styles.addFirstButtonText}>Dodaj produkt</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddProduct}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    ...typography.caption,
    marginLeft: 6,
  },
  pendingText: {
    ...typography.caption,
    color: colors.warning,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomeScreen;
