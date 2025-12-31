
export interface Recipe {
  title: string;
  ingredientsUsed: string[];
  instructions: string[];
  emoji: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
}

export interface SustainabilityImpact {
  co2SavedKg: number;
  score: number;
  reasoning: string;
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
  storageTip: string;
  impact: SustainabilityImpact;
}

export interface AppState {
  image: string | null;
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  statusMessage: string;
}

export interface MealPlanItem extends Recipe {
  id: string;
  savedAt: number;
}
