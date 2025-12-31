
import React, { useState } from 'react';
import { MealPlanItem } from '../types';
import { CloseIcon, TrashIcon } from './Icons';

interface MealPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MealPlanItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const MealPlanDrawer: React.FC<MealPlanDrawerProps> = ({ isOpen, onClose, items, onRemove, onClear }) => {
  const [view, setView] = useState<'recipes' | 'shopping'>('recipes');

  if (!isOpen) return null;

  const shoppingList = Array.from(new Set(items.flatMap(item => item.ingredientsUsed)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-900">Kitchen Hub</h2>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">
                {items.length} recipes in rotation
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-emerald-100 rounded-2xl text-emerald-500 transition-all border border-emerald-100 bg-white"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-emerald-100 shadow-inner">
            <button 
              onClick={() => setView('recipes')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${view === 'recipes' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`}
            >
              Recipes
            </button>
            <button 
              onClick={() => setView('shopping')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${view === 'shopping' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`}
            >
              Shopping List
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
              <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-5xl">
                🍲
              </div>
              <div>
                <p className="text-emerald-900 font-black text-lg">Your Hub is Empty</p>
                <p className="text-sm text-emerald-500 font-medium">Scan your fridge to build your weekly plan!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {view === 'recipes' ? (
                items.map((item) => (
                  <div key={item.id} className="group p-4 bg-white rounded-3xl border border-emerald-100 flex items-start space-x-4 hover:shadow-lg hover:border-emerald-300 transition-all">
                    <span className="text-4xl mt-1 drop-shadow-sm">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{item.difficulty} • {item.prepTime}</p>
                      <h3 className="font-bold text-emerald-900 truncate text-lg leading-tight">{item.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.ingredientsUsed.slice(0, 3).map((ing, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg text-emerald-600 font-bold">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-emerald-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 p-4 rounded-2xl mb-6">
                    <p className="text-xs text-amber-800 font-bold italic">
                      💡 These are the ingredients you'll need for your planned meals.
                    </p>
                  </div>
                  {shoppingList.map((ingredient, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-emerald-50/30 rounded-2xl border border-emerald-50 group hover:border-emerald-200 transition-all">
                      <div className="w-5 h-5 border-2 border-emerald-200 rounded-md bg-white group-hover:border-emerald-400 transition-colors"></div>
                      <span className="text-emerald-800 font-bold text-sm capitalize">{ingredient}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-emerald-100 bg-white">
            <button 
              onClick={onClear}
              className="w-full py-4 bg-emerald-50 text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
            >
              Reset All Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanDrawer;
