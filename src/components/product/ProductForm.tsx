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
import { Product, ProductCategory, ProductUnit } from '../../types/models';
import { PRODUCT_CATEGORIES, QUICK_ADD_SUGGESTIONS } from '../../constants/categories';
import { PRODUCT_UNITS } from '../../constants/units';
import { validateProductData, estimateExpiryDate } from '../../utils/productHelpers';
import { formatExpiryDate, getDateFromNow } from '../../utils/dateHelpers';

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
    quantity: 1,
    unit: 'pcs',
    category: 'other',
    location: 'Kuchnia',
    expiryDate: getDateFromNow(7),
    notes: '',
    ...initialData,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [filteredSuggestions, setFilteredSuggestions] = useState(QUICK_ADD_SUGGESTIONS);

  useEffect(() => {
    if (formData.name && formData.name.length > 0) {
      const filtered = QUICK_ADD_SUGGESTIONS.filter(suggestion =>
        suggestion.name.toLowerCase().includes(formData.name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(QUICK_ADD_SUGGESTIONS);
      setShowSuggestions(false);
    }
  }, [formData.name]);

  const handleSubmit = () => {
    const errors = validateProductData(formData);
    if (errors.length > 0) {
      Alert.alert('Błąd walidacji', errors.join('\n'));
      return;
    }
    onSubmit(formData);
  };

  const handleSuggestionSelect = (suggestion: typeof QUICK_ADD_SUGGESTIONS[0]) => {
    setFormData({
      ...formData,
      name: suggestion.name,
      category: suggestion.category as ProductCategory,
      unit: suggestion.unit as ProductUnit,
      expiryDate: estimateExpiryDate(suggestion.category as ProductCategory),
    });
    setShowSuggestions(false);
  };

  const handleCategoryChange = (category: ProductCategory) => {
    const categoryInfo = PRODUCT_CATEGORIES[category];
    setFormData({
      ...formData,
      category,
      location: categoryInfo.defaultLocation,
      expiryDate: estimateExpiryDate(category),
    });
    setShowCategoryPicker(false);
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
            
            {showSuggestions && filteredSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredSuggestions.slice(0, 3).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(suggestion)}
                  >
                    <Icon 
                      name={PRODUCT_CATEGORIES[suggestion.category as ProductCategory].icon}
                      size={20}
                      color="#666666"
                    />
                    <Text style={styles.suggestionText}>{suggestion.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Ilość i jednostka */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ilość</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity?.toString()}
                onChangeText={(text) => {
                  const quantity = parseFloat(text) || 0;
                  setFormData({ ...formData, quantity });
                }}
                placeholder="1"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Jednostka</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {/* Show unit picker */}}
                disabled={isLoading}
              >
                <Text style={styles.pickerButtonText}>
                  {PRODUCT_UNITS[formData.unit as ProductUnit].abbreviation}
                </Text>
                <Icon name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Kategoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategoria</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
              disabled={isLoading}
            >
              <View style={styles.categoryButton}>
                <Icon
                  name={PRODUCT_CATEGORIES[formData.category as ProductCategory].icon}
                  size={20}
                  color="#666666"
                />
                <Text style={styles.pickerButtonText}>
                  {PRODUCT_CATEGORIES[formData.category as ProductCategory].name}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
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
                {formatExpiryDate(formData.expiryDate || new Date())}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lokalizacja (tylko PRO) */}
          {isPro && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lokalizacja</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowLocationPicker(true)}
                disabled={isLoading}
              >
                <Icon name="map-marker" size={20} color="#666666" />
                <Text style={styles.pickerButtonText}>
                  {formData.location}
                </Text>
                <Icon name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          )}

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
  row: {
    flexDirection: 'row',
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
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
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
