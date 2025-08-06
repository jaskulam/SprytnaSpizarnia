import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, DateData } from 'react-native-calendars';

import { RootState, AppDispatch } from '../store/store';
import { fetchMealPlans, addMealPlan } from '../store/slices/mealPlannerSlice';
import RecipeCard from '../components/recipes/RecipeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MealPlan, Recipe } from '../types/models';
import { formatExpiryDate } from '../utils/dateHelpers';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MealPlannerScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mealPlans, isLoading } = useSelector((state: RootState) => state.mealPlanner);
  const { recipes } = useSelector((state: RootState) => state.recipes);
  const { familyId } = useSelector((state: RootState) => state.auth);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (familyId) {
      const startDate = new Date();
      startDate.setDate(1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      
      dispatch(fetchMealPlans({
        familyId,
        startDate,
        endDate,
      }));
    }
  }, [dispatch, familyId, selectedDate]);

  useEffect(() => {
    // Mark dates with meal plans
    const marked: {[key: string]: any} = {};
    mealPlans.forEach(plan => {
      const dateStr = plan.date.toISOString().split('T')[0];
      marked[dateStr] = {
        marked: true,
        dotColor: '#2196F3',
      };
    });
    
    // Mark selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    marked[selectedDateStr] = {
      ...marked[selectedDateStr],
      selected: true,
      selectedColor: '#2196F3',
    };
    
    setMarkedDates(marked);
  }, [mealPlans, selectedDate]);

  const getMealPlanForDate = (date: Date): MealPlan | undefined => {
    return mealPlans.find(plan => {
      const planDate = new Date(plan.date);
      return planDate.toDateString() === date.toDateString();
    });
  };

  const currentMealPlan = getMealPlanForDate(selectedDate);

  const handleDateSelect = (date: DateData) => {
    setSelectedDate(new Date(date.dateString));
  };

  const handleAddMeal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowRecipeSelector(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!selectedMealType || !familyId) return;

    try {
      await dispatch(addMealPlan({
        date: selectedDate,
        meal: {
          type: selectedMealType,
          recipe,
        },
        familyId,
      })).unwrap();

      setShowRecipeSelector(false);
      setSelectedMealType(null);
      
      Alert.alert('Sukces', 'Przepis został dodany do planu');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać przepisu do planu');
    }
  };

  const handleGenerateShoppingList = () => {
    if (!currentMealPlan) {
      Alert.alert('Błąd', 'Brak planu posiłków dla wybranego dnia');
      return;
    }

    // Collect all ingredients from the meal plan
    const ingredients: string[] = [];
    Object.values(currentMealPlan.meals).forEach(recipe => {
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          ingredients.push(`${ing.quantity} ${ing.unit} ${ing.name}`);
        });
      }
    });

    Alert.alert(
      'Generuj listę zakupów',
      `Dodać ${ingredients.length} składników do listy zakupów?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Dodaj',
          onPress: () => {
            // Dispatch action to add ingredients to shopping list
            Alert.alert('Sukces', 'Składniki zostały dodane do listy zakupów');
          },
        },
      ]
    );
  };

  const renderMealSlot = (mealType: MealType, title: string, icon: string) => {
    const meal = currentMealPlan?.meals[mealType];

    return (
      <View style={styles.mealSlot}>
        <View style={styles.mealHeader}>
          <Icon name={icon} size={24} color="#666666" />
          <Text style={styles.mealTitle}>{title}</Text>
        </View>

        {meal ? (
          <TouchableOpacity style={styles.mealContent}>
            <RecipeCard recipe={meal} compact />
            <TouchableOpacity
              style={styles.removeMealButton}
              onPress={() => {/* Remove meal */}}
            >
              <Icon name="close-circle" size={20} color="#F44336" />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => handleAddMeal(mealType)}
          >
            <Icon name="plus" size={24} color="#2196F3" />
            <Text style={styles.addMealText}>Dodaj przepis</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecipeSelector = () => (
    <View style={styles.recipeSelectorModal}>
      <View style={styles.recipeSelectorContent}>
        <View style={styles.recipeSelectorHeader}>
          <Text style={styles.recipeSelectorTitle}>Wybierz przepis</Text>
          <TouchableOpacity onPress={() => setShowRecipeSelector(false)}>
            <Icon name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectRecipe(item)}>
              <RecipeCard recipe={item} compact />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.recipesList}
        />
      </View>
    </View>
  );

  if (isLoading && mealPlans.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Calendar
          current={selectedDate.toISOString().split('T')[0]}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#2196F3',
            todayTextColor: '#2196F3',
            arrowColor: '#2196F3',
          }}
          style={styles.calendar}
        />

        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>
            {formatExpiryDate(selectedDate)}
          </Text>
          {currentMealPlan && (
            <TouchableOpacity
              style={styles.generateListButton}
              onPress={handleGenerateShoppingList}
            >
              <Icon name="cart-plus" size={20} color="#4CAF50" />
              <Text style={styles.generateListButtonText}>Lista zakupów</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mealSlots}>
          {renderMealSlot('breakfast', 'Śniadanie', 'coffee')}
          {renderMealSlot('lunch', 'Obiad', 'food')}
          {renderMealSlot('dinner', 'Kolacja', 'silverware-fork-knife')}
          {renderMealSlot('snack', 'Przekąska', 'cookie')}
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Podsumowanie dnia</Text>
          {currentMealPlan ? (
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Icon name="fire" size={20} color="#FF9800" />
                <Text style={styles.statValue}>~2100</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="dumbbell" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>85g</Text>
                <Text style={styles.statLabel}>białko</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="bread-slice" size={20} color="#795548" />
                <Text style={styles.statValue}>280g</Text>
                <Text style={styles.statLabel}>węgle</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="water" size={20} color="#FFC107" />
                <Text style={styles.statValue}>70g</Text>
                <Text style={styles.statLabel}>tłuszcze</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noStatsText}>
              Dodaj posiłki, aby zobaczyć podsumowanie dnia
            </Text>
          )}
        </View>
      </ScrollView>

      {showRecipeSelector && renderRecipeSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  calendar: {
    marginBottom: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  generateListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateListButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  mealSlots: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  mealSlot: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  mealContent: {
    position: 'relative',
  },
  removeMealButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
  },
  addMealText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 8,
  },
  stats: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  noStatsText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
  },
  recipeSelectorModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  recipeSelectorContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  recipeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recipeSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  recipesList: {
    padding: 16,
  },
});

export default MealPlannerScreen;
