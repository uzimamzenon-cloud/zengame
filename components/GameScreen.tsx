
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
    const introText = `Analyse du premier module. Question : ${currentQuestion.question}`;
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
      feedback = `Exact. Analyse correcte. ${currentQuestion.explanation}`;
    } else {
      feedback = `Écart de données. La réponse attendue était ${currentQuestion.answer}. ${currentQuestion.explanation}`;
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
      speakText(`Nouveau module détecté. Question numéro ${nextIdx + 1} : ${nextQ.question}`);
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
      <div className={`w-full mb-16 p-10 md:p-14 rounded-[3.5rem] glass-panel border-l-[14px] ${personality.color} relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-14 shadow-2xl transition-all duration-700`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[120px] rounded-full -mr-40 -mt-40" />
        <div className="text-8xl md:text-9xl relative z-10 drop-shadow-lg">{personality.avatar}</div>
        <div className="flex-1 w-full relative z-10 text-center md:text-left">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
            <h3 className="font-orbitron text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-blue-400">{personality.name}</h3>
            <div className="flex items-center gap-8">
              <button 
                onClick={repeatQuestion}
                disabled={isSpeaking}
                className="text-[10px] font-orbitron font-bold text-[#8b949e] hover:text-blue-400 disabled:opacity-20 transition-all uppercase tracking-[0.2em] flex items-center gap-3 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                RÉPÉTER
              </button>
              <VoiceIndicator isActive={isSpeaking} color={`bg-gradient-to-t ${personality.color}`} />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-light italic text-white leading-tight tracking-wide">
            {hostFeedback ? hostFeedback : `"${currentQuestion.question}"`}
          </p>
        </div>
      </div>

      {/* Progress & UI Info */}
      <div className="w-full max-w-2xl px-4">
        <div className="mb-6 flex justify-between items-end text-[9px] font-orbitron font-black text-[#484f58] tracking-[0.5em] uppercase">
          <div className="flex flex-col gap-1">
            <span className="text-blue-500/60">PROGRESSION</span>
            <span className="text-white text-lg tracking-normal">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-blue-500/60">SCORE</span>
            <span className="text-white text-lg tracking-normal">{score}</span>
          </div>
        </div>
        
        <div className="w-full bg-white/5 h-1.5 rounded-full mb-16 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${personality.color} transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(47,129,247,0.5)]`}
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Answer Grid */}
        <div className="grid grid-cols-1 gap-5 mb-16">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = "glass-card border-white/5 text-[#8b949e]";
            if (selectedOption) {
              if (option === currentQuestion.answer) {
                stateClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-100 scale-[1.03] shadow-[0_0_40px_rgba(16,185,129,0.15)]";
              } else if (option === selectedOption) {
                stateClass = "bg-rose-500/10 border-rose-500/50 text-rose-100 opacity-60";
              } else {
                stateClass = "opacity-20 grayscale pointer-events-none";
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(option)}
                className={`group p-8 text-left rounded-[2rem] border transition-all duration-500 flex items-center ${stateClass}`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-[#010409] border border-white/5 flex items-center justify-center mr-8 text-[11px] font-orbitron font-black group-hover:border-blue-400/40 transition-all ${selectedOption && option === currentQuestion.answer ? 'border-emerald-500 text-emerald-500' : ''}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-lg md:text-xl font-medium tracking-wide">{option}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="flex justify-center animate-fadeIn">
            <button
              onClick={nextQuestion}
              className={`w-full py-7 rounded-[2rem] bg-gradient-to-r ${personality.color} font-orbitron font-black text-xs tracking-[0.4em] text-white shadow-2xl hover:brightness-110 transform transition-all active:scale-95 uppercase`}
            >
              {currentIndex + 1 === questions.length ? "SYNTHÈSE FINALE" : "MODULE SUIVANT"}
            </button>
          </div>
        )}

        {currentQuestion.sourceUrls && currentQuestion.sourceUrls.length > 0 && (
          <div className="mt-20 text-center opacity-30 hover:opacity-100 transition-opacity duration-700">
            <p className="text-[9px] font-orbitron font-black text-[#484f58] uppercase tracking-[0.6em] mb-8">SOURCES FACTUELLES</p>
            <div className="flex flex-wrap justify-center gap-5">
              {currentQuestion.sourceUrls.slice(0, 3).map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] font-bold text-[#8b949e] hover:text-blue-400 transition-all flex items-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/5"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  RÉF. {i + 1}
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
