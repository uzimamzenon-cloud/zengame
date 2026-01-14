
import React, { useState } from 'react';
import { PERSONALITIES, SUGGESTED_TOPICS } from './constants';
import { Personality, TriviaQuestion } from './types';
import { fetchTriviaQuestions } from './services/geminiService';
import GameScreen from './components/GameScreen';
import LiveVoiceMode from './components/LiveVoiceMode';

const App: React.FC = () => {
  const [view, setView] = useState<'intro' | 'personality' | 'topic' | 'loading' | 'playing' | 'live' | 'results'>('intro');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  const startQuiz = async (customTopic?: string) => {
    const activeTopic = customTopic || topic;
    if (!activeTopic || !selectedPersonality) return;
    setView('loading');
    const fetched = await fetchTriviaQuestions(activeTopic);
    if (fetched.length > 0) {
      setQuestions(fetched);
      setView('playing');
    } else {
      alert("Échec de la récupération des données. Veuillez essayer un autre domaine.");
      setView('topic');
    }
  };

  const reset = () => {
    setView('intro');
    setSelectedPersonality(null);
    setTopic('');
    setQuestions([]);
  };

  const goBack = () => {
    if (view === 'personality') setView('intro');
    else if (view === 'topic') setView('personality');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-5s' }} />
      </div>

      <header className="relative z-50 px-6 py-5 md:px-12 flex justify-between items-center border-b border-white/5 backdrop-blur-xl sticky top-0 transition-all duration-300">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150" />
            <div className="relative w-10 h-10 md:w-11 md:h-11 bg-slate-950 border border-white/10 rounded-full flex items-center justify-center shadow-2xl group-hover:border-blue-400/50 transition-all duration-500 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10" />
               <span className="font-orbitron font-black text-xl text-white tracking-tighter drop-shadow-sm">Z</span>
            </div>
          </div>
          <h1 className="font-orbitron font-extrabold text-lg md:text-xl tracking-widest uppercase">
            Zen<span className="text-blue-500 font-medium">Game</span>
          </h1>
        </div>
        
        {view === 'playing' && (
          <button 
            onClick={() => setView('live')}
            className="px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-[10px] md:text-xs font-orbitron font-bold tracking-widest transition-all flex items-center gap-2 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            STREAM LIVE
          </button>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col items-center">
        {view === 'intro' && (
          <div className="max-w-4xl w-full text-center animate-fadeIn my-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-blue-400 text-[10px] md:text-xs font-orbitron font-bold tracking-[0.3em] mb-10 border border-white/5 backdrop-blur-md">
              COGNITIVE INTERFACE v2.0
            </span>
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-orbitron font-black mb-10 leading-[1.05] tracking-tight uppercase">
              REPOUSSEZ LES <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 glow-text">FRONTIÈRES</span>
            </h2>
            <p className="text-base md:text-xl text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
              Plongez dans un écosystème de savoir dirigé par l'IA. <br className="hidden md:block"/> Une expérience modulaire alliant érudition et fluidité.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setView('personality')}
                className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-orbitron font-black text-sm tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                DÉMARRER LA SYNCHRO
              </button>
            </div>
          </div>
        )}

        {view === 'personality' && (
          <div className="max-w-6xl w-full animate-fadeIn">
            <div className="flex items-center mb-12 md:mb-16 relative">
              <button 
                onClick={goBack}
                className="absolute left-0 p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 backdrop-blur-md"
                aria-label="Retour"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <h2 className="text-2xl md:text-4xl font-orbitron font-black tracking-tight w-full text-center uppercase">CHOIX DE L'<span className="text-blue-500">ENTITÉ</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPersonality(p); setView('topic'); }}
                  className="group relative p-10 rounded-[2.5rem] glass-card text-left flex flex-col h-full overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${p.color} opacity-30`} />
                  <div className="text-5xl mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 block grayscale-[0.5] group-hover:grayscale-0">{p.avatar}</div>
                  <h3 className="font-orbitron font-bold text-xl mb-4 uppercase tracking-tighter group-hover:text-white transition-colors">{p.name}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed flex-grow opacity-70 group-hover:opacity-100 transition-opacity">{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'topic' && (
          <div className="max-w-2xl w-full text-center animate-fadeIn my-auto">
            <div className="flex justify-center mb-10">
              <button 
                onClick={goBack}
                className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 text-[10px] font-orbitron font-bold text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-all border border-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                RÉINITIALISER L'ENTITÉ
              </button>
            </div>
            
            <div className="mb-10 flex flex-col items-center">
                <div className="text-7xl mb-6 animate-pulse">{selectedPersonality?.avatar}</div>
                <h2 className="text-3xl md:text-4xl font-orbitron font-black mb-4 uppercase tracking-wider">DOMAINE D'ANALYSE</h2>
                <p className="text-sm md:text-base text-slate-400 font-medium max-w-sm tracking-wide">
                  Interface <span className="text-blue-500 font-bold uppercase tracking-widest">{selectedPersonality?.name}</span> prête.
                </p>
            </div>
            
            <div className="relative mb-10">
              <input
                type="text"
                placeholder="Quel est votre champ d'étude ?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                className="w-full p-6 bg-slate-900/40 border border-white/10 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-medium text-center placeholder:text-slate-600"
              />
            </div>

            <div className="mb-14">
              <p className="text-[10px] font-orbitron font-black text-slate-600 uppercase tracking-[0.4em] mb-6">ARCHIVES SUGGÉRÉES</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); startQuiz(t); }}
                    className={`px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-xs font-bold text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-all active:scale-95 ${topic === t ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startQuiz()}
              disabled={!topic}
              className="w-full py-6 rounded-3xl bg-blue-600 disabled:opacity-20 disabled:grayscale font-orbitron font-black text-sm tracking-[0.2em] transition-all hover:bg-blue-500 shadow-2xl shadow-blue-500/20 uppercase"
            >
              INITIALISER LE FLUX
            </button>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] my-auto">
            <div className="relative w-24 h-24 mb-12">
              <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 border border-blue-400/20 rounded-full animate-pulse" />
            </div>
            <p className="font-orbitron text-xl font-black animate-pulse tracking-[0.3em] text-blue-400 uppercase">EXTRACTION...</p>
            <p className="text-slate-500 mt-5 font-medium text-sm tracking-widest opacity-60">MODULATION DES ARCHIVES COGNITIVES</p>
          </div>
        )}

        {view === 'playing' && selectedPersonality && (
          <GameScreen 
            personality={selectedPersonality} 
            questions={questions} 
            onFinish={(score) => { setFinalScore(score); setView('results'); }}
          />
        )}

        {view === 'live' && selectedPersonality && (
          <LiveVoiceMode 
            personality={selectedPersonality} 
            onExit={() => setView('playing')} 
          />
        )}

        {view === 'results' && selectedPersonality && (
          <div className="max-w-3xl w-full text-center animate-fadeIn my-auto">
            <div className="text-8xl md:text-9xl mb-12 grayscale opacity-50 transition-opacity hover:opacity-100 duration-1000">💠</div>
            <h2 className="text-5xl md:text-7xl font-orbitron font-black mb-6 tracking-tighter uppercase">BILAN: <span className="text-blue-500">{finalScore}</span>/{questions.length}</h2>
            <p className="text-lg md:text-2xl text-slate-400 mb-14 font-medium tracking-tight">
              {finalScore === questions.length 
                ? "SYNERGIE ABSOLUE. VOTRE STRUCTURE COGNITIVE EST OPTIMALE." 
                : "ANALYSE PARTIELLE. LE POTENTIEL D'OPTIMISATION EST SIGNIFICATIF."}
            </p>
            
            <div className={`p-10 md:p-12 rounded-[2.5rem] glass-panel border-l-[10px] ${selectedPersonality.color} mb-14 text-left relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl rounded-full -mr-20 -mt-20" />
              <h3 className="font-orbitron font-black text-xs mb-6 text-blue-400 uppercase tracking-[0.4em]">RAPPORT DE {selectedPersonality.name}</h3>
              <p className="text-lg md:text-2xl italic text-slate-200 font-light leading-relaxed relative z-10">
                "{finalScore === questions.length 
                  ? "Une performance chirurgicale. Votre esprit traite l'information avec une précision quasi algorithmique."
                  : "Certaines données ont échappé à votre analyse. C'est l'essence même de l'apprentissage : identifier les zones d'ombre pour y projeter la lumière."}"
              </p>
            </div>

            <button
              onClick={reset}
              className="group relative px-16 py-6 bg-white text-slate-950 rounded-[1.5rem] font-orbitron font-black text-sm tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95 uppercase overflow-hidden"
            >
              NOUVEAU CYCLE
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12 md:py-20 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-600 text-[9px] font-orbitron font-bold tracking-[0.5em] uppercase opacity-60">
            ZenGame System • Advanced Intelligence Platform • © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
