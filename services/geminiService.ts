
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TriviaQuestion } from "../types";
import { TRIVIA_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchTriviaQuestions(topic: string): Promise<TriviaQuestion[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: TRIVIA_PROMPT(topic),
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "answer", "explanation"]
        }
      }
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sourceUrls = groundingChunks
    .map((chunk: any) => chunk.web?.uri)
    .filter(Boolean);

  try {
    const questions: TriviaQuestion[] = JSON.parse(response.text);
    return questions.map(q => ({ ...q, sourceUrls }));
  } catch (e) {
    console.error("Failed to parse trivia questions", e);
    return [];
  }
}

export async function generateSpeech(text: string, voiceName: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) {
    console.error("TTS Error:", err);
    return undefined;
  }
}
