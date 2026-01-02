import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, Volume2, VolumeX, Radio, Activity, FileText, CheckSquare, Clock, X, ChevronDown, Camera } from 'lucide-react';
import { streamSLASResponse } from '../services/localAiService';  // Only local offline Llama3
import { useLanguage } from '../contexts/LanguageContext';
import { ChatMessage } from '../types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: t('slas_welcome') || 'SLAS Online – Awaiting Command.', timestamp: new Date() }
  ]);

  // Camera State (preserved – offline vision mock)
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Camera Functions (preserved)
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
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    const imageToSend = capturedImage;

    if ((!textToSend.trim() && !imageToSend) || loading || liveMode) return;

    let displayText = textToSend || "[Image Attached]";
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: displayText, timestamp: new Date() };
    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInput('');
    setCapturedImage(null);
    setLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

    let fullText = '';
    try {
      const stream = streamSLASResponse(
        textToSend || "Analyze attached image.",
        currentView,
        messages,
        language,
        imageToSend || undefined
      );

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }

      // Voice mode mock (offline – no real TTS)
      if (voiceMode && fullText) {
        console.log("TTS Mock: Speaking response (offline – no audio playback)");
      }
    } catch (e) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: "AI offline – using cached response." } : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  // Live mode mock (preserved animation – no real audio uplink)
  const toggleLiveMode = () => {
    setLiveMode(!liveMode);
  };

  return (
    <>
      <div className={`fixed z-[100] transition-all duration-300 ${isOpen ? 'inset-0' : 'bottom-16 right-4 md:bottom-6 md:right-6 w-auto'}`}>
        {isOpen && (
          <div className="w-full h-full md:w-96 md:max-h-[80vh] bg-military-900 md:bg-military-800 md:border md:border-military-600 md:rounded-lg shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-military-900 p-4 md:p-3 border-b border-military-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot size={20} className="text-military-accent animate-pulse" />
                <span className="font-bold text-sm tracking-wider text-white">SLAS: Smart Leadership Assistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={toggleLiveMode}
                  className={`p-2 rounded-full ${liveMode ? 'bg-red-900/50 text-red-400 border-red-500 animate-pulse' : 'bg-military-800 text-gray-400 border-military-600'}`}
                >
                  {liveMode ? <Radio size={20} /> : <Mic size={20} />}
                </button>
                <button 
                  onClick={() => setVoiceMode(!voiceMode)} 
                  disabled={liveMode}
                  className={`${voiceMode ? 'text-green-400' : 'text-gray-500'} ${liveMode ? 'opacity-30' : ''}`}
                >
                  {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Live Mode Animation */}
            {liveMode ? (
              <div className="flex-1 bg-black/90 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-military-accent/50 flex items-center justify-center">
                  <Activity size={48} className="text-military-accent animate-bounce" />
                </div>
                <h3 className="text-white font-bold text-xl mt-8">LIVE UPLINK ACTIVE</h3>
                <p className="text-military-accent/80 text-sm mt-2 animate-pulse">Listening...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {/* Shortcuts when new */}
                {messages.length === 1 && (
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => handleSend("Generate a situation report.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700">
                      <FileText size={18} className="mr-3 text-blue-400" />
                      Generate Report
                    </button>
                    <button onClick={() => handleSend("Check pending approvals.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700">
                      <CheckSquare size={18} className="mr-3 text-green-400" />
                      Pending Approvals
                    </button>
                    <button onClick={() => handleSend("Suggest predictive tasks.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700">
                      <Clock size={18} className="mr-3 text-yellow-400" />
                      Predictive Tasks
                    </button>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-center text-gray-400">Thinking...</div>}
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && !liveMode && (
              <div className="bg-military-800 p-2 border-t border-military-700 flex items-center justify-between">
                <img src={capturedImage} alt="Captured" className="h-10 w-10 object-cover rounded" />
                <button onClick={() => setCapturedImage(null)}><X size={16} /></button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-military-900 border-t border-military-700 flex items-center space-x-2">
              <button onClick={startCamera} disabled={loading || liveMode || !!capturedImage}>
                <Camera size={20} className="text-gray-400" />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={capturedImage ? "Add context..." : "Enter command..."}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg"
                disabled={loading || liveMode}
              />
              <button onClick={handleSend} disabled={loading || (!input && !capturedImage)}>
                <Send size={20} className="text-white" />
              </button>
            </div>

            {/* Camera Overlay */}
            {showCamera && (
              <div className="absolute inset-0 bg-black z-20 flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
                <div className="p-4 flex justify-center space-x-4 bg-black/80">
                  <button onClick={stopCamera} className="bg-gray-700 px-4 py-2 rounded text-white">CANCEL</button>
                  <button onClick={captureImage} className="bg-red-600 px-6 py-2 rounded text-white">CAPTURE</button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>
        )}

        {/* FAB */}
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-military-accent text-white shadow-2xl">
            <Bot size={28} />
          </button>
        )}
      </div>
    </>
  );
};

export default SLASAssistant;