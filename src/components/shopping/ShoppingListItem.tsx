import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShoppingListItem as ShoppingListItemType } from '../../types/models';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { formatRelativeDate } from '../../utils/dateHelpers';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: () => void;
  onEdit: () => void;
  showDetails: boolean;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onToggle,
  onEdit,
  showDetails,
}) => {
  const category = PRODUCT_CATEGORIES[item.category];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainRow}>
          <Text style={[styles.name, item.checked && styles.nameChecked]}>
            {item.productName}
          </Text>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Icon name={category.icon} size={18} color="#666666" />
          </View>
        </View>

        {(item.quantity || item.notes || showDetails) && (
          <View style={styles.detailsRow}>
            {item.quantity && (
              <Text style={[styles.quantity, item.checked && styles.detailsChecked]}>
                {item.quantity} {item.unit || ''}
              </Text>
            )}
            
            {item.notes && (
              <>
                {item.quantity && <Text style={styles.separator}>•</Text>}
                <Text style={[styles.notes, item.checked && styles.detailsChecked]}>
                  {item.notes}
                </Text>
              </>
            )}

            {showDetails && item.addedBy && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={[styles.addedBy, item.checked && styles.detailsChecked]}>
                  {item.addedBy}
                </Text>
              </>
            )}
          </View>
        )}

        {showDetails && item.addedAt && (
          <Text style={[styles.timestamp, item.checked && styles.detailsChecked]}>
            {formatRelativeDate(item.addedAt)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={onEdit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="pencil-outline" size={20} color="#666666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  nameChecked: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666666',
  },
  notes: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    flex: 1,
  },
  addedBy: {
    fontSize: 14,
    color: '#666666',
  },
  separator: {
    marginHorizontal: 6,
    color: '#999999',
  },
  detailsChecked: {
    color: '#999999',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  editButton: {
    padding: 4,
  },
});

export default ShoppingListItem;
