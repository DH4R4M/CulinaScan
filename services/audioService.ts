
import { GoogleGenAI, Modality } from "@google/genai";

let activeSource: AudioBufferSourceNode | null = null;
let audioContext: AudioContext | null = null;

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const stopSpeech = () => {
  if (activeSource) {
    try {
      activeSource.stop();
    } catch (e) {
      // Ignore errors if already stopped
    }
    activeSource = null;
  }
};

export const speakText = async (text: string) => {
  // Stop any currently playing audio first
  stopSpeech();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this cooking instruction clearly and helpfully: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1,
    );

    activeSource = audioContext.createBufferSource();
    activeSource.buffer = audioBuffer;
    activeSource.connect(audioContext.destination);
    activeSource.start();
    
    return new Promise((resolve) => {
      if (activeSource) {
        activeSource.onended = () => {
          activeSource = null;
          resolve(true);
        };
      }
    });
  } catch (error) {
    console.error("Audio generation failed:", error);
  }
};
