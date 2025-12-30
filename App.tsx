
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import SLASAssistant from './components/SLASAssistant';
import CommandPalette from './components/CommandPalette';
import DataEntryTerminal from './components/DataEntryTerminal';
import { ViewState } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Bell, Menu, LogOut, AlertTriangle, Globe, ChevronDown } from 'lucide-react';
import { Language } from './data/translations';

// Views
import DashboardOverview from './views/DashboardOverview';
import PresidentialView from './views/PresidentialView';
import PrimeMinisterView from './views/PrimeMinisterView';
import OperationalView from './views/OperationalView';
import IntelligenceView from './views/IntelligenceView';
import LogisticsView from './views/LogisticsView';
import HRView from './views/HRView';
import HealthView from './views/HealthView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import CommunicationsView from './views/CommunicationsView';
import InfoOpsView from './views/InfoOpsView';
import ForeignRelationsView from './views/ForeignRelationsView';
import VeteransView from './views/VeteransView';
import SpaceCommandView from './views/SpaceCommandView';
import AirForceView from './views/AirForceView';
import NavyView from './views/NavyView';
import GroundForcesView from './views/GroundForcesView';
import WargamingView from './views/WargamingView';
import MinistryView from './views/MinistryView';
import ChiefOfStaffView from './views/ChiefOfStaffView';
import CouncilView from './views/CouncilView';
import IntegrationView from './views/IntegrationView';
import PeacekeepingView from './views/PeacekeepingView';
import SpecialOpsView from './views/SpecialOpsView';
import AINexusView from './views/AINexusView';
import PsychProfileView from './views/PsychProfileView';
import LegalView from './views/LegalView';
import EngineeringView from './views/EngineeringView';
import InspectorGeneralView from './views/InspectorGeneralView';
import TrainingView from './views/TrainingView';
import FinanceView from './views/FinanceView';

