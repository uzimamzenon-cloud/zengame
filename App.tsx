
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
    <div className="min-h-screen bg-[#010409] text-[#e6edf3] font-sans selection:bg-blue-500/40 selection:text-white flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[140px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[140px] rounded-full animate-pulse-slow" style={{ animationDelay: '-7s' }} />
      </div>

      <header className="relative z-50 px-6 py-4 md:px-12 flex justify-between items-center border-b border-white/5 backdrop-blur-3xl sticky top-0 transition-all duration-500">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-150" />
            <div className="relative w-10 h-10 md:w-11 md:h-11 bg-[#0d1117] border border-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:border-blue-400/50 transition-all duration-500 transform group-hover:rotate-6">
               <span className="font-orbitron font-black text-xl text-white tracking-tighter">Z</span>
            </div>
          </div>
          <h1 className="font-orbitron font-extrabold text-base md:text-lg tracking-[0.2em] uppercase">
            Zen<span className="text-blue-500 font-medium">Game</span>
          </h1>
        </div>
        
        {view === 'playing' && (
          <button 
            onClick={() => setView('live')}
            className="px-6 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-orbitron font-black tracking-widest transition-all flex items-center gap-3 group"
          >
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1 h-3 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 h-3 bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            MODE VOCAL
          </button>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col items-center">
        {view === 'intro' && (
          <div className="max-w-4xl w-full text-center animate-fadeIn my-auto">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/5 text-blue-400 text-[9px] md:text-[11px] font-orbitron font-black tracking-[0.3em] mb-12 border border-blue-500/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              CORE INTERFACE v2.1
            </div>
            <h2 className="text-5xl md:text-8xl lg:text-9xl font-orbitron font-black mb-12 leading-[1] tracking-tighter uppercase">
              ÉVEILLEZ VOTRE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 drop-shadow-sm">POTENTIEL</span>
            </h2>
            <p className="text-base md:text-xl text-[#8b949e] mb-16 max-w-2xl mx-auto leading-relaxed font-light tracking-wide px-4">
              Défiez une intelligence artificielle générative dans une expérience de quiz immersive et personnalisable.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setView('personality')}
                className="group relative px-14 py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl font-orbitron font-black text-xs tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all transform hover:scale-[1.05] active:scale-95 overflow-hidden"
              >
                INITIALISER LE SYSTÈME
              </button>
            </div>
          </div>
        )}

        {view === 'personality' && (
          <div className="max-w-6xl w-full animate-fadeIn">
            <div className="flex items-center mb-16 relative">
              <button 
                onClick={goBack}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white transition-all border border-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <h2 className="text-2xl md:text-4xl font-orbitron font-black tracking-tight w-full text-center uppercase pr-11">SÉLECTION DE L'HÔTE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPersonality(p); setView('topic'); }}
                  className="group relative p-10 rounded-[2.5rem] glass-card text-left flex flex-col h-full overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700`} />
                  <div className="text-6xl mb-10 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 block">{p.avatar}</div>
                  <h3 className="font-orbitron font-bold text-xl mb-4 uppercase tracking-tighter">{p.name}</h3>
                  <p className="text-sm text-[#8b949e] font-medium leading-relaxed flex-grow">{p.description}</p>
                  <div className={`mt-8 w-8 h-1 bg-gradient-to-r ${p.color} rounded-full transition-all group-hover:w-full`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'topic' && (
          <div className="max-w-2xl w-full text-center animate-fadeIn my-auto">
            <div className="flex justify-center mb-12">
              <button 
                onClick={goBack}
                className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 text-[10px] font-orbitron font-black text-[#8b949e] hover:text-blue-400 uppercase tracking-widest transition-all border border-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                CHANGER D'HÔTE
              </button>
            </div>
            
            <div className="mb-12 flex flex-col items-center">
                <div className="text-8xl mb-8 animate-float">{selectedPersonality?.avatar}</div>
                <h2 className="text-3xl md:text-4xl font-orbitron font-black mb-4 uppercase tracking-wider">DOMAINE D'ÉTUDE</h2>
                <p className="text-sm md:text-base text-[#8b949e] font-medium tracking-widest">
                  SYNCHRONISÉ AVEC <span className="text-white font-bold">{selectedPersonality?.name}</span>
                </p>
            </div>
            
            <div className="relative mb-12">
              <input
                type="text"
                placeholder="Quel sujet vous passionne ?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                className="w-full p-8 bg-[#0d1117]/60 border border-white/10 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-medium text-center placeholder:text-slate-700"
              />
            </div>

            <div className="mb-16">
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); startQuiz(t); }}
                    className={`px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-xs font-bold text-[#8b949e] hover:border-blue-500/40 hover:text-blue-400 transition-all active:scale-95 ${topic === t ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startQuiz()}
              disabled={!topic}
              className="w-full py-7 rounded-3xl bg-blue-600 disabled:opacity-20 disabled:grayscale font-orbitron font-black text-sm tracking-[0.3em] transition-all hover:bg-blue-500 shadow-2xl shadow-blue-500/20 uppercase"
            >
              GÉNÉRER LE QUIZ
            </button>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] my-auto">
            <div className="relative w-32 h-32 mb-16">
              <div className="absolute inset-0 border-[4px] border-blue-500/10 rounded-full" />
              <div className="absolute inset-0 border-[4px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-6 border border-white/5 rounded-full animate-pulse" />
            </div>
            <p className="font-orbitron text-2xl font-black animate-pulse tracking-[0.4em] text-white uppercase">ANALYSE EN COURS</p>
            <p className="text-[#8b949e] mt-6 font-medium text-sm tracking-widest opacity-60">CONSULTATION DES ARCHIVES GÉNÉRATIVES</p>
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
            <div className="text-9xl mb-14 drop-shadow-2xl">{selectedPersonality.avatar}</div>
            <h2 className="text-6xl md:text-8xl font-orbitron font-black mb-8 tracking-tighter uppercase">SCORE: <span className="text-blue-500">{finalScore}</span>/{questions.length}</h2>
            <p className="text-xl md:text-2xl text-[#8b949e] mb-16 font-medium tracking-tight">
              {finalScore === questions.length 
                ? "MAÎTRISE TOTALE DU FLUX D'INFORMATION." 
                : "SYNCHRONISATION PARTIELLE DÉTECTÉE."}
            </p>
            
            <div className={`p-12 md:p-16 rounded-[3rem] glass-panel border-l-[12px] ${selectedPersonality.color} mb-16 text-left relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32" />
              <h3 className="font-orbitron font-black text-xs mb-8 text-blue-400 uppercase tracking-[0.5em]">RAPPORT FINAL</h3>
              <p className="text-xl md:text-3xl italic text-white font-light leading-relaxed relative z-10">
                "{finalScore === questions.length 
                  ? "Votre structure mentale est d'une clarté absolue. Une performance digne des plus grands érudits."
                  : "Chaque erreur est une porte vers une nouvelle compréhension. Le processus d'apprentissage continue."}"
              </p>
            </div>

            <button
              onClick={reset}
              className="px-16 py-7 bg-white text-[#010409] rounded-[2rem] font-orbitron font-black text-sm tracking-[0.3em] hover:bg-[#e6edf3] transition-all shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] active:scale-95 uppercase"
            >
              RETOURNER AU NOYAU
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[#484f58] text-[10px] font-orbitron font-bold tracking-[0.6em] uppercase opacity-70">
            ZenGame Neural Engine • Powered by Gemini • v2.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
