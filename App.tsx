
import React, { useState, useCallback, useRef } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeIngredients } from './services/geminiService';
import { CameraIcon, TrashIcon, LeafIcon } from './components/Icons';
import RecipeCard from './components/RecipeCard';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    loading: false,
    result: null,
    error: null,
    statusMessage: 'Scanning ingredients...',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Message rotation for UX
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
    setState({
      image: null,
      loading: false,
      result: null,
      error: null,
      statusMessage: 'Scanning ingredients...',
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <LeafIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-emerald-900 tracking-tight">CulinaScan</h1>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Zero Waste Assistant</p>
            </div>
          </div>
          <button 
            onClick={reset}
            className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors"
            title="Start Over"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {!state.result ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50 w-full">
              <div className="mb-6 relative">
                {state.image ? (
                  <div className="aspect-square w-full rounded-3xl overflow-hidden border-4 border-emerald-100 relative group">
                    <img src={state.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setState(prev => ({ ...prev, image: null }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full rounded-3xl bg-emerald-50 border-4 border-dashed border-emerald-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-all group"
                  >
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform mb-4">
                      <CameraIcon className="w-10 h-10" />
                    </div>
                    <p className="text-emerald-900 font-bold text-lg">Snap your Fridge</p>
                    <p className="text-emerald-500 text-sm">Upload photo of ingredients</p>
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
                <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100">
                  {state.error}
                </div>
              )}

              <button
                disabled={!state.image || state.loading}
                onClick={processImage}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                  state.image && !state.loading
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Scan & Create Recipes
              </button>
              
              <p className="mt-4 text-xs text-emerald-400 font-medium italic">
                CulinaScan uses AI to maximize your ingredients and reduce food waste.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                    <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-2">
                      🔍
                    </span>
                    Identified Items
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {state.result.identifiedIngredients.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full border border-emerald-100 font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-800 rounded-full blur-2xl opacity-50"></div>
                  <h2 className="text-lg font-bold mb-3 flex items-center relative z-10">
                    <span className="bg-white/10 p-2 rounded-lg mr-2">
                      🌱
                    </span>
                    Sustainability Tip
                  </h2>
                  <p className="text-emerald-100 leading-relaxed text-sm relative z-10 italic">
                    "{state.result.storageTip}"
                  </p>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img src={state.image!} alt="Your ingredients" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Main Content: Recipes */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">Generated Recipes</h2>
                  <div className="h-px flex-1 bg-emerald-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.result.recipes.map((recipe, idx) => (
                    <RecipeCard key={idx} recipe={recipe} />
                  ))}
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                  <div className="flex space-x-3">
                    <span className="text-2xl">🧂</span>
                    <div>
                      <h4 className="font-bold text-amber-900">Pantry Staple Assumption</h4>
                      <p className="text-sm text-amber-700">These recipes assume you have access to salt, pepper, cooking oil, and water. No other shopping required!</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {state.loading && <LoadingOverlay message={state.statusMessage} />}

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-emerald-50 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hidden sm:block">
            Powered by Gemini AI 3.0 Flash
          </p>
          <div className="flex space-x-3 w-full sm:w-auto">
            {!state.result ? (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
              >
                <CameraIcon className="w-5 h-5" />
                <span>New Scan</span>
              </button>
            ) : (
              <button 
                onClick={reset}
                className="flex-1 sm:flex-none px-8 py-3 bg-emerald-100 text-emerald-700 rounded-full font-bold hover:bg-emerald-200 transition-all"
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