const MainLayout: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.OVERVIEW);
  const [defcon, setDefcon] = useState(3);
  const [mode, setMode] = useState<'standard' | 'green' | 'red'>('standard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [showDataTerminal, setShowDataTerminal] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Event Listeners for Global Tools
  useEffect(() => {
    const openTerminalHandler = () => setShowDataTerminal(true);
    window.addEventListener('open-data-terminal', openTerminalHandler);
    return () => window.removeEventListener('open-data-terminal', openTerminalHandler);
  }, []);

  // Simulated Notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const alerts = [
          t('notif_1'),
          t('notif_2'),
          t('notif_3'),
          "Satellite realignment complete.",
          "Cyber threat neutralized in Sector 9."
        ];
        const newAlert = alerts[Math.floor(Math.random() * alerts.length)];
        setNotifications(prev => [newAlert, ...prev].slice(0, 5));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, t]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView(ViewState.OVERVIEW);
  };

  const getModeClasses = () => {
      switch(mode) {
          case 'green': return 'grayscale contrast-125 sepia hue-rotate-[50deg] saturate-50'; // Night Vision
          case 'red': return 'grayscale contrast-125 sepia hue-rotate-[320deg] saturate-200'; // Tactical Red
          default: return '';
      }
  };

  const languages: { code: Language, label: string }[] = [
      { code: 'en', label: 'English' },
      { code: 'am', label: 'Amharic (አማርኛ)' },
      { code: 'om', label: 'Oromiffa' },
      { code: 'ti', label: 'Tigrinya' },
      { code: 'so', label: 'Somali' }
  ];

  const renderView = () => {
    switch (currentView) {
      case ViewState.OVERVIEW: return <DashboardOverview onNavigate={setCurrentView} defcon={defcon} />;
      case ViewState.PRESIDENTIAL: return <PresidentialView defcon={defcon} setDefcon={setDefcon} />;
      case ViewState.PRIME_MINISTER: return <PrimeMinisterView defcon={defcon} setDefcon={setDefcon} />;
      case ViewState.OPERATIONS: return <OperationalView />;
      case ViewState.INTELLIGENCE: return <IntelligenceView />;
      case ViewState.LOGISTICS: return <LogisticsView />;
      case ViewState.HR: return <HRView />;
      case ViewState.HEALTH: return <HealthView />;
      case ViewState.REPORTS: return <ReportsView />;
      case ViewState.SETTINGS: return <SettingsView currentMode={mode} onModeChange={setMode} />;
      case ViewState.COMMUNICATIONS: return <CommunicationsView />;
      case ViewState.INFO_OPS: return <InfoOpsView />;
      case ViewState.FOREIGN_RELATIONS: return <ForeignRelationsView />;
      case ViewState.VETERANS: return <VeteransView />;
      case ViewState.SPACE_COMMAND: return <SpaceCommandView />;
      case ViewState.AIR_FORCE: return <AirForceView />;
      case ViewState.NAVY: return <NavyView />;
      case ViewState.GROUND_FORCES: return <GroundForcesView />;
      case ViewState.WARGAMING: return <WargamingView />;
      case ViewState.MINISTRY: return <MinistryView />;
      case ViewState.CHIEF_OF_STAFF: return <ChiefOfStaffView />;
      case ViewState.COUNCIL: return <CouncilView />;
      case ViewState.INTEGRATION: return <IntegrationView />;
      case ViewState.PEACEKEEPING: return <PeacekeepingView />;
      case ViewState.SPECIAL_OPS: return <SpecialOpsView />;
      case ViewState.AI_NEXUS: return <AINexusView />;
      case ViewState.PSYCH_EVAL: return <PsychProfileView />;
      case ViewState.LEGAL: return <LegalView />;
      case ViewState.ENGINEERING: return <EngineeringView />;
      case ViewState.INSPECTOR_GENERAL: return <InspectorGeneralView />;
      case ViewState.TRAINING: return <TrainingView />;
      case ViewState.FINANCE: return <FinanceView />;
      default: return <DashboardOverview onNavigate={setCurrentView} defcon={defcon} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-military-950 text-gray-200 font-sans selection:bg-military-accent selection:text-black ${getModeClasses()}`}>
      
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out hidden md:block overflow-hidden border-r border-military-800 bg-military-900 flex-shrink-0`}>
        <Sidebar currentView={currentView} onViewChange={setCurrentView} defconLevel={defcon} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Bar */}
        <header className={`h-16 bg-military-900/80 backdrop-blur-md border-b border-military-800 flex items-center justify-between px-4 z-20 flex-shrink-0 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-4 text-gray-400 hover:text-white rounded-lg hover:bg-military-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
               <div className="text-xs text-military-500 font-mono tracking-widest uppercase">{t('news_ticker_label')}</div>
               <div className="w-48 md:w-96 overflow-hidden h-5 relative">
                  <div className="animate-marquee whitespace-nowrap text-xs text-military-accent font-mono absolute">
                     {t('news_ticker_items') && notifications.length > 0 ? notifications.join(" ••• ") : "SYSTEM NORMAL ••• SECURE CONNECTION ESTABLISHED ••• ENDF NEXUS ONLINE"}
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative">
                <button 
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-military-800 hover:bg-military-700 text-gray-300 rounded border border-military-600 text-xs font-bold uppercase transition-colors"
                >
                    <Globe size={14} />
                    <span>{languages.find(l => l.code === language)?.label.split(' ')[0] || 'EN'}</span>
                    <ChevronDown size={12} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {langMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-military-900 border border-military-700 rounded shadow-xl z-50 overflow-hidden">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-military-800 transition-colors ${language === lang.code ? 'text-military-accent font-bold bg-military-800/50' : 'text-gray-400'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative group">
               <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-military-800 relative">
                 <Bell size={20} />
                 {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
               </button>
               {/* Dropdown Notification */}
               <div className="absolute right-0 top-full mt-2 w-72 bg-military-900 border border-military-700 rounded shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                  <div className="p-3 border-b border-military-700 text-xs font-bold text-gray-400">{t('hdr_notifications')}</div>
                  <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">{t('hdr_no_alerts')}</div>
                      ) : (
                          notifications.map((n, i) => (
                              <div key={i} className="p-3 border-b border-military-800 text-xs text-gray-300 hover:bg-military-800 cursor-pointer flex items-start">
                                  <AlertTriangle size={12} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"/>
                                  {n}
                              </div>
                          ))
                      )}
                  </div>
               </div>
            </div>
            
            <button 
              onClick={() => setShowPalette(true)}
              className="hidden md:flex items-center px-3 py-1.5 bg-military-800 hover:bg-military-700 text-gray-400 text-xs rounded border border-military-700 transition-colors"
            >
              <span className="mr-2">⌘K</span> {t('cmd_footer')}
            </button>

            <div className="h-8 w-[1px] bg-military-700 mx-2 hidden sm:block"></div>

            <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white">CMDR. ABEBE</div>
                    <div className="text-[10px] text-gray-500 font-mono">LEVEL 5 CLEARANCE</div>
                </div>
                <div className="w-8 h-8 bg-military-800 rounded-full border border-military-600 flex items-center justify-center text-military-accent font-bold text-xs relative">
                    CA
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-military-900 rounded-full"></span>
                </div>
            </div>
            
            <button onClick={handleLogout} className="ml-2 text-gray-500 hover:text-red-400" title={t('logout')}>
                <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-military-950 p-4 md:p-6 relative scroll-smooth" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}>
           {renderView()}
        </main>

        {/* Global Components */}
        <SLASAssistant currentView={currentView} />
        <CommandPalette 
            isOpen={showPalette} 
            onClose={() => setShowPalette(false)} 
            onNavigate={(view) => setCurrentView(view)} 
            onAction={(action) => { if(action === 'logout') handleLogout(); }}
        />
        <DataEntryTerminal 
            currentView={currentView} 
            isOpen={showDataTerminal} 
            onToggle={() => setShowDataTerminal(!showDataTerminal)} 
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
};

export default App;
