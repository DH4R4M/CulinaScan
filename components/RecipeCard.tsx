
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { speakText, stopSpeech } from '../services/audioService';
import { SpeakerIcon } from './Icons';

interface RecipeCardProps {
  recipe: Recipe;
  isAdded: boolean;
  onAdd: (recipe: Recipe) => void;
  isGlobalSpeaking: boolean;
  onSetSpeaking: (title: string | null) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isAdded, onAdd, isGlobalSpeaking, onSetSpeaking }) => {
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(recipe.instructions.length).fill(false));

  const handleSpeak = async () => {
    if (isGlobalSpeaking) {
      stopSpeech();
      onSetSpeaking(null);
      return;
    }
    
    const textToRead = `${recipe.title}. Difficulty: ${recipe.difficulty}. Time: ${recipe.prepTime}. Steps: ${recipe.instructions.join(". ")}`;
    
    await speakText(
      textToRead, 
      () => onSetSpeaking(recipe.title), 
      () => onSetSpeaking(null)
    );
  };

  const toggleStep = (idx: number) => {
    const newSteps = [...completedSteps];
    newSteps[idx] = !newSteps[idx];
    setCompletedSteps(newSteps);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500">
      <div className="relative h-48 bg-emerald-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <span className="text-7xl relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-700" role="img" aria-label="recipe icon">{recipe.emoji}</span>
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={handleSpeak}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all ${isGlobalSpeaking ? 'bg-white text-emerald-600 shadow-xl' : 'bg-black/20 text-white hover:bg-black/40 border border-white/20'}`}
          >
            <SpeakerIcon className={`w-6 h-6 ${isGlobalSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-900 text-[10px] font-black uppercase rounded-full shadow-sm">
            {recipe.difficulty}
          </span>
          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full shadow-sm">
            {recipe.prepTime}
          </span>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col space-y-8">
        <div>
          <h3 className="text-2xl font-black text-emerald-900 leading-tight mb-2">{recipe.title}</h3>
          <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{recipe.calories} Calories Per Serving</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Ingredients</h4>
            <span className="text-[10px] font-bold text-emerald-300">{recipe.ingredientsUsed.length} items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredientsUsed.map((ing, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] rounded-xl font-bold border border-emerald-100/50">
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Instructions</h4>
          <ul className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <li 
                key={idx} 
                onClick={() => toggleStep(idx)}
                className={`flex items-start space-x-4 cursor-pointer group/step ${completedSteps[idx] ? 'opacity-40' : ''}`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${completedSteps[idx] ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-100 bg-white group-hover/step:border-emerald-300'}`}>
                  {completedSteps[idx] ? <span className="text-white text-xs font-bold">✓</span> : <span className="text-[10px] font-black text-emerald-200">{idx + 1}</span>}
                </div>
                <span className={`text-sm leading-relaxed transition-all ${completedSteps[idx] ? 'text-emerald-900 line-through' : 'text-emerald-800 font-medium'}`}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-8 pb-8">
        <button
          onClick={() => onAdd(recipe)}
          disabled={isAdded}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-sm ${
            isAdded 
            ? 'bg-emerald-50 text-emerald-400 cursor-default border border-emerald-100' 
            : 'bg-emerald-900 text-white hover:bg-emerald-950 active:scale-95 shadow-xl shadow-emerald-900/10'
          }`}
        >
          {isAdded ? "Added to Plan" : "Add to Kitchen Hub"}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
