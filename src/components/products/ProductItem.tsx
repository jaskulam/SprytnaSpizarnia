import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Product } from '../../types/models';
import { RootStackParamList } from '../../navigation/AppNavigator';
import SwipeableListItem from '../common/SwipeableListItem';
import { 
  getFreshnessColor, 
  formatProductQuantity,
  getExpiryMessage,
} from '../../utils/productHelpers';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

interface ProductItemProps {
  product: Product;
  onDelete: () => void;
  onConsume: () => void;
  isPro: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onDelete,
  onConsume,
  isPro,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const category = PRODUCT_CATEGORIES[product.category];
  const freshnessColor = getFreshnessColor(product.expiryDate);
  const expiryMessage = getExpiryMessage(product.expiryDate);

  const handlePress = () => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const renderContent = () => (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.categoryIcon}>
          <Icon 
            name={category.icon} 
            size={24} 
            color="#666666"
            style={[styles.icon, { backgroundColor: category.color }]}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={[styles.freshnessIndicator, { backgroundColor: freshnessColor }]} />
          </View>

          <View style={styles.details}>
            <Text style={styles.quantity}>
              {formatProductQuantity(product.quantity, product.unit)}
            </Text>
            {isPro && product.location && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.location}>📍 {product.location}</Text>
              </>
            )}
          </View>

          <Text style={[styles.expiry, { color: freshnessColor }]}>
            {expiryMessage}
          </Text>
        </View>

        {product.imageUrl && (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SwipeableListItem
      onSwipeLeft={onDelete}
      onSwipeRight={onConsume}
      leftIcon="check-circle"
      rightIcon="delete"
      leftColor="#4CAF50"
      rightColor="#F44336"
      leftText="Zużyte"
      rightText="Usuń"
    >
      {renderContent()}
    </SwipeableListItem>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 12,
  },
  icon: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  freshnessIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666666',
  },
  separator: {
    marginHorizontal: 6,
    color: '#999999',
  },
  location: {
    fontSize: 14,
    color: '#666666',
  },
  expiry: {
    fontSize: 12,
    fontWeight: '500',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default ProductItem;
