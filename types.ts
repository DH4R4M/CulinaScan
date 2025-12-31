
export interface Recipe {
  title: string;
  ingredientsUsed: string[];
  instructions: string[];
  emoji: string;
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
  storageTip: string;
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
