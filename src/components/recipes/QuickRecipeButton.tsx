import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Product } from '../../types/models';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { GeminiApiService } from '../../services/api/geminiApi';
import { getExpiringProducts } from '../../utils/productHelpers';

interface QuickRecipeButtonProps {
  products: Product[];
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const QuickRecipeButton: React.FC<QuickRecipeButtonProps> = ({ products }) => {
  const navigation = useNavigation<NavigationProp>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickRecipe = async () => {
    const expiringProducts = getExpiringProducts(products, 3);
    
    if (expiringProducts.length === 0) {
      Alert.alert(
        'Brak produktów do zużycia',
        'Nie masz produktów, które wkrótce się przeterminują. Wybierz składniki ręcznie w generatorze przepisów.',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Otwórz generator',
            onPress: () => navigation.navigate('Recipes')
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Co na szybko?',
      'Ile masz czasu na przygotowanie posiłku?',
      [
        {
          text: 'Do 15 minut',
          onPress: () => generateQuickRecipe(expiringProducts, 15)
        },
        {
          text: 'Do 30 minut',
          onPress: () => generateQuickRecipe(expiringProducts, 30)
        },
        {
          text: 'Anuluj',
          style: 'cancel'
        }
      ]
    );
  };

  const generateQuickRecipe = async (ingredients: Product[], maxTime: number) => {
    setIsGenerating(true);
    
    try {
      const recipe = await GeminiApiService.generateQuickRecipe(
        ingredients.map(p => p.name)
      );
      
      // Navigate to recipe details with the generated recipe
      navigation.navigate('RecipeDetails', { recipeId: recipe.id });
    } catch (error) {
      Alert.alert(
        'Błąd',
        'Nie udało się wygenerować szybkiego przepisu. Spróbuj ponownie.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const expiringCount = getExpiringProducts(products, 3).length;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleQuickRecipe}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Icon name="lightning-bolt" size={24} color="#FFFFFF" />
          <View style={styles.content}>
            <Text style={styles.title}>Co na szybko?</Text>
            {expiringCount > 0 && (
              <Text style={styles.subtitle}>
                {expiringCount} produktów do zużycia
              </Text>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
});

export default QuickRecipeButton;
