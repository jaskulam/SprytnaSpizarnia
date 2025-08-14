import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Product } from '../../types/product';
import { deleteProduct } from '../../store/slices/productsSlice';
import type { AppDispatch } from '../../store/store';
// Local design tokens (replace with your theme system if available)
const colors = {
  danger: '#F44336',
  warning: '#FFC107',
  success: '#4CAF50',
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#212121',
  textSecondary: '#757575',
};
const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
};
const typography = {
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '700' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

interface ProductItemProps {
  product: Product;
  onPress: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Get freshness color
  const getFreshnessColor = () => {
    if (daysUntilExpiry <= 0) return colors.danger;
    if (daysUntilExpiry <= 3) return colors.warning;
    return colors.success;
  };

  // Pan responder for swipe to delete
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          // Swipe left enough to delete
          Animated.timing(translateX, {
            toValue: -1000,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            handleDelete();
          });
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert(
      'Usuń produkt',
      `Czy na pewno chcesz usunąć "${product.name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => dispatch(deleteProduct(product.id)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.deleteBackground}>
        <Icon name="delete" size={24} color={colors.white} />
      </View>
      
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.content} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.leftContent}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.quantity}>{product.quantity}</Text>
            {!!product.location && (
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={12} color={colors.textSecondary} />
                <Text style={styles.location}>{product.location}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.rightContent}>
            <View style={[styles.freshnessIndicator, { backgroundColor: getFreshnessColor() }]} />
            <Text style={styles.daysText}>
              {daysUntilExpiry > 0 ? `${daysUntilExpiry} dni` : 'Przeterminowane'}
            </Text>
            <Text style={styles.dateText}>
              {new Date(product.expiryDate).toLocaleDateString('pl-PL')}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.lg,
    borderRadius: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftContent: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quantity: {
    ...typography.body,
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  freshnessIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  daysText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ProductItem;
