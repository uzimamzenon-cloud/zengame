
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Personality, TriviaQuestion } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../services/audioUtils';
import VoiceIndicator from './VoiceIndicator';

interface GameScreenProps {
  personality: Personality;
  questions: TriviaQuestion[];
  onFinish: (score: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ personality, questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hostFeedback, setHostFeedback] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentQuestion = questions[currentIndex];

  const speakText = useCallback(async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    setIsSpeaking(true);
    const base64Audio = await generateSpeech(text, personality.voiceName);
    if (base64Audio) {
      const audioData = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } else {
      setIsSpeaking(false);
    }
  }, [personality.voiceName]);

  useEffect(() => {
    const introText = `Bienvenue. Commençons l'analyse. Première interrogation : ${currentQuestion.question}`;
    speakText(introText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (option: string) => {
    if (selectedOption || showExplanation) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.answer;
    
    let feedback = "";
    if (isCorrect) {
      setScore(s => s + 1);
      feedback = `Correct. Analyse exacte. ${currentQuestion.explanation}`;
    } else {
      feedback = `Écart constaté. La réponse était ${currentQuestion.answer}. ${currentQuestion.explanation}`;
    }
    
    setHostFeedback(feedback);
    setShowExplanation(true);
    await speakText(feedback);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setShowExplanation(false);
      setHostFeedback("");
      const nextQ = questions[nextIdx];
      speakText(`Nouveau module. Question numéro ${nextIdx + 1} : ${nextQ.question}`);
    } else {
      onFinish(score);
    }
  };

  const repeatQuestion = () => {
    if (isSpeaking) return;
    const textToRepeat = hostFeedback || currentQuestion.question;
    speakText(textToRepeat);
  };

  return (
    <div className="max-w-4xl w-full animate-fadeIn flex flex-col items-center">
      {/* Host Area */}
      <div className={`w-full mb-12 p-8 md:p-12 rounded-[3rem] glass-panel border-l-[12px] ${personality.color} relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-2xl`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="text-7xl md:text-8xl relative z-10 transition-transform hover:scale-105 duration-500">{personality.avatar}</div>
        <div className="flex-1 w-full relative z-10 text-center md:text-left">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h3 className="font-orbitron text-xs md:text-sm font-black uppercase tracking-[0.4em] text-blue-400">{personality.name}</h3>
            <div className="flex items-center gap-6">
              <button 
                onClick={repeatQuestion}
                disabled={isSpeaking}
                className="text-[10px] font-orbitron font-bold text-slate-500 hover:text-blue-400 disabled:opacity-20 transition-all uppercase tracking-widest flex items-center gap-2 group"
                title="Répéter l'analyse vocale"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:rotate-12 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                RÉPÉTER
              </button>
              <VoiceIndicator isActive={isSpeaking} color={`bg-gradient-to-t ${personality.color}`} />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-light italic text-slate-100 leading-relaxed tracking-wide">
            {hostFeedback ? hostFeedback : `"${currentQuestion.question}"`}
          </p>
        </div>
      </div>

      {/* Progress & UI Info */}
      <div className="w-full max-w-2xl px-2">
        <div className="mb-4 flex justify-between items-center text-[10px] font-orbitron font-black text-slate-500 tracking-[0.4em] uppercase opacity-70">
          <span>MODULE {currentIndex + 1} / {questions.length}</span>
          <span>SCORE: <span className="text-blue-500">{score}</span></span>
        </div>
        <div className="w-full bg-slate-900/40 h-1 rounded-full mb-12 overflow-hidden border border-white/5">
          <div 
            className={`h-full bg-gradient-to-r ${personality.color} transition-all duration-1000 ease-in-out`}
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Answer Grid */}
        <div className="grid grid-cols-1 gap-4 mb-12">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = "glass-card border-white/5 text-slate-300";
            if (selectedOption) {
              if (option === currentQuestion.answer) {
                stateClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-100 scale-[1.02] shadow-xl shadow-emerald-500/5";
              } else if (option === selectedOption) {
                stateClass = "bg-rose-500/20 border-rose-500/40 text-rose-100 opacity-60";
              } else {
                stateClass = "opacity-20 grayscale pointer-events-none";
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(option)}
                className={`group p-6 text-left rounded-3xl border transition-all duration-500 flex items-center ${stateClass}`}
              >
                <span className={`flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center mr-6 text-[10px] font-orbitron font-black group-hover:border-blue-400/40 transition-all ${selectedOption && option === currentQuestion.answer ? 'border-emerald-400 bg-emerald-950/40' : ''}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-base md:text-lg font-medium tracking-wide">{option}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="flex justify-center animate-fadeIn">
            <button
              onClick={nextQuestion}
              className={`w-full py-6 rounded-3xl bg-gradient-to-r ${personality.color} font-orbitron font-black text-xs tracking-[0.3em] text-white shadow-2xl hover:brightness-110 transform transition-all active:scale-95 uppercase`}
            >
              {currentIndex + 1 === questions.length ? "FINALISER LA SESSION" : "SYNCHRONISER LE MODULE SUIVANT"}
            </button>
          </div>
        )}

        {currentQuestion.sourceUrls && currentQuestion.sourceUrls.length > 0 && (
          <div className="mt-16 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[9px] font-orbitron font-black text-slate-500 uppercase tracking-[0.5em] mb-6">ARCHIVES EXTERNES DÉTECTÉES</p>
            <div className="flex flex-wrap justify-center gap-4">
              {currentQuestion.sourceUrls.slice(0, 3).map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9px] font-orbitron font-bold text-slate-600 hover:text-blue-400 transition-all flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  RÉFÉRENCE {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
