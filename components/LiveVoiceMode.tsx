
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Personality } from '../types';
import { createPcmBlob, decodeBase64, decodeAudioData } from '../services/audioUtils';
import VoiceIndicator from './VoiceIndicator';

interface LiveVoiceModeProps {
  personality: Personality;
  onExit: () => void;
}

const LiveVoiceMode: React.FC<LiveVoiceModeProps> = ({ personality, onExit }) => {
  const [isActive, setIsActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const stopConversation = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    onExit();
  };

  const startConversation = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      alert("Microphone access denied!");
      return;
    }

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioCtxRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscriptions(prev => [...prev.slice(-3), `Host: ${message.serverContent?.outputTranscription?.text}`]);
          } else if (message.serverContent?.inputTranscription) {
            setTranscriptions(prev => [...prev.slice(-3), `You: ${message.serverContent?.inputTranscription?.text}`]);
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioCtxRef.current) {
            setIsModelSpeaking(true);
            const ctx = outputAudioCtxRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
            };
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
        },
        onerror: (e) => console.error("Live Error", e),
        onclose: () => setIsActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: personality.voiceName } },
        },
        systemInstruction: `${personality.instruction} Talk to the user about trivia. Keep it snappy and mobile-friendly.`,
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      }
    });

    sessionRef.current = await sessionPromise;
  };

  useEffect(() => {
    startConversation();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6">
      <div className="flex flex-col items-center mt-8">
        <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full flex items-center justify-center text-6xl md:text-8xl shadow-2xl transition-all duration-500 bg-gradient-to-br ${personality.color} ${isModelSpeaking ? 'scale-110 shadow-cyan-500/20' : 'scale-100'}`}>
          {personality.avatar}
        </div>
        <h2 className="mt-6 md:mt-8 font-orbitron text-2xl md:text-3xl font-bold tracking-tighter">{personality.name}</h2>
        <p className="text-slate-400 text-sm mt-1">Live Voice Active</p>
      </div>
      
      <div className="w-full max-w-md bg-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-800 my-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <span className="text-[10px] font-orbitron text-slate-500 uppercase">Transcript</span>
          <VoiceIndicator isActive={isModelSpeaking} color={`bg-gradient-to-t ${personality.color}`} />
        </div>
        <div className="space-y-2 md:space-y-3 min-h-[100px] max-h-[150px] overflow-y-auto">
          {transcriptions.map((t, i) => (
            <p key={i} className={`text-xs md:text-sm ${t.startsWith('You:') ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
              {t}
            </p>
          ))}
          {transcriptions.length === 0 && <p className="text-slate-600 text-center italic text-xs">Waiting for voice input...</p>}
        </div>
      </div>

      <button 
        onClick={stopConversation}
        className="mb-8 w-full max-w-xs px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-orbitron transition transform active:scale-95 shadow-lg shadow-red-900/20"
      >
        STOP SESSION
      </button>
    </div>
  );
};

export default LiveVoiceMode;
