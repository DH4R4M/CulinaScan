
import React, { useState } from 'react';
import { Recipe } from '../types';
import { speakText, stopSpeech } from '../services/audioService';
import { SpeakerIcon } from './Icons';

interface RecipeCardProps {
  recipe: Recipe;
  isAdded: boolean;
  onAdd: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isAdded, onAdd }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(recipe.instructions.length).fill(false));

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const textToRead = `${recipe.title}. Difficulty: ${recipe.difficulty}. Total time: ${recipe.prepTime}. Estimated ${recipe.calories} calories. Instructions: ${recipe.instructions.join(". ")}`;
    await speakText(textToRead);
    setIsSpeaking(false);
  };

  const toggleStep = (idx: number) => {
    const newSteps = [...completedSteps];
    newSteps[idx] = !newSteps[idx];
    setCompletedSteps(newSteps);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 bg-emerald-50/30 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
             <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-md">{recipe.difficulty}</span>
             <span className="text-emerald-400 text-[10px] font-bold uppercase">• {recipe.prepTime}</span>
          </div>
          <h3 className="text-xl font-bold text-emerald-900 truncate">{recipe.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSpeak}
            className={`p-2.5 rounded-2xl transition-all ${isSpeaking ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-500 hover:bg-emerald-50 border border-emerald-100'}`}
            title={isSpeaking ? "Stop listening" : "Listen to recipe"}
          >
            <SpeakerIcon className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
          <span className="text-4xl drop-shadow-sm" role="img" aria-label="recipe icon">{recipe.emoji}</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col space-y-6">
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-emerald-50">
           <div className="text-center">
             <p className="text-[10px] font-bold text-emerald-400 uppercase">Calories</p>
             <p className="text-sm font-black text-emerald-900">{recipe.calories}</p>
           </div>
           <div className="text-center border-x border-emerald-50">
             <p className="text-[10px] font-bold text-emerald-400 uppercase">Items</p>
             <p className="text-sm font-black text-emerald-900">{recipe.ingredientsUsed.length}</p>
           </div>
           <div className="text-center">
             <p className="text-[10px] font-bold text-emerald-400 uppercase">Time</p>
             <p className="text-sm font-black text-emerald-900">{recipe.prepTime}</p>
           </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
            Ingredients
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredientsUsed.map((ing, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-emerald-50/50 text-emerald-800 text-[11px] rounded-lg border border-emerald-100/50 font-bold">
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
             Step-by-Step
          </h4>
          <ul className="space-y-3">
            {recipe.instructions.map((step, idx) => (
              <li 
                key={idx} 
                onClick={() => toggleStep(idx)}
                className={`flex items-start space-x-3 cursor-pointer group p-2 rounded-xl transition-colors ${completedSteps[idx] ? 'bg-emerald-50/30' : 'hover:bg-emerald-50/20'}`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${completedSteps[idx] ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-200 bg-white'}`}>
                  {completedSteps[idx] && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <span className={`text-sm leading-relaxed transition-all ${completedSteps[idx] ? 'text-emerald-300 line-through' : 'text-emerald-800 font-medium'}`}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 bg-emerald-50/20 border-t border-emerald-50">
        <button
          onClick={() => onAdd(recipe)}
          disabled={isAdded}
          className={`w-full py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
            isAdded 
            ? 'bg-emerald-100 text-emerald-600 cursor-default' 
            : 'bg-emerald-900 text-white hover:bg-emerald-950 active:scale-[0.98] shadow-lg shadow-emerald-100'
          }`}
        >
          {isAdded ? "Saved to Plan" : "+ Add to Meal Plan"}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
