
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
      alert("Erreur lors de l'accès aux archives cognitives. Réessayez un autre domaine.");
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
    <div className="min-h-screen flex flex-col relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/5 blur-[120px] rounded-full animate-float opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-violet-600/5 blur-[120px] rounded-full animate-float opacity-40" style={{ animationDelay: '-6s' }} />
      </div>

      <header className="relative z-50 px-6 py-5 md:px-12 flex justify-between items-center border-b border-white/[0.05] backdrop-blur-2xl sticky top-0 transition-all duration-500">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-150" />
            <div className="relative w-11 h-11 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
               <span className="font-orbitron font-black text-2xl text-white tracking-tighter">Z</span>
               <div className="absolute bottom-0 w-full h-[2px] bg-blue-500 opacity-50"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-orbitron font-black text-base md:text-lg tracking-[0.25em] uppercase leading-none">
              Zen<span className="text-blue-500">Game</span>
            </h1>
            <span className="text-[8px] font-orbitron tracking-[0.4em] text-white/30 uppercase mt-1">Cognitive Interface</span>
          </div>
        </div>
        
        {view === 'playing' && (
          <button 
            onClick={() => setView('live')}
            className="px-6 py-2.5 rounded-full border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 text-blue-400 text-[10px] md:text-xs font-orbitron font-bold tracking-widest transition-all flex items-center gap-3 group active:scale-95"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              LIVE AUDIO
            </div>
          </button>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-24 flex-grow flex flex-col items-center">
        {view === 'intro' && (
          <div className="max-w-4xl w-full text-center animate-fadeIn my-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] text-blue-400 text-[10px] md:text-[11px] font-orbitron font-black tracking-[0.4em] mb-12 border border-white/[0.05] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              STATION DE RECHERCHE IA
            </div>
            <h2 className="text-5xl md:text-8xl lg:text-9xl font-orbitron font-black mb-12 leading-[1.1] tracking-tighter uppercase glow-text">
              DÉCODEZ LE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">SAVOIR</span>
            </h2>
            <p className="text-base md:text-xl text-white/50 mb-16 max-w-2xl mx-auto leading-relaxed font-light tracking-wide px-4">
              Une expérience multimodale propulsée par Gemini 3. <br className="hidden md:block"/> Connectez-vous à l'intelligence générative pour une exploration sans limite.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setView('personality')}
                className="shimmer group relative px-16 py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl font-orbitron font-black text-xs tracking-[0.3em] shadow-[0_20px_50px_-15px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.05] active:scale-95 uppercase"
              >
                INITIALISER LE PROTOCOLE
              </button>
            </div>
          </div>
        )}

        {view === 'personality' && (
          <div className="max-w-6xl w-full animate-fadeIn">
            <div className="flex items-center mb-16 relative">
              <button 
                onClick={goBack}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <h2 className="text-2xl md:text-4xl font-orbitron font-black tracking-tight w-full text-center uppercase pr-11">SÉLECTION DE L'INTERFACE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPersonality(p); setView('topic'); }}
                  className="group relative p-10 rounded-[2.5rem] glass-card text-left flex flex-col h-full overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-10 blur-3xl transition-all duration-700`} />
                  <div className="text-6xl mb-12 transform group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500 block grayscale group-hover:grayscale-0">{p.avatar}</div>
                  <h3 className="font-orbitron font-bold text-xl mb-4 uppercase tracking-tighter text-white/90 group-hover:text-white transition-colors">{p.name}</h3>
                  <p className="text-sm text-white/40 font-medium leading-relaxed flex-grow group-hover:text-white/70 transition-colors">{p.description}</p>
                  <div className={`mt-10 h-1 bg-gradient-to-r ${p.color} rounded-full transition-all w-8 group-hover:w-full`} />
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
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-white/5 text-[10px] font-orbitron font-black text-white/40 hover:text-blue-400 uppercase tracking-widest transition-all border border-white/5 backdrop-blur-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                RECONFIGURER L'HÔTE
              </button>
            </div>
            
            <div className="mb-14 flex flex-col items-center">
                <div className="text-8xl mb-8 animate-float drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{selectedPersonality?.avatar}</div>
                <h2 className="text-3xl md:text-5xl font-orbitron font-black mb-5 uppercase tracking-wider">CHAMP D'ANALYSE</h2>
                <p className="text-sm md:text-base text-white/30 font-bold tracking-[0.3em] uppercase">
                  SYNCHRONISÉ AVEC <span className="text-blue-500">{selectedPersonality?.name}</span>
                </p>
            </div>
            
            <div className="relative mb-12">
              <input
                type="text"
                placeholder="Quel sujet souhaitez-vous explorer ?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                className="w-full p-8 bg-white/[0.03] border border-white/10 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-medium text-center placeholder:text-white/10"
              />
            </div>

            <div className="mb-16">
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); startQuiz(t); }}
                    className={`px-6 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-xs font-black text-white/40 hover:border-blue-500/40 hover:text-blue-400 transition-all active:scale-95 uppercase tracking-wider ${topic === t ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startQuiz()}
              disabled={!topic}
              className="shimmer w-full py-7 rounded-[1.5rem] bg-blue-600 disabled:opacity-20 disabled:grayscale font-orbitron font-black text-sm tracking-[0.4em] transition-all hover:bg-blue-500 shadow-2xl shadow-blue-500/20 uppercase"
            >
              LANCER LA SIMULATION
            </button>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] my-auto">
            <div className="relative w-36 h-36 mb-16">
              <div className="absolute inset-0 border-[5px] border-blue-500/10 rounded-full" />
              <div className="absolute inset-0 border-[5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-8 border border-white/5 rounded-full animate-pulse" />
            </div>
            <p className="font-orbitron text-2xl font-black animate-pulse tracking-[0.5em] text-white uppercase glow-text">COMPILATION...</p>
            <p className="text-white/20 mt-6 font-bold text-[10px] tracking-[0.4em] uppercase">ACCÈS AUX ARCHIVES GÉNÉRATIVES EN COURS</p>
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
          <div className="max-w-4xl w-full text-center animate-fadeIn my-auto">
            <div className="text-[10rem] mb-14 opacity-20 transition-opacity hover:opacity-100 duration-1000 cursor-default">{selectedPersonality.avatar}</div>
            <h2 className="text-6xl md:text-9xl font-orbitron font-black mb-8 tracking-tighter uppercase">RÉSULTAT: <span className="text-blue-500">{finalScore}</span>/{questions.length}</h2>
            <p className="text-xl md:text-3xl text-white/50 mb-16 font-light tracking-tight max-w-2xl mx-auto">
              {finalScore === questions.length 
                ? "SYNCHRONISATION ABSOLUE. VOTRE NIVEAU COGNITIF EST SUPÉRIEUR." 
                : "ANALYSE TERMINÉE. CERTAINS MODULES REQUIÈRENT UNE RÉVISION."}
            </p>
            
            <div className={`p-12 md:p-20 rounded-[4rem] glass-panel border-l-[16px] ${selectedPersonality.color} mb-16 text-left relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
              <h3 className="font-orbitron font-black text-xs mb-10 text-blue-400 uppercase tracking-[0.6em]">SYNTHÈSE DE {selectedPersonality.name}</h3>
              <p className="text-2xl md:text-4xl italic text-white font-extralight leading-relaxed relative z-10 tracking-wide">
                "{finalScore === questions.length 
                  ? "Votre esprit traite l'information avec une vélocité remarquable. Vous êtes en parfaite symbiose avec le flux."
                  : "L'apprentissage est une boucle infinie. Ces erreurs ne sont que des balises vers votre future maîtrise."}"
              </p>
            </div>

            <button
              onClick={reset}
              className="px-16 py-8 bg-white text-black rounded-[2.5rem] font-orbitron font-black text-sm tracking-[0.4em] hover:bg-white/90 transition-all shadow-[0_40px_80px_-20px_rgba(255,255,255,0.2)] active:scale-95 uppercase"
            >
              NOUVELLE SESSION
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-16 border-t border-white/[0.05] mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/20 text-[9px] font-orbitron font-black tracking-[0.7em] uppercase">
            ZenGame Architecture • Neural Platform • © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
