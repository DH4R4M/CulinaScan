
import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/30">
          <div>
            <h2 className="text-xl font-bold text-emerald-900">Your Meal Plan</h2>
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
              {items.length} {items.length === 1 ? 'Recipe' : 'Recipes'} Saved
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-full text-emerald-500 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300">
                <span className="text-3xl">🍲</span>
              </div>
              <div>
                <p className="text-emerald-900 font-bold">Your plan is empty</p>
                <p className="text-sm text-emerald-600">Scan ingredients and add recipes to your sustainable meal plan!</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start space-x-4 hover:border-emerald-300 transition-colors">
                <span className="text-3xl mt-1">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-emerald-900 truncate">{item.title}</h3>
                  <p className="text-xs text-emerald-500 font-medium">
                    {item.ingredientsUsed.length} ingredients used
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.ingredientsUsed.slice(0, 3).map((ing, i) => (
                      <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-50 text-emerald-600 font-semibold">
                        {ing}
                      </span>
                    ))}
                    {item.ingredientsUsed.length > 3 && (
                      <span className="text-[10px] text-emerald-400 font-bold">+{item.ingredientsUsed.length - 3}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-emerald-300 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-emerald-100 bg-emerald-50/30">
            <button 
              onClick={onClear}
              className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
            >
              Clear All Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanDrawer;
