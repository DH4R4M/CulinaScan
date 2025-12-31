
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AnalysisResult, Recipe, MealPlanItem } from './types';
import { analyzeIngredients } from './services/geminiService';
import { CameraIcon, TrashIcon, LeafIcon, CalendarIcon } from './components/Icons';
import RecipeCard from './components/RecipeCard';
import LoadingOverlay from './components/LoadingOverlay';
import MealPlanDrawer from './components/MealPlanDrawer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    loading: false,
    result: null,
    error: null,
    statusMessage: 'Scanning ingredients...',
  });

  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load meal plan on mount
  useEffect(() => {
    const saved = localStorage.getItem('culina_meal_plan');
    if (saved) {
      try {
        setMealPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load meal plan", e);
      }
    }
  }, []);

  // Save meal plan on change
  useEffect(() => {
    localStorage.setItem('culina_meal_plan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const statusMessages = [
    "Identifying textures and colors...",
    "Consulting sustainable cookbooks...",
    "Minimizing food waste algorithms...",
    "Perfecting your meal plan...",
    "Almost ready to cook!"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, image: reader.result as string, result: null, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, loading: true, statusMessage: statusMessages[0] }));

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % statusMessages.length;
      setState(prev => ({ ...prev, statusMessage: statusMessages[msgIdx] }));
    }, 2000);

    try {
      const result = await analyzeIngredients(state.image);
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Oops! We couldn't analyze the image. Please try again with a clearer photo of your ingredients." 
      }));
    } finally {
      clearInterval(interval);
    }
  };

  const reset = () => {
    if (confirm("Clear current scan results? Your meal plan will be saved.")) {
      setState({
        image: null,
        loading: false,
        result: null,
        error: null,
        statusMessage: 'Scanning ingredients...',
      });
    }
  };

  const addToMealPlan = (recipe: Recipe) => {
    const newItem: MealPlanItem = {
      ...recipe,
      id: `${recipe.title}-${Date.now()}`,
      savedAt: Date.now()
    };
    setMealPlan(prev => [...prev, newItem]);
    // Small toast or visual cue could go here
  };

  const removeFromMealPlan = (id: string) => {
    setMealPlan(prev => prev.filter(item => item.id !== id));
  };

  const clearMealPlan = () => {
    if (confirm("Clear your entire meal plan?")) {
      setMealPlan([]);
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <LeafIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-emerald-900 tracking-tight leading-none">CulinaScan</h1>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mt-1">Sustainable Cooking</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all flex items-center space-x-2 group"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm font-bold hidden sm:inline">Meal Plan</span>
              {mealPlan.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
                  {mealPlan.length}
                </span>
              )}
            </button>
            <button 
              onClick={reset}
              className="p-2.5 text-emerald-300 hover:text-emerald-600 transition-colors hover:bg-emerald-50 rounded-xl"
              title="Start Over"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 mb-12 space-y-8">
        {!state.result ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto py-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100/50 border border-emerald-50 w-full">
              <div className="mb-6 relative">
                {state.image ? (
                  <div className="aspect-square w-full rounded-3xl overflow-hidden border-4 border-emerald-100 relative group shadow-inner">
                    <img src={state.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setState(prev => ({ ...prev, image: null }))}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur shadow-lg text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full rounded-3xl bg-emerald-50/50 border-4 border-dashed border-emerald-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100/30 hover:border-emerald-300 transition-all group"
                  >
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-lg flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform mb-4">
                      <CameraIcon className="w-10 h-10" />
                    </div>
                    <p className="text-emerald-900 font-bold text-lg">Snap your Fridge</p>
                    <p className="text-emerald-500 text-sm font-medium">Upload photo of ingredients</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              {state.error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 animate-in shake duration-300">
                  {state.error}
                </div>
              )}

              <button
                disabled={!state.image || state.loading}
                onClick={processImage}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                  state.image && !state.loading
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-1 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Scan & Create Recipes
              </button>
              
              <p className="mt-6 text-xs text-emerald-400 font-bold italic flex items-center justify-center">
                <LeafIcon className="w-3 h-3 mr-1" /> Zero Waste cooking assistant
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                  <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                    <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl mr-3">
                      🔍
                    </span>
                    Identified Items
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {state.result.identifiedIngredients.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100 font-bold uppercase tracking-wider">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-700 rounded-full blur-3xl opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>
                  <h2 className="text-lg font-bold mb-3 flex items-center relative z-10">
                    <span className="bg-white/10 p-2 rounded-xl mr-3">
                      🌱
                    </span>
                    Eco Storage Tip
                  </h2>
                  <p className="text-emerald-50/90 leading-relaxed text-sm relative z-10 font-medium">
                    {state.result.storageTip}
                  </p>
                </div>

                <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border-2 border-white group">
                  <img src={state.image!} alt="Your ingredients" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>

              {/* Main Content: Recipes */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tight">Daily Menu</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-100 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.result.recipes.map((recipe, idx) => (
                    <RecipeCard 
                      key={idx} 
                      recipe={recipe} 
                      isAdded={mealPlan.some(item => item.title === recipe.title)}
                      onAdd={addToMealPlan}
                    />
                  ))}
                </div>
                
                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🧂</div>
                    <div>
                      <h4 className="font-bold text-amber-900">Pantry Staples</h4>
                      <p className="text-sm text-amber-700/80 leading-relaxed mt-1">
                        These recipes prioritize ingredients from your photo. We assume you have water, salt, oil, and pepper in your cupboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Components */}
      <MealPlanDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        items={mealPlan}
        onRemove={removeFromMealPlan}
        onClear={clearMealPlan}
      />

      {state.loading && <LoadingOverlay message={state.statusMessage} />}

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-emerald-100 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center text-emerald-400 space-x-1">
             <span className="text-[10px] font-bold uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            {!state.result ? (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <CameraIcon className="w-5 h-5" />
                <span>New Photo Scan</span>
              </button>
            ) : (
              <button 
                onClick={reset}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
