
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Recipe, MealPlanItem } from './types';
import { analyzeIngredients } from './services/geminiService';
import { CameraIcon, TrashIcon, LeafIcon, CalendarIcon, InfoIcon } from './components/Icons';
import RecipeCard from './components/RecipeCard';
import LoadingOverlay from './components/LoadingOverlay';
import MealPlanDrawer from './components/MealPlanDrawer';
import { stopSpeech } from './services/audioService';

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

  useEffect(() => {
    localStorage.setItem('culina_meal_plan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const statusMessages = [
    "Identifying items...",
    "Calculating CO2 impact...",
    "Generating gourmet recipes...",
    "Optimizing prep times...",
    "Perfecting your menu!"
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
        error: "Oops! We couldn't analyze the image. Please try again with a clearer photo." 
      }));
    } finally {
      clearInterval(interval);
    }
  };

  const goHome = () => {
    stopSpeech();
    setState({
      image: null,
      loading: false,
      result: null,
      error: null,
      statusMessage: 'Scanning ingredients...',
    });
  };

  const addToMealPlan = (recipe: Recipe) => {
    const newItem: MealPlanItem = {
      ...recipe,
      id: `${recipe.title}-${Date.now()}`,
      savedAt: Date.now()
    };
    setMealPlan(prev => [...prev, newItem]);
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
    <div className="min-h-screen pb-32 selection:bg-emerald-100 selection:text-emerald-900 bg-emerald-50/30">
      <header className="bg-white/90 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Redirect to Home */}
          <button 
            onClick={goHome}
            className="flex items-center space-x-3 group hover:opacity-80 transition-all"
          >
            <div className="w-12 h-12 bg-emerald-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <LeafIcon className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-emerald-900 tracking-tighter leading-none">CulinaScan</h1>
              <p className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em] mt-1">Zero Waste Assistant</p>
            </div>
          </button>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-3 bg-emerald-50 text-emerald-900 rounded-2xl hover:bg-emerald-100 transition-all flex items-center space-x-2 border border-emerald-100 shadow-sm"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">My Hub</span>
              {mealPlan.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-900 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
                  {mealPlan.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12 space-y-12">
        {!state.result ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto py-12">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-emerald-900/5 border border-emerald-100/50 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-8 relative">
                {state.image ? (
                  <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden border-4 border-emerald-50 relative group shadow-2xl">
                    <img src={state.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setState(prev => ({ ...prev, image: null }))}
                      className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur shadow-xl text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full rounded-[3rem] bg-emerald-50/30 border-4 border-dashed border-emerald-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group overflow-hidden"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                      <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform relative z-10">
                        <CameraIcon className="w-12 h-12" />
                      </div>
                    </div>
                    <p className="text-emerald-900 font-black text-xl mt-6">Snap Fridge Items</p>
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-2">Identify & Cook Sustainable</p>
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
                <div className="mb-8 p-5 bg-red-50 text-red-700 text-xs font-bold rounded-3xl border border-red-100 animate-in shake duration-300">
                  {state.error}
                </div>
              )}

              <button
                disabled={!state.image || state.loading}
                onClick={processImage}
                className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all ${
                  state.image && !state.loading
                    ? 'bg-emerald-900 text-white hover:bg-emerald-950 hover:shadow-emerald-900/30 hover:-translate-y-1 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Scan My Kitchen
              </button>
              
              <p className="mt-8 text-[10px] text-emerald-400 font-black uppercase tracking-[0.25em] flex items-center justify-center">
                Built with Gemini AI 2.5
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000 pb-20">
            {/* Environmental Impact Header */}
            <div className="bg-emerald-900 text-white p-8 rounded-[3.5rem] shadow-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-emerald-950">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]"></div>
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <span className="px-3 py-1 bg-emerald-800 text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">Eco Impact Analysis</span>
                <p className="text-4xl font-black tracking-tighter mt-4">Estimated {state.result.impact.co2SavedKg}kg CO₂ Saved</p>
                <p className="text-emerald-400/80 text-sm font-bold max-w-lg leading-relaxed">{state.result.impact.reasoning}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-emerald-950" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * state.result.impact.score) / 100} className="text-emerald-400 transition-all duration-1500 ease-out" />
                  </svg>
                  <span className="absolute text-3xl font-black">{state.result.impact.score}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest mt-4 text-emerald-500">Eco-Score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100">
                  <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mr-3">🔍</span>
                    Inventory Detected
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {state.result.identifiedIngredients.map((item, idx) => (
                      <span key={idx} className="px-3 py-2 bg-emerald-50/50 text-emerald-900 text-[10px] rounded-xl border border-emerald-100 font-black uppercase tracking-wider">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-8 rounded-[2.5rem] shadow-sm border border-amber-100 relative group overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
                  <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mr-3">💡</span>
                    Storage Hack
                  </h2>
                  <p className="text-amber-900 leading-relaxed text-sm font-bold italic relative z-10">
                    "{state.result.storageTip}"
                  </p>
                </div>

                <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group relative">
                  <div className="absolute inset-0 bg-emerald-900/10 group-hover:opacity-0 transition-opacity z-10"></div>
                  <img src={state.image!} alt="Your ingredients" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center space-x-6 mb-4">
                  <h2 className="text-4xl font-black text-emerald-900 tracking-tighter">Chef's Selection</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {state.result.recipes.map((recipe, idx) => (
                    <RecipeCard 
                      key={idx} 
                      recipe={recipe} 
                      isAdded={mealPlan.some(item => item.title === recipe.title)}
                      onAdd={addToMealPlan}
                    />
                  ))}
                </div>

                <div className="bg-white/50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-start space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl flex-shrink-0">🧂</div>
                  <div className="pt-2">
                    <h4 className="font-black text-emerald-900 uppercase text-xs tracking-widest mb-1">Standard Staples</h4>
                    <p className="text-xs text-emerald-500 font-bold leading-relaxed">
                      To keep it simple, we assume you have basic spices (salt, pepper), cooking fats (oil, butter), and water.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <MealPlanDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        items={mealPlan}
        onRemove={removeFromMealPlan}
        onClear={clearMealPlan}
      />

      {state.loading && <LoadingOverlay message={state.statusMessage} />}

      {/* Modern Floating Action Bar */}
      {!state.loading && (
        <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-30">
          <div className="bg-emerald-900/95 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-3xl flex items-center justify-between">
            {!state.result ? (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-white text-emerald-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-50 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3"
              >
                <CameraIcon className="w-5 h-5" />
                <span>New Kitchen Scan</span>
              </button>
            ) : (
              <button 
                onClick={goHome}
                className="w-full py-4 bg-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center space-x-3"
              >
                <span>Clear & New Scan</span>
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
