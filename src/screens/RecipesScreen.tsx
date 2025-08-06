import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchRecipes, setSearchQuery, setFilters } from '../store/recipesSlice';
import { Recipe, CuisineType, DifficultyLevel, MealType } from '../types';
import RecipeCard from '../components/RecipeCard';
import RecipeGenerator from '../components/RecipeGenerator';

const RecipesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { recipes, loading, searchQuery, filters } = useSelector((state: RootState) => state.recipes);
  const { isPro } = useSelector((state: RootState) => state.auth);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [filtersHeight] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchRecipes());
    setRefreshing(false);
  }, [dispatch]);

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const toggleFilters = () => {
    const toValue = showFilters ? 0 : 200;
    setShowFilters(!showFilters);
    
    Animated.timing(filtersHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const updateFilter = (filterType: string, value: any) => {
    dispatch(setFilters({ ...filters, [filterType]: value }));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      cuisine: null,
      difficulty: null,
      mealType: null,
      preparationTime: null,
      dietary: [],
    }));
  };

  const filteredRecipes = recipes.filter(recipe => {
    // Search query filter
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Cuisine filter
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    // Meal type filter
    if (filters.mealType && recipe.mealType !== filters.mealType) {
      return false;
    }

    // Preparation time filter
    if (filters.preparationTime && recipe.preparationTime > filters.preparationTime) {
      return false;
    }

    // Dietary filters
    if (filters.dietary && filters.dietary.length > 0) {
      const recipeDietary = recipe.dietary || [];
      const hasAllDietary = filters.dietary.every(diet => recipeDietary.includes(diet));
      if (!hasAllDietary) {
        return false;
      }
    }

    return true;
  });

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard recipe={item} />
  );

  const cuisineTypes: CuisineType[] = ['italian', 'asian', 'mexican', 'mediterranean', 'indian', 'american'];
  const difficultyLevels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Przepisy</Text>
        <TouchableOpacity
          style={[styles.generateButton, isPro && styles.generateButtonPro]}
          onPress={() => setShowGenerator(true)}
        >
          <Icon name="auto-fix" size={20} color="white" />
          <Text style={styles.generateButtonText}>
            {isPro ? 'AI Generator' : 'Wypróbuj AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj przepisów..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Icon 
            name="filter-variant" 
            size={20} 
            color={showFilters ? '#4CAF50' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <Animated.View style={[styles.filtersContainer, { height: filtersHeight }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cuisine Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Kuchnia:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cuisineTypes.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.filterChip,
                    filters.cuisine === cuisine && styles.filterChipActive
                  ]}
                  onPress={() => updateFilter('cuisine', 
                    filters.cuisine === cuisine ? null : cuisine
                  )}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.cuisine === cuisine && styles.filterChipTextActive
                  ]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Difficulty Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Trudność:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {difficultyLevels.map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    filters.difficulty === difficulty && styles.filterChipActive
                  ]}
                  onPress={() => updateFilter('difficulty',
                    filters.difficulty === difficulty ? null : difficulty
                  )}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.difficulty === difficulty && styles.filterChipTextActive
                  ]}>
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Clear Filters Button */}
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Znaleziono {filteredRecipes.length} przepisów
        </Text>
      </View>

      {/* Recipes List */}
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="chef-hat" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>Brak przepisów</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || Object.values(filters).some(f => f !== null && (Array.isArray(f) ? f.length > 0 : true))
                ? 'Spróbuj zmienić kryteria wyszukiwania'
                : 'Dodaj swoje pierwsze przepisy lub wygeneruj je za pomocą AI'
              }
            </Text>
          </View>
        )}
      />

      {/* Recipe Generator Modal */}
      <Modal
        visible={showGenerator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGenerator(false)}
      >
        <RecipeGenerator onClose={() => setShowGenerator(false)} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonPro: {
    backgroundColor: '#4CAF50',
  },
  generateButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterSection: {
    marginVertical: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f44336',
    borderRadius: 15,
    marginBottom: 10,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default RecipesScreen;
