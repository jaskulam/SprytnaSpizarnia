import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Recipe } from '../../types/models';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavorite,
  isFavorite = false,
  compact = false,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#666666';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Łatwe';
      case 'medium': return 'Średnie';
      case 'hard': return 'Trudne';
      default: return '';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress}>
        {recipe.imageUrl && (
          <Image source={{ uri: recipe.imageUrl }} style={styles.compactImage} />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {recipe.name}
          </Text>
          <View style={styles.compactInfo}>
            <Icon name="clock-outline" size={14} color="#666666" />
            <Text style={styles.compactInfoText}>
              {recipe.prepTime + (recipe.cookTime || 0)} min
            </Text>
            <View style={styles.compactSeparator} />
            <Text style={[
              styles.compactDifficulty,
              { color: getDifficultyColor(recipe.difficulty) }
            ]}>
              {getDifficultyText(recipe.difficulty)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Icon name="food" size={40} color="#E0E0E0" />
        </View>
      )}

      {recipe.source === 'ai' && (
        <View style={styles.aiBadge}>
          <Icon name="robot" size={14} color="#FFFFFF" />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      )}

      {onFavorite && (
        <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#F44336' : '#FFFFFF'}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.name}
        </Text>

        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={16} color="#666666" />
            <Text style={styles.infoText}>
              {recipe.prepTime + (recipe.cookTime || 0)} min
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="account-group-outline" size={16} color="#666666" />
            <Text style={styles.infoText}>{recipe.servings} porcji</Text>
          </View>

          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(recipe.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>
              {getDifficultyText(recipe.difficulty)}
            </Text>
          </View>
        </View>

        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tags}>
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {recipe.rating !== undefined && recipe.ratingCount !== undefined && recipe.ratingCount > 0 && (
          <View style={styles.rating}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {recipe.rating.toFixed(1)} ({recipe.ratingCount})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInfoText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  compactSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  compactDifficulty: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RecipeCard;
