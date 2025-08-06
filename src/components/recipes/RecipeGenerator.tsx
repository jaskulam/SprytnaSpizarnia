import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store';
import { Product, Recipe } from '../../types/models';
import { GeminiApiService } from '../../services/api/geminiApi';
import RecipeCard from './RecipeCard';

interface RecipeGeneratorProps {
  visible: boolean;
  onClose: () => void;
  preselectedProducts?: Product[];
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  visible,
  onClose,
  preselectedProducts = [],
}) => {
  const { products } = useSelector((state: RootState) => state.products);
  const { isPro } = useSelector((state: RootState) => state.auth);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    diet: '',
    maxTime: 0,
    difficulty: '',
    cuisine: '',
    servings: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (preselectedProducts.length > 0) {
      setSelectedIngredients(preselectedProducts.map(p => p.name));
    }
  }, [preselectedProducts]);

  const toggleIngredient = (productName: string) => {
    if (selectedIngredients.includes(productName)) {
      setSelectedIngredients(selectedIngredients.filter(name => name !== productName));
    } else {
      if (!isPro && selectedIngredients.length >= 3) {
        Alert.alert(
          'Limit składników',
          'W wersji darmowej możesz wybrać maksymalnie 3 składniki. Przejdź na wersję PRO dla nielimitowanego dostępu.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Ulepsz do PRO', onPress: () => {/* Navigate to subscription */} }
          ]
        );
        return;
      }
      setSelectedIngredients([...selectedIngredients, productName]);
    }
  };

  const generateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert('Błąd', 'Wybierz przynajmniej jeden składnik');
      return;
    }

    setIsGenerating(true);
    try {
      const recipes = await GeminiApiService.generateRecipes({
        ingredients: selectedIngredients,
        preferences: isPro ? preferences : undefined,
      });
      setGeneratedRecipes(recipes);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wygenerować przepisów. Spróbuj ponownie.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderIngredientItem = (product: Product) => {
    const isSelected = selectedIngredients.includes(product.name);
    
    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.ingredientItem, isSelected && styles.ingredientItemSelected]}
        onPress={() => toggleIngredient(product.name)}
      >
        <View style={styles.checkbox}>
          {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
        <Text style={[styles.ingredientName, isSelected && styles.ingredientNameSelected]}>
          {product.name}
        </Text>
        <Text style={styles.ingredientQuantity}>
          {product.quantity} {product.unit}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={28} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generator przepisów AI</Text>
          <TouchableOpacity onPress={() => setSelectedIngredients([])}>
            <Text style={styles.clearButton}>Wyczyść</Text>
          </TouchableOpacity>
        </View>

        {generatedRecipes.length === 0 ? (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Wybierz składniki ({selectedIngredients.length}{!isPro && '/3'})
              </Text>
              <View style={styles.ingredientsList}>
                {products.map(renderIngredientItem)}
              </View>
            </View>

            {isPro && (
              <TouchableOpacity
                style={styles.preferencesToggle}
                onPress={() => setShowPreferences(!showPreferences)}
              >
                <Icon name="tune" size={20} color="#2196F3" />
                <Text style={styles.preferencesToggleText}>
                  Preferencje i filtry
                </Text>
                <Icon
                  name={showPreferences ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#2196F3"
                />
              </TouchableOpacity>
            )}

            {isPro && showPreferences && (
              <View style={styles.preferencesSection}>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Dieta</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['', 'vegan', 'vegetarian', 'gluten-free', 'keto'].map(diet => (
                      <TouchableOpacity
                        key={diet}
                        style={[
                          styles.preferenceOption,
                          preferences.diet === diet && styles.preferenceOptionSelected
                        ]}
                        onPress={() => setPreferences({...preferences, diet})}
                      >
                        <Text style={[
                          styles.preferenceOptionText,
                          preferences.diet === diet && styles.preferenceOptionTextSelected
                        ]}>
                          {diet || 'Wszystkie'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Maksymalny czas</Text>
                  <View style={styles.timeOptions}>
                    {[0, 15, 30, 60].map(time => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeOption,
                          preferences.maxTime === time && styles.timeOptionSelected
                        ]}
                        onPress={() => setPreferences({...preferences, maxTime: time})}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          preferences.maxTime === time && styles.timeOptionTextSelected
                        ]}>
                          {time === 0 ? 'Dowolny' : `${time} min`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Liczba porcji</Text>
                  <View style={styles.servingsContainer}>
                    <TouchableOpacity
                      style={styles.servingsButton}
                      onPress={() => setPreferences({
                        ...preferences,
                        servings: Math.max(1, preferences.servings - 1)
                      })}
                    >
                      <Icon name="minus" size={20} color="#666666" />
                    </TouchableOpacity>
                    <Text style={styles.servingsText}>{preferences.servings}</Text>
                    <TouchableOpacity
                      style={styles.servingsButton}
                      onPress={() => setPreferences({
                        ...preferences,
                        servings: Math.min(10, preferences.servings + 1)
                      })}
                    >
                      <Icon name="plus" size={20} color="#666666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.recipesHeader}>
              <Text style={styles.recipesTitle}>
                Wygenerowane przepisy ({generatedRecipes.length})
              </Text>
              <TouchableOpacity
                onPress={() => setGeneratedRecipes([])}
                style={styles.newSearchButton}
              >
                <Icon name="refresh" size={20} color="#2196F3" />
                <Text style={styles.newSearchButtonText}>Nowe wyszukiwanie</Text>
              </TouchableOpacity>
            </View>
            
            {generatedRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ScrollView>
        )}

        {generatedRecipes.length === 0 && (
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={generateRecipes}
            disabled={isGenerating || selectedIngredients.length === 0}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generowanie...</Text>
              </>
            ) : (
              <>
                <Icon name="robot" size={20} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generuj przepisy</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  clearButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  ingredientItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientName: {
    fontSize: 14,
    color: '#333333',
  },
  ingredientNameSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  ingredientQuantity: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  preferencesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  preferencesToggleText: {
    fontSize: 16,
    color: '#2196F3',
    marginHorizontal: 8,
  },
  preferencesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  preferenceItem: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  preferenceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  preferenceOptionSelected: {
    backgroundColor: '#2196F3',
  },
  preferenceOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  preferenceOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  timeOptionSelected: {
    backgroundColor: '#2196F3',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recipesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  recipesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  newSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newSearchButtonText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
  },
});

export default RecipeGenerator;
