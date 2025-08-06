import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShoppingList } from '../../types/models';

interface ShoppingListSelectorProps {
  lists: ShoppingList[];
  currentListId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onShareList: (listId: string) => void;
}

const ShoppingListSelector: React.FC<ShoppingListSelectorProps> = ({
  lists,
  currentListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onShareList,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');

  const currentList = lists.find(list => list.id === currentListId);

  const handleCreateList = () => {
    if (!newListName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę listy');
      return;
    }

    onCreateList(newListName.trim());
    setNewListName('');
    setShowCreateForm(false);
  };

  const handleDeleteList = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    Alert.alert(
      'Usuń listę',
      `Czy na pewno chcesz usunąć listę "${list.name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => onDeleteList(listId),
        },
      ]
    );
  };

  const renderListItem = ({ item }: { item: ShoppingList }) => {
    const isSelected = item.id === currentListId;
    const itemCount = item.items.length;
    const checkedCount = item.items.filter(i => i.checked).length;

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => {
          onSelectList(item.id);
          setIsVisible(false);
        }}
      >
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Text style={[styles.listItemName, isSelected && styles.listItemNameSelected]}>
              {item.name}
            </Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Domyślna</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.listItemStats}>
            {itemCount > 0 ? `${checkedCount}/${itemCount} produktów` : 'Pusta lista'}
          </Text>
          
          {item.sharedWith.length > 0 && (
            <View style={styles.sharedInfo}>
              <Icon name="account-group" size={14} color="#666666" />
              <Text style={styles.sharedText}>
                Współdzielona z {item.sharedWith.length} osobami
              </Text>
            </View>
          )}
        </View>

        <View style={styles.listItemActions}>
          {item.sharedWith.length > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onShareList(item.id)}
            >
              <Icon name="share-variant" size={20} color="#2196F3" />
            </TouchableOpacity>
          )}
          
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteList(item.id)}
            >
              <Icon name="delete-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.selectorText}>{currentList?.name || 'Wybierz listę'}</Text>
        <Icon name="chevron-down" size={24} color="#666666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Listy zakupów</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              renderItem={renderListItem}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Brak list zakupów</Text>
              }
            />

            {showCreateForm ? (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.createInput}
                  placeholder="Nazwa nowej listy"
                  value={newListName}
                  onChangeText={setNewListName}
                  autoFocus
                  onSubmitEditing={handleCreateList}
                />
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateList}
                >
                  <Icon name="check" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewListName('');
                  }}
                >
                  <Icon name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateForm(true)}
              >
                <Icon name="plus" size={20} color="#2196F3" />
                <Text style={styles.addButtonText}>Dodaj nową listę</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  listItemNameSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  defaultBadge: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listItemStats: {
    fontSize: 14,
    color: '#666666',
  },
  sharedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sharedText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 16,
    paddingVertical: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  createForm: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  createInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  createButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ShoppingListSelector;
