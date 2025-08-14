import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../store/store';
import {
  fetchShoppingLists,
  addItemToList,
  toggleItemInList,
  createShoppingList,
  deleteItemFromList,
  shareList,
} from '../store/slices/shoppingSlice';
import SwipeableListItem from '../components/common/SwipeableListItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShoppingList, ShoppingListItem, ProductCategory } from '../types/models';
import { PRODUCT_CATEGORIES } from '../constants/categories';

const ShoppingListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { lists, currentListId, isLoading } = useSelector(
    (state: RootState) => state.shopping
  );
  const { user, isPro, familyId } = useSelector((state: RootState) => state.auth);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ProductCategory>('other');
  const [showListSelector, setShowListSelector] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const currentList = lists.find(list => list.id === currentListId);

  useEffect(() => {
    dispatch(fetchShoppingLists());
  }, [dispatch]);

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę produktu');
      return;
    }

    if (!currentList) return;

    const newItem: Omit<ShoppingListItem, 'id'> = {
      productName: newItemName.trim(),
      quantity: newItemQuantity ? parseFloat(newItemQuantity) : undefined,
      category: newItemCategory,
      checked: false,
      addedBy: user?.displayName || 'Użytkownik',
      addedAt: new Date(),
    };

    dispatch(addItemToList({ listId: currentList.id, item: newItem }));
    
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCategory('other');
    setShowAddItem(false);
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    dispatch(toggleItemInList({ listId, itemId }));
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    Alert.alert(
      'Usuń produkt',
      'Czy na pewno chcesz usunąć ten produkt z listy?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => dispatch(deleteItemFromList({ listId, itemId })),
        },
      ]
    );
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę listy');
      return;
    }

    dispatch(createShoppingList({
      name: newListName.trim(),
      ownerId: user?.id || '',
      familyId: familyId,
    }));

    setNewListName('');
    setShowCreateList(false);
  };

  const handleShareList = () => {
    if (!currentList || !isPro) return;

    dispatch(shareList({ 
      listId: currentList.id, 
      email: '' // Would show share modal
    }));
  };

  const groupItemsByCategory = (items: ShoppingListItem[]) => {
    const grouped: Record<ProductCategory, ShoppingListItem[]> = {} as any;
    
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return Object.entries(grouped)
      .filter(([_, items]) => items.length > 0)
      .sort(([a], [b]) => {
        const indexA = Object.keys(PRODUCT_CATEGORIES).indexOf(a);
        const indexB = Object.keys(PRODUCT_CATEGORIES).indexOf(b);
        return indexA - indexB;
      });
  };

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <SwipeableListItem
      onSwipeLeft={() => currentList && handleDeleteItem(currentList.id, item.id)}
      leftIcon="delete"
      leftColor="#F44336"
      leftText="Usuń"
    >
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => currentList && handleToggleItem(currentList.id, item.id)}
      >
        <View style={styles.checkbox}>
          {item.checked && <Icon name="check" size={16} color="#4CAF50" />}
        </View>
        
        <View style={styles.itemContent}>
          <Text style={[
            styles.itemName,
            item.checked && styles.itemNameChecked
          ]}>
            {item.productName}
          </Text>
          {item.quantity && (
            <Text style={styles.itemQuantity}>
              {item.quantity} {item.unit || ''}
            </Text>
          )}
          {isPro && item.addedBy && (
            <Text style={styles.itemAddedBy}>
              Dodane przez: {item.addedBy}
            </Text>
          )}
        </View>

        <Icon
          name={PRODUCT_CATEGORIES[item.category].icon}
          size={20}
          color="#666666"
        />
      </TouchableOpacity>
    </SwipeableListItem>
  );

  const renderCategory = ({ item }: { item: [string, ShoppingListItem[]] }) => {
    const [category, items] = item;
    const categoryInfo = PRODUCT_CATEGORIES[category as ProductCategory];

    return (
      <View style={styles.categorySection}>
        <View style={[styles.categoryHeader, { backgroundColor: categoryInfo.color }]}>
          <Icon name={categoryInfo.icon} size={18} color="#666666" />
          <Text style={styles.categoryTitle}>{categoryInfo.name}</Text>
          <Text style={styles.categoryCount}>{items.length}</Text>
        </View>
        {items.map(item => renderItem({ item }))}
      </View>
    );
  };

  if (isLoading && lists.length === 0) {
    return <LoadingSpinner />;
  }

  if (!currentList) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="format-list-bulleted" size={80} color="#E0E0E0" />
        <Text style={styles.emptyText}>Brak list zakupów</Text>
        <TouchableOpacity
          style={styles.createFirstButton}
          onPress={() => setShowCreateList(true)}
        >
          <Text style={styles.createFirstButtonText}>Utwórz pierwszą listę</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedItems = groupItemsByCategory(currentList.items);
  const checkedCount = currentList.items.filter(item => item.checked).length;
  const totalCount = currentList.items.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.listSelector}
          onPress={() => isPro && setShowListSelector(true)}
          disabled={!isPro}
        >
          <Text style={styles.listName}>{currentList.name}</Text>
          {isPro && <Icon name="chevron-down" size={20} color="#666666" />}
        </TouchableOpacity>

        {totalCount > 0 && (
          <Text style={styles.progress}>
            {checkedCount}/{totalCount} zrealizowane
          </Text>
        )}

        <View style={styles.headerActions}>
          {isPro && currentList.sharedWith.length > 0 && (
            <TouchableOpacity onPress={handleShareList}>
              <Icon name="account-group" size={24} color="#2196F3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List Content */}
      <FlatList
        data={groupedItems}
        keyExtractor={([category]) => category}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Icon name="cart-outline" size={60} color="#E0E0E0" />
            <Text style={styles.emptyListText}>Lista jest pusta</Text>
            <Text style={styles.emptyListSubtext}>
              Dodaj produkty do listy zakupów
            </Text>
          </View>
        }
      />

      {/* Add Item FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddItem(true)}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddItem(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dodaj produkt do listy</Text>

            <TextInput
              style={styles.input}
              placeholder="Nazwa produktu"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Ilość (opcjonalne)"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.input, { flex: 1, marginLeft: 8, justifyContent: 'center' }]}
                onPress={() => {/* Show category picker */}}
              >
                <Text>{PRODUCT_CATEGORIES[newItemCategory].name}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddItem(false)}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>Dodaj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  progress: {
    fontSize: 14,
    color: '#666666',
  },
  headerActions: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  itemAddedBy: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  addButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ShoppingListScreen;
