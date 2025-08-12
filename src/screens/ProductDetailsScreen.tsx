import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getExpiryMessage, getFreshnessColor, formatProductQuantity } from '../utils/productHelpers';

 type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const ProductDetailsScreen: React.FC = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const { productId } = route.params;
  const product = useSelector((state: RootState) =>
    state.products.items.find((p) => p.id === productId)
  );

  if (!product) {
    return (
      <View style={styles.center}> 
        <Text>Nie znaleziono produktu.</Text>
      </View>
    );
  }

  const color = getFreshnessColor(product.expiryDate);
  const expiry = getExpiryMessage(product.expiryDate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{product.name}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Ilość</Text>
        <Text style={styles.value}>{formatProductQuantity(product.quantity, product.unit)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Kategoria</Text>
        <Text style={styles.value}>{product.category || '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Lokalizacja</Text>
        <Text style={styles.value}>{product.location}</Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: color }]} />
        <Text style={[styles.expiry, { color }]}>{expiry}</Text>
      </View>

      {product.notes ? (
        <View style={styles.notes}>
          <Text style={styles.sectionTitle}>Notatki</Text>
          <Text style={styles.notesText}>{product.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  label: { color: '#777' },
  value: { color: '#222', fontWeight: '600' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  badge: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  expiry: { fontWeight: '600' },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16, backgroundColor: '#F3F3F3' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  notes: { marginTop: 16 },
  notesText: { color: '#333', lineHeight: 20 },
});

export default ProductDetailsScreen;
