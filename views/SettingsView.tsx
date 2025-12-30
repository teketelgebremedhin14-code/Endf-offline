
import React, { useState } from 'react';
import { Settings, Bell, Lock, Database, Monitor, Save, RefreshCw, Eye, Globe, Shield, Server, Book, CheckCircle, Info, Layers, ArrowDown, Cpu, Code } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../data/translations';

interface SettingsViewProps {
    currentMode: 'standard' | 'green' | 'red';
    onModeChange: (mode: 'standard' | 'green' | 'red') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentMode, onModeChange }) => {
    const { t, language, setLanguage } = useLanguage();
    const [notifications, setNotifications] = useState(true);
    const [biometric, setBiometric] = useState(true);
    const [refreshRate, setRefreshRate] = useState('30s');
    const [dataSovereignty, setDataSovereignty] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'stack'>('general');

    const languages: { code: Language, label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'am', label: 'Amharic (አማርኛ)' },
        { code: 'om', label: 'Oromiffa (Afaan Oromoo)' },
        { code: 'ti', label: 'Tigrinya (ትግርኛ)' },
        { code: 'so', label: 'Somali (Soomaaliga)' },
        { code: 'aa', label: 'Afar (Qafaraf)' },
        { code: 'sid', label: 'Sidama (Sidaamu Afoo)' },
        { code: 'wal', label: 'Wolayita (Wolayttattuwa)' },
        { code: 'had', label: 'Hadiyya (Hadiyyisa)' },
        { code: 'kam', label: 'Kambata (Kambaata)' }
    ];

    const principles = [
        { title: "Hierarchical Design", desc: "Mirrors exact ENDF command structure with automatic updates to new regulations" },
        { title: "Modular View-Based Access", desc: "Custom interfaces per user role and legal permissions" },
        { title: "AI-First Approach", desc: "Artificial intelligence integrated at every functional level" },
        { title: "Security-First Implementation", desc: "Military-grade encryption and access controls" },
        { title: "Online Operation", desc: "Complete functionality via Gemini" },
        { title: "Multilingual Support", desc: "English, Amharic, Oromo, Tigrinya, Somali, Afar, Sidamo, Wolayita, Hadiyya, Kambata" },
        { title: "Single Nervous System", desc: "Every module interacts through controlled interfaces with centralized data" }
    ];

    const techStack = [
        { module: "14.1 Knowledge Corpus", tech: "Palantir Gotham, QuantCube, BlackSky, Westlaw Edge", desc: "Geopolitical, Legal & Economic Modeling" },
        { module: "14.2 CommandHive", tech: "Microsoft Copilot, DeepMind AlphaFold-Arch, LangChain", desc: "Hierarchical AI Swarm System" },
        { module: "14.3 DefenseEcho", tech: "Causalens, BlackRock Aladdin, C3 AI Gov", desc: "Predictive Governance & Policy Impact" },
        { module: "14.4 FedForceNet", tech: "PySyft, NVIDIA FLARE, IBM Federated Learning", desc: "Privacy-Preserving Federated Intelligence" },
        { module: "14.5 GlobeNet AI", tech: "Google Translate/Whisper, CesiumJS, Raytheon C2", desc: "Global Fusion Command Nexus" },
        { module: "14.6 ThreatEcho", tech: "DARPA PALADIN, Graphika, Unity ML-Agents", desc: "Advanced Wargaming & Disinfo Analysis" },
        { module: "14.7 MatGenForge", tech: "DeepMind GNoME, Citrine Informatics, MATLAB", desc: "Material Discovery Accelerator" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('settings_title')}</h2>
                    <p className="text-gray-400 text-sm">Manage ENDF Nexus preferences and system parameters.</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded text-xs font-bold ${activeTab === 'general' ? 'bg-military-accent text-white' : 'bg-military-800 text-gray-400'}`}>
                        GENERAL
                    </button>
                    <button onClick={() => setActiveTab('stack')} className={`px-4 py-2 rounded text-xs font-bold ${activeTab === 'stack' ? 'bg-purple-600 text-white' : 'bg-military-800 text-gray-400'}`}>
                        TECH STACK
                    </button>
                </div>
            </div>

            {activeTab === 'general' ? (
                <div className="space-y-6">
                    {/* System Principles Section */}
                    <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden">
                        <div className="p-4 border-b border-military-700 bg-military-900/50">
                            <h3 className="font-semibold text-lg text-white flex items-center">
                                <Info size={20} className="mr-2 text-cyan-500" /> Foundational Principles
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {principles.map((p, i) => (
                                    <div key={i} className="flex items-start p-3 bg-military-900/50 rounded border border-military-600">
                                        <CheckCircle size={16} className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{p.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Visual Interface / Tactical Mode */}
                            <section>
                                <h3 className="text-lg font-semibold text-white flex items-center mb-4 pb-2 border-b border-military-700">
                                    <Eye size={20} className="mr-2 text-green-500" /> {t('settings_tactical_mode')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div 
                                        onClick={() => onModeChange('standard')}
                                        className={`p-4 rounded border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${currentMode === 'standard' ? 'border-blue-500 bg-blue-900/20' : 'border-military-600 bg-military-900 hover:bg-military-700'}`}
                                    >
                                        <Monitor size={24} className="mb-2 text-blue-400" />
                                        <span className="font-bold text-white text-sm">{t('set_mode_standard')}</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">{t('set_mode_standard_desc')}</span>
                                    </div>
                                    <div 
                                        onClick={() => onModeChange('green')}
                                        className={`p-4 rounded border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${currentMode === 'green' ? 'border-green-500 bg-green-900/20' : 'border-military-600 bg-military-900 hover:bg-military-700'}`}
                                    >
                                        <Eye size={24} className="mb-2 text-green-500" />
                                        <span className="font-bold text-green-500 text-sm">{t('set_mode_green')}</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">{t('set_mode_green_desc')}</span>
                                    </div>
                                    <div 
                                        onClick={() => onModeChange('red')}
                                        className={`p-4 rounded border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${currentMode === 'red' ? 'border-red-500 bg-red-900/20' : 'border-military-600 bg-military-900 hover:bg-military-700'}`}
                                    >
                                        <Eye size={24} className="mb-2 text-red-500" />
                                        <span className="font-bold text-red-500 text-sm">{t('set_mode_red')}</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">{t('set_mode_red_desc')}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Language Settings */}
                            <section>
                                <h3 className="text-lg font-semibold text-white flex items-center mb-4 pb-2 border-b border-military-700">
                                    <Globe size={20} className="mr-2 text-purple-500" /> {t('settings_language')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code)}
                                            className={`p-2 rounded border text-xs font-bold transition-all ${
                                                language === lang.code 
                                                ? 'border-purple-500 bg-purple-900/20 text-white' 
                                                : 'border-military-600 bg-military-900 text-gray-400 hover:text-white hover:border-gray-500'
                                            }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Security Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-white flex items-center mb-4 pb-2 border-b border-military-700">
                                    <Lock size={20} className="mr-2 text-red-500" /> {t('settings_security')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="font-medium text-gray-200">{t('set_bio')}</h4>
                                            <p className="text-xs text-gray-500">{t('set_bio_desc')}</p>
                                        </div>
                                        <div 
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${biometric ? 'bg-green-500' : 'bg-gray-600'}`}
                                            onClick={() => setBiometric(!biometric)}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${biometric ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="font-medium text-gray-200">{t('set_timeout')}</h4>
                                            <p className="text-xs text-gray-500">{t('set_timeout_desc')}</p>
                                        </div>
                                        <select className="bg-military-800 text-white border border-military-600 rounded px-2 py-1 text-sm">
                                            <option>5 Minutes</option>
                                            <option>15 Minutes</option>
                                            <option>1 Hour</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Notifications Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-white flex items-center mb-4 pb-2 border-b border-military-700">
                                    <Bell size={20} className="mr-2 text-yellow-500" /> {t('settings_notifications')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="font-medium text-gray-200">{t('set_alert_sound')}</h4>
                                            <p className="text-xs text-gray-500">{t('set_alert_sound_desc')}</p>
                                        </div>
                                        <div 
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-green-500' : 'bg-gray-600'}`}
                                            onClick={() => setNotifications(!notifications)}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="font-medium text-gray-200">{t('set_email')}</h4>
                                            <p className="text-xs text-gray-500">{t('set_email_desc')}</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-gray-600`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0`}></div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Data & Network Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-white flex items-center mb-4 pb-2 border-b border-military-700">
                                    <Database size={20} className="mr-2 text-blue-500" /> {t('settings_data')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                                <h4 className="font-medium text-gray-200">{t('set_refresh')}</h4>
                                                <p className="text-xs text-gray-500">{t('set_refresh_desc')}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RefreshCw size={14} className="text-gray-400" />
                                            <select 
                                                value={refreshRate}
                                                onChange={(e) => setRefreshRate(e.target.value)}
                                                className="bg-military-800 text-white border border-military-600 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="10s">Real-time (10s)</option>
                                                <option value="30s">Standard (30s)</option>
                                                <option value="60s">Low Bandwidth (60s)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Data Sovereignty Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <div className="flex items-center">
                                                <Shield size={14} className="text-blue-400 mr-2" />
                                                <h4 className="font-medium text-gray-200">Data Sovereignty Mode</h4>
                                            </div>
                                            <p className="text-xs text-gray-500">Local-only processing. No cloud offload.</p>
                                        </div>
                                        <div 
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${dataSovereignty ? 'bg-blue-600' : 'bg-gray-600'}`}
                                            onClick={() => setDataSovereignty(!dataSovereignty)}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${dataSovereignty ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Four-Layer Architecture Visualization (Section 2) */}
                                <div className="mt-6 p-4 bg-military-900/50 rounded border border-military-600">
                                    <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center">
                                        <Layers size={14} className="mr-2 text-cyan-500" /> Four-Layer Data Flow Architecture (Sec. 2)
                                    </h4>
                                    <div className="flex flex-col space-y-2 relative">
                                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-military-700 -z-10"></div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-900/30 border border-blue-500/50 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold z-10">1</div>
                                            <div className="flex-1 bg-military-800 p-3 rounded border border-military-700">
                                                <div className="flex justify-between">
                                                    <span className="text-xs font-bold text-blue-400">Edge Layer (Field Ops)</span>
                                                    <span className="text-[9px] bg-green-900/30 text-green-400 px-1 rounded">Offline Capable</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Ruggedized devices, Field Insight input, Sensor data.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center ml-6"><ArrowDown size={14} className="text-military-600" /></div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-yellow-900/30 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold z-10">2</div>
                                            <div className="flex-1 bg-military-800 p-3 rounded border border-military-700">
                                                <div className="flex justify-between">
                                                    <span className="text-xs font-bold text-yellow-400">Ingestion Layer</span>
                                                    <span className="text-[9px] bg-green-900/30 text-green-400 px-1 rounded">Encrypted</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Secure transmission, prioritization queue, compression.</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center ml-6"><ArrowDown size={14} className="text-military-600" /></div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/50 rounded-full flex items-center justify-center text-purple-400 text-xs font-bold z-10">3</div>
                                            <div className="flex-1 bg-military-800 p-3 rounded border border-military-700">
                                                <div className="flex justify-between">
                                                    <span className="text-xs font-bold text-purple-400">Processing & AI Layer</span>
                                                    <span className="text-[9px] bg-green-900/30 text-green-400 px-1 rounded">Real-time</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Central DB, SLAS AI Core, Anomaly Detection.</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center ml-6"><ArrowDown size={14} className="text-military-600" /></div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-900/30 border border-green-500/50 rounded-full flex items-center justify-center text-green-400 text-xs font-bold z-10">4</div>
                                            <div className="flex-1 bg-military-800 p-3 rounded border border-military-700">
                                                <div className="flex justify-between">
                                                    <span className="text-xs font-bold text-green-400">Consumption Layer</span>
                                                    <span className="text-[9px] bg-green-900/30 text-green-400 px-1 rounded">&lt;3s Latency</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Command Dashboards, Alerts, Visualizations.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {dataSovereignty && (
                                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded flex items-center text-xs text-blue-300">
                                        <Server size={14} className="mr-2" />
                                        <span>System currently operating on local secure nodes (Addis HQ Server Farm). External API calls restricted to whitelisted IPs.</span>
                                    </div>
                                )}
                            </section>
                        </div>
                        <div className="bg-military-900 p-4 border-t border-military-700 text-center">
                            <p className="text-xs text-gray-500">ENDF Nexus Version 2.4.1 (Build 8992) | Authorized Use Only</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Cpu className="mr-3 text-purple-500" /> Integrated Technology Architecture
                    </h3>
                    <p className="text-sm text-gray-400 mb-8 max-w-2xl">
                        The ENDF Nexus leverages a hybrid architecture of best-in-class open source frameworks and commercial-grade cognitive engines.
                    </p>
                    
                    <div className="space-y-4">
                        {techStack.map((item, idx) => (
                            <div key={idx} className="bg-military-900 p-4 rounded border border-military-600 flex flex-col md:flex-row md:items-center justify-between hover:border-purple-500 transition-colors group">
                                <div className="mb-2 md:mb-0">
                                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{item.module}</h4>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                                <div className="flex items-center bg-black/40 px-3 py-2 rounded border border-military-700">
                                    <Code size={14} className="text-purple-500 mr-2" />
                                    <span className="text-xs font-mono text-purple-300">{item.tech}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
