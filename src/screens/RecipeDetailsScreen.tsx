import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

 type RecipeDetailsRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;

const RecipeDetailsScreen: React.FC = () => {
  const route = useRoute<RecipeDetailsRouteProp>();
  const { recipeId } = route.params;
  const recipe = useSelector((state: RootState) => state.recipes.recipes.find((r) => r.id === recipeId));

  if (!recipe) {
    return (
      <View style={styles.center}> 
        <Text>Nie znaleziono przepisu.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{recipe.name}</Text>
      {recipe.description ? <Text style={styles.desc}>{recipe.description}</Text> : null}

      <Text style={styles.sectionTitle}>Składniki</Text>
  {recipe.ingredients.map((ing, idx: number) => (
        <Text key={idx} style={styles.item}>• {ing.quantity} {ing.unit} {ing.name}</Text>
      ))}

      <Text style={styles.sectionTitle}>Instrukcje</Text>
  {recipe.instructions.map((step: string, idx: number) => (
        <Text key={idx} style={styles.item}>{idx + 1}. {step}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 8 },
  desc: { color: '#444', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  item: { color: '#222', marginBottom: 6 },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16, backgroundColor: '#F3F3F3' },
});

export default RecipeDetailsScreen;
