
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
        <h3 className="text-xl font-bold text-emerald-900">{recipe.title}</h3>
        <span className="text-3xl" role="img" aria-label="recipe icon">{recipe.emoji}</span>
      </div>
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Ingredients Used</h4>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredientsUsed.map((ing, idx) => (
              <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-md font-medium">
                {ing}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Instructions</h4>
          <ol className="space-y-3">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex space-x-3 text-emerald-900 leading-relaxed">
                <span className="font-bold text-emerald-500">{idx + 1}.</span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
