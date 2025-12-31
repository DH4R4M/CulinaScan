
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
    statusMessage: 'Scanning kitchen...',
  });

  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [speakingRecipeTitle, setSpeakingRecipeTitle] = useState<string | null>(null);

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
    "Analyzing fresh produce...",
    "Scanning for ripeness...",
    "Calculating carbon footprint...",
    "Curating gourmet recipes...",
    "Finalizing your menu..."
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
    }, 2500);

    try {
      const result = await analyzeIngredients(state.image);
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "We couldn't process the image. Please use a well-lit photo of your ingredients." 
      }));
    } finally {
      clearInterval(interval);
    }
  };

  const goHome = () => {
    stopSpeech();
    setSpeakingRecipeTitle(null);
    setState({
      image: null,
      loading: false,
      result: null,
      error: null,
      statusMessage: 'Scanning kitchen...',
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

  return (
    <div className="min-h-screen pb-32 bg-[#F9FBFA] selection:bg-emerald-100 selection:text-emerald-900">
      <header className="bg-white/70 backdrop-blur-2xl border-b border-emerald-50 sticky top-0 z-40 px-6 py-5 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={goHome}
            className="flex items-center space-x-4 group hover:opacity-80 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-emerald-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-900/20 group-hover:rotate-6 transition-all duration-500">
              <LeafIcon className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-emerald-900 tracking-tighter leading-none">CulinaScan</h1>
              <p className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.3em] mt-1.5">Sustainability First</p>
            </div>
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative px-5 py-3 bg-white text-emerald-900 rounded-2xl hover:bg-emerald-50 transition-all flex items-center space-x-3 border border-emerald-100 shadow-sm font-black text-[10px] uppercase tracking-widest"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">My Kitchen Hub</span>
              {mealPlan.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-900 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  {mealPlan.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16">
        {!state.result ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12 animate-in fade-in duration-1000">
            <div className="flex-1 max-w-xl space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-[0.4em] rounded-full">Intelligent Cooking</span>
                <h2 className="text-5xl md:text-7xl font-black text-emerald-900 tracking-tighter leading-[0.9]">Turn waste into <span className="text-emerald-500">wow.</span></h2>
                <p className="text-emerald-600/70 text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                  CulinaScan uses advanced AI to analyze your ingredients, save them from the bin, and reduce your carbon footprint.
                </p>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Zero Waste</span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Voice Guided</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md">
              <div className="bg-white p-10 rounded-[4rem] shadow-3xl shadow-emerald-900/5 border border-emerald-100/50 relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 blur-[80px] rounded-full"></div>
                <div className="mb-10 relative">
                  {state.image ? (
                    <div className="aspect-square w-full rounded-[3rem] overflow-hidden border-8 border-emerald-50 relative group shadow-2xl transition-all duration-500 hover:rotate-2">
                      <img src={state.image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setState(prev => ({ ...prev, image: null }))}
                        className="absolute top-6 right-6 p-4 bg-white/95 backdrop-blur shadow-2xl text-red-500 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square w-full rounded-[3.5rem] bg-emerald-50/20 border-[6px] border-dashed border-emerald-100 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group overflow-hidden"
                    >
                      <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <CameraIcon className="w-14 h-14" />
                      </div>
                      <p className="text-emerald-900 font-black text-2xl mt-8">Snap Your Fridge</p>
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-2 opacity-60">Ready to save the planet?</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                </div>

                {state.error && (
                  <div className="mb-8 p-6 bg-red-50 text-red-700 text-xs font-bold rounded-3xl border border-red-100 flex items-center">
                    <span className="mr-3 text-xl">⚠️</span>
                    {state.error}
                  </div>
                )}

                <button
                  disabled={!state.image || state.loading}
                  onClick={processImage}
                  className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-3xl transition-all ${
                    state.image && !state.loading
                      ? 'bg-emerald-900 text-white hover:bg-emerald-950 hover:shadow-emerald-900/40 hover:-translate-y-2 active:scale-95'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  Analyze & Cook
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000 pb-20">
            {/* Eco Impact Visualizer */}
            <div className="bg-emerald-900 text-white p-10 md:p-14 rounded-[4rem] shadow-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border-b-[12px] border-emerald-950/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent)]"></div>
              <div className="relative z-10 space-y-4 text-center md:text-left">
                <span className="px-5 py-2 bg-emerald-800 text-emerald-300 text-[10px] font-black uppercase tracking-[0.4em] rounded-full">Real-time Impact Score</span>
                <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-6">Saved <span className="text-emerald-400">{state.result.impact.co2SavedKg}kg</span> CO₂</p>
                <p className="text-emerald-400/60 text-lg font-bold max-w-xl leading-relaxed">{state.result.impact.reasoning}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-emerald-950" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={439.8} strokeDashoffset={439.8 - (439.8 * state.result.impact.score) / 100} className="text-emerald-400 transition-all duration-2000 ease-out" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black tracking-tighter">{state.result.impact.score}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sustainability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4 space-y-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-emerald-100">
                  <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                    <span className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mr-4 text-lg">🔍</span>
                    Inventory
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {state.result.identifiedIngredients.map((item, idx) => (
                      <span key={idx} className="px-4 py-2.5 bg-[#F8FAF9] text-emerald-900 text-[11px] rounded-[1.25rem] border border-emerald-50 font-black uppercase tracking-wider shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/40 p-10 rounded-[3rem] shadow-sm border border-amber-100 group">
                  <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mr-4 text-lg">💡</span>
                    Storage Hack
                  </h2>
                  <p className="text-amber-900/80 leading-relaxed text-lg font-bold italic">
                    "{state.result.storageTip}"
                  </p>
                </div>

                <div className="aspect-[4/5] w-full rounded-[3.5rem] overflow-hidden shadow-3xl border-8 border-white group relative">
                  <div className="absolute inset-0 bg-emerald-950/20 group-hover:opacity-0 transition-opacity z-10 duration-700"></div>
                  <img src={state.image!} alt="Your ingredients" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center space-x-8 mb-6">
                  <h2 className="text-5xl font-black text-emerald-900 tracking-tighter">Chef's Selection</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {state.result.recipes.map((recipe, idx) => (
                    <RecipeCard 
                      key={idx} 
                      recipe={recipe} 
                      isAdded={mealPlan.some(item => item.title === recipe.title)}
                      onAdd={addToMealPlan}
                      isGlobalSpeaking={speakingRecipeTitle === recipe.title}
                      onSetSpeaking={setSpeakingRecipeTitle}
                    />
                  ))}
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 flex items-start space-x-8 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] shadow-inner flex items-center justify-center text-3xl flex-shrink-0 grayscale">🧂</div>
                  <div className="pt-3">
                    <h4 className="font-black text-emerald-900 uppercase text-[11px] tracking-[0.3em] mb-2">Standard Pantry Staples</h4>
                    <p className="text-sm text-emerald-600/60 font-medium leading-relaxed">
                      We assume you have basics like salt, pepper, oil, and water. These recipes maximize your fresh ingredients.
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
        onClear={() => { if(confirm("Clear Hub?")) setMealPlan([]); }}
      />

      {state.loading && <LoadingOverlay message={state.statusMessage} />}

      {!state.loading && (
        <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg z-30">
          <div className="bg-emerald-900/90 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/20 shadow-4xl flex items-center justify-between">
            {!state.result ? (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 bg-white text-emerald-900 rounded-[1.75rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center space-x-3"
              >
                <CameraIcon className="w-5 h-5" />
                <span>New Scanning Session</span>
              </button>
            ) : (
              <button 
                onClick={goHome}
                className="w-full py-5 bg-white/10 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Clear Results</span>
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
