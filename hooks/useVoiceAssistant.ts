import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Theme, Message } from '../types';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

const setThemeFunctionDeclaration: FunctionDeclaration = {
  name: 'setTheme',
  parameters: {
    type: Type.OBJECT,
    description: 'Set the color theme of the application.',
    properties: {
      theme: {
        type: Type.STRING,
        description: "The theme to set. Can be 'light' or 'dark'.",
        enum: [Theme.Light, Theme.Dark],
      },
    },
    required: ['theme'],
  },
};

export const useVoiceAssistant = () => {
  const [theme, setTheme] = useState<Theme>(Theme.Dark);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const wakeLockSentinelRef = useRef<any>(null);
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopAudioProcessing = useCallback(() => {
    if (scriptProcessorRef.current && mediaStreamSourceRef.current && inputAudioContextRef.current) {
      scriptProcessorRef.current.disconnect();
      mediaStreamSourceRef.current.disconnect();
      scriptProcessorRef.current = null;
      mediaStreamSourceRef.current = null;
    }
    if(inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
  }, []);

  const stopSession = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    if (wakeLockSentinelRef.current) {
      wakeLockSentinelRef.current.release();
      wakeLockSentinelRef.current = null;
    }

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error('Error closing session:', e);
        setError('Failed to close session.');
      } finally {
        sessionPromiseRef.current = null;
      }
    }
    
    stopAudioProcessing();

    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setIsSessionActive(false);
    setIsProcessing(false);
  }, [stopAudioProcessing]);

  useEffect(() => {
    return () => {
        if (isSessionActive) {
            stopSession();
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionActive]);


  const startSession = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setTranscript([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [setThemeFunctionDeclaration] }],
           systemInstruction: `You are a friendly and helpful voice assistant. Your name is Alexa. You must only speak and understand English and Tamil. If the user speaks in any other language, politely inform them that you can only communicate in English or Tamil. You can control the app's theme by calling the 'setTheme' function. Keep your answers concise and conversational.`
        },
        callbacks: {
          onopen: async () => {
            if ('wakeLock' in navigator) {
              try {
                wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
              } catch (err: any) {
                console.error('Could not get wake lock:', err.message);
              }
            }

            // FIX: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to any to support older browsers.
            inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            // FIX: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to any to support older browsers.
            outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
            
            setIsSessionActive(true);
            setIsProcessing(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if(message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'setTheme' && fc.args.theme) {
                  const newTheme = fc.args.theme as Theme;
                  setTheme(newTheme);
                   if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session) => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: `Theme changed to ${newTheme}` },
                        }
                      });
                    });
                  }
                }
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, OUTPUT_SAMPLE_RATE, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);

              source.addEventListener('ended', () => {
                outputSourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              outputSourcesRef.current.add(source);
            }
            
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscriptionRef.current.trim();
              const fullOutput = currentOutputTranscriptionRef.current.trim();
              
              if(fullInput) {
                setTranscript(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text: fullInput }]);
              }
              if(fullOutput) {
                 setTranscript(prev => [...prev, { id: `asst-${Date.now()}`, role: 'assistant', text: fullOutput }]);
              }

              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError(`Session error: ${e.message}`);
            stopSession();
          },
          onclose: () => {
            console.log('Session closed.');
            stopAudioProcessing();
            setIsSessionActive(false);
          },
        }
      });
    } catch (e: any) {
      console.error('Failed to start session:', e);
      setError(`Failed to start session: ${e.message}`);
      setIsProcessing(false);
    }
  }, [stopAudioProcessing, stopSession]);

  return {
    theme,
    isSessionActive,
    isProcessing,
    transcript,
    error,
    startSession,
    stopSession,
  };
};