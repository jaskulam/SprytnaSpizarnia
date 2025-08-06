import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store';
import { Product, ProductCategory, StorageLocation } from '../../types/models';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { isPro } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    quantity: '1',
    category: 'Inne',
    location: 'Kuchnia',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dni od teraz
    notes: '',
    ...initialData,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const categories: ProductCategory[] = [
    'Nabiał', 'Mięso i ryby', 'Warzywa i owoce', 'Pieczywo', 'Przyprawy',
    'Napoje', 'Słodycze', 'Konserwy', 'Mrożonki', 'Kosmetyki', 
    'Środki czystości', 'Leki', 'Inne'
  ];

  const locations: StorageLocation[] = [
    'Lodówka', 'Spiżarnia', 'Kuchnia', 'Piwnica', 'Szafka z przyprawami',
    'Zamrażarka', 'Garaż', 'Balkon', 'Inne'
  ];

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      Alert.alert('Błąd', 'Nazwa produktu jest wymagana');
      return;
    }
    if (!formData.expiryDate) {
      Alert.alert('Błąd', 'Data ważności jest wymagana');
      return;
    }
    onSubmit(formData);
  };

  const getCategoryIcon = (category: ProductCategory): string => {
    const iconMap: Record<ProductCategory, string> = {
      'Nabiał': 'cow',
      'Mięso i ryby': 'fish',
      'Warzywa i owoce': 'carrot',
      'Pieczywo': 'bread-slice',
      'Przyprawy': 'spice-rack',
      'Napoje': 'bottle-wine',
      'Słodycze': 'candy',
      'Konserwy': 'can',
      'Mrożonki': 'snowflake',
      'Kosmetyki': 'lipstick',
      'Środki czystości': 'spray-bottle',
      'Leki': 'pill',
      'Inne': 'package-variant'
    };
    return iconMap[category] || 'package-variant';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Nazwa produktu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nazwa produktu</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="np. Mleko, Chleb, Jabłka..."
              placeholderTextColor="#999999"
              autoCapitalize="sentences"
              editable={!isLoading}
            />
          </View>

          {/* Ilość */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ilość</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholder="np. 1 sztuka, 500g, 1L"
              placeholderTextColor="#999999"
              editable={!isLoading}
            />
          </View>

          {/* Kategoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategoria</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              disabled={isLoading}
            >
              <View style={styles.categoryButton}>
                <Icon
                  name={getCategoryIcon(formData.category || 'Inne')}
                  size={20}
                  color="#666666"
                />
                <Text style={styles.pickerButtonText}>
                  {formData.category || 'Wybierz kategorię'}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
            
            {showCategoryPicker && (
              <View style={styles.pickerContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, category });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Icon name={getCategoryIcon(category)} size={20} color="#666666" />
                    <Text style={styles.pickerItemText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Data ważności */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data ważności</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Icon name="calendar" size={20} color="#666666" />
              <Text style={styles.pickerButtonText}>
                {formData.expiryDate ? formatDate(formData.expiryDate) : 'Wybierz datę'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lokalizacja */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lokalizacja</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowLocationPicker(!showLocationPicker)}
              disabled={isLoading}
            >
              <Icon name="map-marker" size={20} color="#666666" />
              <Text style={styles.pickerButtonText}>
                {formData.location || 'Wybierz lokalizację'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
            
            {showLocationPicker && (
              <View style={styles.pickerContainer}>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, location });
                      setShowLocationPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{location}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notatki (tylko PRO) */}
          {isPro && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notatki (opcjonalne)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="np. Otworzone 12.03, do pieczenia"
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>
          )}

          {/* Przyciski akcji */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Anuluj</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Zapisywanie...' : 'Zapisz'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={formData.expiryDate || new Date()}
        mode="date"
        locale="pl"
        title="Wybierz datę ważności"
        confirmText="Potwierdź"
        cancelText="Anuluj"
        onConfirm={(date) => {
          setFormData({ ...formData, expiryDate: date });
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProductForm;
