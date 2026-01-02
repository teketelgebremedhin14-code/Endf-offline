
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, AlertCircle, StopCircle, Volume2, VolumeX, Radio, Activity, FileText, CheckSquare, Zap, Clock, X, ChevronDown, Camera, Image as ImageIcon } from 'lucide-react';
import { streamSLASResponse, generateSpeech } from '../services/localAiService';
import { ChatMessage } from '../types';

  return () => {
    second
  };
}, [third])";
import { useLanguage } from '../contexts/LanguageContext';

interface SLASAssistantProps {
  currentView: string;
}

const SLASAssistant: React.FC<SLASAssistantProps> = ({ currentView }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: t('slas_welcome'), timestamp: new Date() }
  ]);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isLiveRef = useRef(false);

  useEffect(() => {
    setMessages(prev => {
        if (prev.length === 1 && prev[0].id === '1') {
            return [{ id: '1', role: 'model', text: t('slas_welcome'), timestamp: new Date() }];
        }
        return prev;
    });
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const getApiKey = (): string | undefined => {
      try {
          if (typeof process !== 'undefined' && process.env) {
              return process.env.API_KEY;
          }
      } catch (e) {
          return undefined;
      }
      return undefined;
  };

  const playResponse = async (text: string) => {
      if (!voiceMode || liveMode) return;
      setIsPlaying(true);
      const audioBuffer = await generateSpeech(text);
      
      if (audioBuffer) {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') await ctx.resume();

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => setIsPlaying(false);
          source.start();
      } else {
          setIsPlaying(false);
      }
  };

  // ... (Live API helper functions: base64ToUint8Array, uint8ArrayToBase64, decodeAudioData, startLiveSession, stopLiveSession remain unchanged)
  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function uint8ArrayToBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext) {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length;
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
      }
      return buffer;
  }

  const startLiveSession = async () => {
      if (liveMode) return;
      const apiKey = getApiKey();
      if (!apiKey) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Error: API Key missing. Live Uplink Unavailable.', timestamp: new Date() }]);
          return;
      }

      try {
          const ai = new GoogleGenAI({ apiKey: apiKey });
          setLiveMode(true);
          isLiveRef.current = true;
          
          inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          nextStartTimeRef.current = outputContextRef.current.currentTime;

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  systemInstruction: `You are SLAS (Smart Leadership Assistant System), a military AI interface for the Ethiopian National Defense Force. 
                  Current Context: User is viewing the ${currentView} module.
                  Keep responses brief, tactical, and authoritative. Use military terminology.`,
              },
              callbacks: {
                  onopen: () => {
                      if (!inputContextRef.current || !isLiveRef.current) return;
                      const ctx = inputContextRef.current;
                      inputSourceRef.current = ctx.createMediaStreamSource(stream);
                      processorRef.current = ctx.createScriptProcessor(4096, 1, 1);
                      
                      processorRef.current.onaudioprocess = (e) => {
                          if (!isLiveRef.current) return;
                          
                          const inputData = e.inputBuffer.getChannelData(0);
                          const int16 = new Int16Array(inputData.length);
                          for (let i = 0; i < inputData.length; i++) {
                              int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                          }
                          const base64Data = uint8ArrayToBase64(new Uint8Array(int16.buffer));
                          
                          sessionPromise.then(session => {
                              if (isLiveRef.current) {
                                  session.sendRealtimeInput({
                                      media: {
                                          mimeType: 'audio/pcm;rate=16000',
                                          data: base64Data
                                      }
                                  });
                              }
                          });
                      };

                      inputSourceRef.current.connect(processorRef.current);
                      processorRef.current.connect(ctx.destination);
                  },
                  onmessage: async (msg: LiveServerMessage) => {
                      if (!isLiveRef.current) return;
                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData && outputContextRef.current) {
                          const bytes = base64ToUint8Array(audioData);
                          const buffer = await decodeAudioData(bytes, outputContextRef.current);
                          
                          const source = outputContextRef.current.createBufferSource();
                          source.buffer = buffer;
                          source.connect(outputContextRef.current.destination);
                          
                          const startTime = Math.max(outputContextRef.current.currentTime, nextStartTimeRef.current);
                          source.start(startTime);
                          nextStartTimeRef.current = startTime + buffer.duration;
                          
                          audioSourcesRef.current.add(source);
                          source.onended = () => audioSourcesRef.current.delete(source);
                      }
                  },
                  onclose: () => {
                      stopLiveSession();
                  },
                  onerror: (err) => {
                      console.error("Live Session Error", err);
                      stopLiveSession();
                  }
              }
          });
          
          sessionPromise.catch(err => {
              stopLiveSession();
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Error: Live Uplink Failed. Connection Refused (Status 500/0).', timestamp: new Date() }]);
          });

          liveSessionRef.current = sessionPromise;

      } catch (e) {
          console.error("Failed to start live session", e);
          stopLiveSession();
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Error: Live Session Init Failed.', timestamp: new Date() }]);
      }
  };

  const stopLiveSession = () => {
      isLiveRef.current = false;
      setLiveMode(false);
      
      try {
        inputSourceRef.current?.disconnect();
        processorRef.current?.disconnect();
        inputSourceRef.current = null;
        processorRef.current = null;
      } catch (e) {}
      
      if (inputContextRef.current) {
          try { inputContextRef.current.close().catch(() => {}); } catch (e) {}
          inputContextRef.current = null;
      }

      if (outputContextRef.current) {
          try { outputContextRef.current.close().catch(() => {}); } catch (e) {}
          outputContextRef.current = null;
      }
      
      audioSourcesRef.current.forEach(s => {
          try { s.stop(); } catch (e) { }
      });
      audioSourcesRef.current.clear();

      if (liveSessionRef.current) {
          const sessionToClose = liveSessionRef.current;
          liveSessionRef.current = null;
          sessionToClose.then((session: any) => {
              try { session.close(); } catch(e) { }
          }).catch(() => {});
      }
  };

  // Camera Functions
  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setShowCamera(true);
      } catch (err) {
          console.error("Camera error:", err);
          alert("Unable to access camera.");
      }
  };

  const stopCamera = () => {
      if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
      }
      setShowCamera(false);
  };

  const captureImage = () => {
      if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context?.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvasRef.current.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
          stopCamera();
      }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    const imageToSend = capturedImage;
    
    // Allow sending if text OR image is present
    if ((!textToSend.trim() && !imageToSend) || loading || liveMode) return;
    
    // Display message
    let displayText = textToSend;
    if (imageToSend && !textToSend) displayText = "[Image Attached]";
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: displayText, timestamp: new Date() };
    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInput('');
    setCapturedImage(null); // Clear image after send
    setLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

    let fullText = '';
    try {
        const stream = streamSLASResponse(textToSend || "Analyze this image.", currentView, messages, language, imageToSend || undefined); 

        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: fullText } : msg
            ));
        }
        
        if (voiceMode && fullText) {
            await playResponse(fullText);
        }

    } catch (e) {
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: "Error: Secure uplink failed." } : msg
        ));
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Trigger / Main Toggle */}
      <div className={`fixed z-[100] transition-all duration-300 ${isOpen ? 'inset-0' : 'bottom-16 right-4 md:bottom-6 md:right-6 w-auto'}`}>
        
        {/* Chat Interface Container */}
        {isOpen && (
          <div className="w-full h-full md:w-96 md:h-auto md:max-h-[80vh] bg-military-900 md:bg-military-800 md:border md:border-military-600 md:rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 relative">
            
            {/* Header */}
            <div className="bg-military-900 p-4 md:p-3 border-b border-military-700 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Bot size={20} className="text-military-accent animate-pulse" />
                <span className="font-bold text-sm tracking-wider font-display text-white">{t('slas_module_title')}</span>
              </div>
              <div className="flex items-center space-x-3">
                  <button 
                      onClick={() => {
                          if (liveMode) stopLiveSession();
                          else startLiveSession();
                      }}
                      className={`p-2 rounded-full transition-all flex items-center justify-center border ${liveMode ? 'bg-red-900/50 text-red-400 border-red-500 animate-pulse' : 'bg-military-800 text-gray-400 border-military-600 hover:text-white hover:border-military-500'}`}
                      title={liveMode ? "Disconnect Live Uplink" : "Connect Live Uplink"}
                  >
                      {liveMode ? <Radio size={20} /> : <Mic size={20} />}
                  </button>
                  <button 
                      onClick={() => setVoiceMode(!voiceMode)} 
                      disabled={liveMode}
                      className={`p-2 rounded-full transition-colors ${voiceMode ? 'text-green-400 bg-green-900/30' : 'text-gray-500'} ${liveMode ? 'opacity-30' : ''}`}
                      title={voiceMode ? "TTS Active (Text Mode)" : "TTS Muted"}
                  >
                      {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  <button onClick={() => { stopLiveSession(); setIsOpen(false); }} className="text-gray-400 hover:text-white p-2">
                      <ChevronDown size={24} className="md:hidden" />
                      <X size={20} className="hidden md:block" />
                  </button>
              </div>
            </div>
            
            {/* Content Area */}
            {liveMode ? (
                <div className="flex-1 bg-black/90 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="w-40 h-40 bg-military-accent rounded-full blur-[50px] animate-pulse"></div>
                    </div>
                    
                    <div className="z-10 flex flex-col items-center p-6">
                        <div className="w-32 h-32 rounded-full border-4 border-military-accent/50 flex items-center justify-center shadow-[0_0_30px_#0ea5e9] relative mb-8">
                            <div className="w-24 h-24 bg-military-accent/20 rounded-full animate-ping absolute"></div>
                            <Activity size={48} className="text-military-accent animate-bounce" />
                        </div>
                        <h3 className="text-white font-bold text-xl font-display tracking-widest">{t('slas_uplink_active')}</h3>
                        <p className="text-military-accent/80 text-sm font-mono mt-2 animate-pulse">{t('slas_listening')}</p>
                    </div>

                    <div className="absolute bottom-0 w-full px-4 md:px-8 pb-4">
                        <div className="flex justify-between items-end h-12 space-x-1">
                            {[...Array(20)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-full bg-military-accent/50 rounded-t"
                                  style={{ 
                                      height: `${Math.random() * 100}%`,
                                      animation: `pulse 0.${Math.floor(Math.random() * 5 + 2)}s infinite alternate`
                                  }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-military-900/95 custom-scrollbar relative" ref={scrollRef}>
                   <div className="flex justify-center">
                      <span className="text-[10px] bg-military-800 text-gray-400 px-2 py-0.5 rounded-full uppercase font-mono tracking-wide border border-military-700">
                          Context: {currentView}
                      </span>
                   </div>

                   {/* Camera Overlay */}
                   {showCamera && (
                        <div className="absolute inset-0 bg-black z-20 flex flex-col">
                            <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
                            <div className="p-4 flex justify-center space-x-4 bg-black/80">
                                <button onClick={stopCamera} className="bg-gray-700 px-4 py-2 rounded text-white text-xs font-bold">CANCEL</button>
                                <button onClick={captureImage} className="bg-red-600 px-6 py-2 rounded text-white text-xs font-bold">CAPTURE</button>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                   )}

                   {/* 4.1 Feature Shortcuts */}
                   {messages.length === 1 && (
                       <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-2">
                           <button onClick={() => handleSend("Generate a situation report based on current metrics.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                               <FileText size={18} className="mr-3 text-blue-400" />
                               {t('slas_action_report')}
                           </button>
                           <button onClick={() => handleSend("Check for pending approvals requiring executive action.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                               <CheckSquare size={18} className="mr-3 text-green-400" />
                               {t('slas_action_approve')}
                           </button>
                           <button onClick={() => handleSend("Analyze resource allocation and suggest predictive tasks.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                               <Clock size={18} className="mr-3 text-yellow-400" />
                               {t('slas_action_task')}
                           </button>
                       </div>
                   )}

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-md leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-military-accent text-white rounded-br-none font-sans font-medium' 
                          : 'bg-military-800 text-gray-200 rounded-bl-none border-l-2 border-military-accent font-sans'
                      }`}>
                        {msg.text}
                        {msg.role === 'model' && loading && msg.id === messages[messages.length - 1].id && (
                            <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && !liveMode && (
                <div className="bg-military-800 p-2 border-t border-military-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={capturedImage} alt="Captured" className="h-10 w-10 object-cover rounded border border-military-600" />
                        <span className="ml-2 text-xs text-green-400 font-mono">[IMAGE READY]</span>
                    </div>
                    <button onClick={() => setCapturedImage(null)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-military-900 border-t border-military-700 flex items-center space-x-2 shrink-0 pb-safe md:pb-3">
              {liveMode && <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center text-sm font-mono text-gray-400 backdrop-blur-sm">{t('slas_voice_occupied')}</div>}
              
              <button 
                onClick={startCamera} 
                disabled={loading || liveMode || !!capturedImage}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-military-800 border border-military-600 disabled:opacity-30"
              >
                  <Camera size={20} />
              </button>

              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={capturedImage ? "Add context to image..." : t('slas_placeholder')}
                className="flex-1 bg-military-800 border border-military-600 rounded-full px-4 py-3 text-base focus:outline-none focus:border-military-accent text-white placeholder-gray-500 font-sans"
                disabled={loading || liveMode}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={loading || (!input && !capturedImage) || liveMode} 
                className="p-3 bg-military-accent hover:bg-sky-500 rounded-full text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Button (Only visible when closed) */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full shadow-2xl transition-all border border-military-accent/50 bg-military-accent text-white hover:bg-sky-400 hover:scale-105 active:scale-95"
            >
                <div className="relative flex items-center">
                    <Bot size={28} className={loading ? "animate-spin" : ""} />
                    {liveMode && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping border border-white"></span>}
                    <span className="hidden md:inline font-semibold pl-2 font-display tracking-wide">SLAS AI</span>
                </div>
            </button>
        )}
      </div>
    </>
  );
};

export default SLASAssistant;
