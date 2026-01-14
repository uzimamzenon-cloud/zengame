
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
    const introText = `Analyse du premier module. Écoutez attentivement : ${currentQuestion.question}`;
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
      feedback = `Exact. Analyse cohérente. ${currentQuestion.explanation}`;
    } else {
      feedback = `Écart détecté. La réponse était ${currentQuestion.answer}. ${currentQuestion.explanation}`;
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
      speakText(`Nouveau segment cognitif. Question ${nextIdx + 1} : ${nextQ.question}`);
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
      {/* Host Hud */}
      <div className={`w-full mb-16 p-10 md:p-16 rounded-[4rem] glass-panel border-l-[16px] ${personality.color} relative overflow-hidden flex flex-col md:flex-row items-center gap-12 md:gap-16 shadow-2xl transition-all duration-700`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] blur-[150px] rounded-full -mr-48 -mt-48" />
        <div className="text-8xl md:text-9xl relative z-10 transition-transform hover:scale-105 duration-1000">{personality.avatar}</div>
        <div className="flex-1 w-full relative z-10 text-center md:text-left">
          <div className="flex items-center justify-between mb-10 border-b border-white/[0.08] pb-8">
            <h3 className="font-orbitron text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-blue-500">{personality.name}</h3>
            <div className="flex items-center gap-10">
              <button 
                onClick={repeatQuestion}
                disabled={isSpeaking}
                className="text-[10px] font-orbitron font-black text-white/30 hover:text-blue-500 disabled:opacity-10 transition-all uppercase tracking-[0.3em] flex items-center gap-3 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:rotate-12 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                RELECTURE
              </button>
              <VoiceIndicator isActive={isSpeaking} color={`bg-gradient-to-t ${personality.color}`} />
            </div>
          </div>
          <p className="text-2xl md:text-4xl font-extralight italic text-white leading-tight tracking-wide glow-text">
            {hostFeedback ? hostFeedback : `"${currentQuestion.question}"`}
          </p>
        </div>
      </div>

      {/* Control Station */}
      <div className="w-full max-w-2xl px-4">
        <div className="mb-8 flex justify-between items-end text-[10px] font-orbitron font-black text-white/20 tracking-[0.6em] uppercase">
          <div className="flex flex-col gap-2">
            <span className="text-blue-500/40">ANALYSE MODULES</span>
            <span className="text-white text-2xl tracking-normal">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="text-blue-500/40">INDEX COGNITIF</span>
            <span className="text-white text-2xl tracking-normal">{score}</span>
          </div>
        </div>
        
        <div className="w-full bg-white/[0.05] h-2 rounded-full mb-20 overflow-hidden border border-white/[0.05]">
          <div 
            className={`h-full bg-gradient-to-r ${personality.color} transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(59,130,246,0.6)]`}
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Answer Array */}
        <div className="grid grid-cols-1 gap-6 mb-20">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = "glass-card border-white/[0.05] text-white/40";
            if (selectedOption) {
              if (option === currentQuestion.answer) {
                stateClass = "bg-emerald-500/15 border-emerald-500/60 text-emerald-100 scale-[1.05] shadow-[0_0_50px_rgba(16,185,129,0.2)]";
              } else if (option === selectedOption) {
                stateClass = "bg-rose-500/15 border-rose-500/60 text-rose-100 opacity-60";
              } else {
                stateClass = "opacity-10 grayscale pointer-events-none";
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(option)}
                className={`group p-10 text-left rounded-[2.5rem] border transition-all duration-500 flex items-center ${stateClass}`}
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center mr-10 text-xs font-orbitron font-black group-hover:border-blue-500 transition-all ${selectedOption && option === currentQuestion.answer ? 'border-emerald-500 text-emerald-500' : ''}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-xl md:text-2xl font-light tracking-wide">{option}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="flex justify-center animate-fadeIn">
            <button
              onClick={nextQuestion}
              className={`shimmer w-full py-8 rounded-[2rem] bg-gradient-to-r ${personality.color} font-orbitron font-black text-xs tracking-[0.5em] text-white shadow-2xl hover:brightness-110 transform transition-all active:scale-95 uppercase`}
            >
              {currentIndex + 1 === questions.length ? "BILAN FINAL" : "SYNCHRONISER LA SUITE"}
            </button>
          </div>
        )}

        {currentQuestion.sourceUrls && currentQuestion.sourceUrls.length > 0 && (
          <div className="mt-24 text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
            <p className="text-[10px] font-orbitron font-black text-white/20 uppercase tracking-[0.7em] mb-10">ARCHIVES DE VÉRIFICATION</p>
            <div className="flex flex-wrap justify-center gap-6">
              {currentQuestion.sourceUrls.slice(0, 3).map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] font-black text-white/30 hover:text-blue-500 transition-all flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
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
