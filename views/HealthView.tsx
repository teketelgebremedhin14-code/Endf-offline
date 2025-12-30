
import React, { useState, useEffect } from 'react';
import { HeartPulse, Stethoscope, Ambulance, Activity, X, Siren, MapPin, Building, Package, BrainCircuit, Moon, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

interface MedevacMission {
    id: string;
    location: string;
    type: 'Air (Helo)' | 'Ground (Ambulance)';
    status: 'Dispatched' | 'En Route' | 'Retrieving' | 'Returning';
    patients: number;
    eta: string;
}

const HealthView: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'facilities' | 'logistics' | 'resilience'>('overview');
  const [triageStats, setTriageStats] = useState({ critical: 4, serious: 12, minor: 45 });
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [missions, setMissions] = useState<MedevacMission[]>([
      { id: 'MED-992', location: 'Sector 4', type: 'Air (Helo)', status: 'Returning', patients: 2, eta: '12m' }
  ]);
  
  // 6.2 Resilience Data
  const stressData = [
      { unit: '3rd Div', stress: 78, sleep: 5.5, fatigue: 82 },
      { unit: 'Agazi', stress: 65, sleep: 6.2, fatigue: 60 },
      { unit: '4th Mech', stress: 45, sleep: 7.0, fatigue: 40 },
      { unit: 'Air Wing', stress: 55, sleep: 6.5, fatigue: 50 },
  ];

  const trendData = [
      { day: 'Mon', risk: 30 }, { day: 'Tue', risk: 32 }, { day: 'Wed', risk: 45 },
      { day: 'Thu', risk: 42 }, { day: 'Fri', risk: 68 }, { day: 'Sat', risk: 65 },
  ];
  
  const facilities = [
      { name: 'Armed Forces General Hospital', loc: 'Addis Ababa', beds: 400, occupied: 345, status: 'Operational' },
      { name: 'Northern Command Referral', loc: 'Mekelle', beds: 150, occupied: 98, status: 'High Load' },
      { name: 'Air Force Hospital', loc: 'Bishoftu', beds: 80, occupied: 20, status: 'Operational' },
  ];

  // Dispatch Form State
  const [dispatchLoc, setDispatchLoc] = useState('Sector 1');
  const [dispatchType, setDispatchType] = useState<MedevacMission['type']>('Ground (Ambulance)');

  // Simulate Live Triage Updates
  useEffect(() => {
    const interval = window.setInterval(() => {
        setTriageStats(prev => ({
            critical: Math.max(0, prev.critical + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
            serious: Math.max(0, prev.serious + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : -1) : 0)),
            minor: Math.max(0, prev.minor + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 3 : -2) : 0)),
        }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = (e: React.FormEvent) => {
      e.preventDefault();
      const newMission: MedevacMission = {
          id: `MED-${Math.floor(Math.random() * 9000) + 1000}`,
          location: dispatchLoc,
          type: dispatchType,
          status: 'Dispatched',
          patients: Math.floor(Math.random() * 5) + 1,
          eta: 'CALCULATING...'
      };
      setMissions([newMission, ...missions]);
      setShowDispatchModal(false);

      // Simulate mission progress
      setTimeout(() => {
          setMissions(prev => prev.map(m => m.id === newMission.id ? { ...m, status: 'En Route', eta: '45m' } : m));
      }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
         <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('health_title')}</h2>
          <p className="text-gray-400 text-sm">{t('health_subtitle')}</p>
        </div>
        <div className="flex space-x-2">
             <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex space-x-1">
                <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'bg-military-800 text-gray-400'}`}>TRIAGE</button>
                <button onClick={() => setActiveTab('facilities')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'facilities' ? 'bg-red-600 text-white' : 'bg-military-800 text-gray-400'}`}>FACILITIES</button>
                <button onClick={() => setActiveTab('resilience')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'resilience' ? 'bg-blue-600 text-white' : 'bg-military-800 text-gray-400'}`}>
                    <BrainCircuit size={12} className="inline mr-1" /> {t('health_tab_resilience')}
                </button>
                <button onClick={() => setActiveTab('logistics')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'logistics' ? 'bg-red-600 text-white' : 'bg-military-800 text-gray-400'}`}>SUPPLIES</button>
            </div>
            <button 
                onClick={() => setShowDispatchModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center shadow-lg shadow-red-900/20 transition-all animate-pulse hover:animate-none"
            >
                <Siren size={16} className="mr-2" /> {t('health_dispatch_btn')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <MetricCard title={t('health_metric_readiness')} value="96.4%" change={0.2} icon={HeartPulse} color="success" />
        <MetricCard title={t('health_metric_capacity')} value="85%" change={-5} icon={Activity} color="warning" />
        <MetricCard title={t('health_metric_medevac')} value={missions.length} change={missions.length > 2 ? 10 : 0} icon={Ambulance} color="danger" />
        <MetricCard title={t('health_stress_index')} value="MEDIUM" icon={BrainCircuit} color="accent" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        
        {/* 6.2 - PROACTIVE HEALTH & RESILIENCE */}
        {activeTab === 'resilience' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                    <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                        <BrainCircuit className="mr-2 text-blue-500" size={20} /> {t('health_bio_analysis')}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Aggregated biometric data anonymized for unit readiness assessment.</p>
                    
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stressData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} hide />
                                <YAxis dataKey="unit" type="category" width={80} stroke="#94a3b8" fontSize={11} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                <Bar dataKey="stress" name="Stress Index" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={10} />
                                <Bar dataKey="fatigue" name="Fatigue Level" fill="#eab308" radius={[0, 4, 4, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex space-x-4 text-xs">
                        <div className="flex items-center text-gray-400"><div className="w-3 h-3 bg-red-500 mr-2 rounded"></div> Stress Index</div>
                        <div className="flex items-center text-gray-400"><div className="w-3 h-3 bg-yellow-500 mr-2 rounded"></div> Fatigue Level</div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Early Warning */}
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                        <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                            <AlertTriangle className="mr-2 text-yellow-500" size={20} /> {t('health_early_warn')}
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded flex items-start">
                                <Activity className="text-red-500 mr-3 mt-1" size={16} />
                                <div>
                                    <h4 className="text-sm font-bold text-red-400">3rd Division - Fatigue Risk</h4>
                                    <p className="text-xs text-gray-400 mt-1">Sleep debt exceeds 24h average. 45% decline in cognitive reaction times detected.</p>
                                    <button className="mt-2 text-[10px] bg-red-900/50 text-white px-2 py-1 rounded hover:bg-red-800">Assign 72h Rotation</button>
                                </div>
                            </div>
                            <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded flex items-start">
                                <Moon className="text-blue-500 mr-3 mt-1" size={16} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-400">Agazi - Sleep Recovery</h4>
                                    <p className="text-xs text-gray-400 mt-1">Recovery protocols active. Biometrics stabilizing.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Anonymous Help & Plans */}
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                            <ShieldCheck className="mr-2 text-green-500" size={20} /> Resilience Resources
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-military-900 rounded border border-military-600 hover:border-green-500 transition-colors flex flex-col items-center justify-center text-center">
                                <UserCheck className="mb-2 text-green-500" size={24} />
                                <span className="text-xs font-bold text-white">Personalized Health Plan</span>
                            </button>
                            <button className="p-4 bg-military-900 rounded border border-military-600 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-center group">
                                <Lock className="mb-2 text-blue-500 group-hover:animate-pulse" size={24} />
                                <span className="text-xs font-bold text-white">{t('health_anon_portal')}</span>
                                <span className="text-[9px] text-gray-500 mt-1">Encrypted & Confidential</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Existing Tabs */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Triage Status */}
                <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-white">{t('health_triage')}</h3>
                        <span className="flex items-center text-[10px] text-green-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                            {t('lbl_live_feed')}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-red-900/20 p-4 rounded border border-red-900/50 transition-all duration-500">
                            <span className="block text-3xl font-bold text-red-500">{triageStats.critical}</span>
                            <span className="text-xs text-red-400 uppercase tracking-wider font-bold">{t('status_critical')}</span>
                        </div>
                        <div className="bg-yellow-900/20 p-4 rounded border border-yellow-900/50 transition-all duration-500">
                            <span className="block text-3xl font-bold text-yellow-500">{triageStats.serious}</span>
                            <span className="text-xs text-yellow-400 uppercase tracking-wider font-bold">{t('status_medium')}</span>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded border border-green-900/50 transition-all duration-500">
                            <span className="block text-3xl font-bold text-green-500">{triageStats.minor}</span>
                            <span className="text-xs text-green-400 uppercase tracking-wider font-bold">{t('status_low')}</span>
                        </div>
                    </div>
                </div>

                {/* Active Medical Operations */}
                <div className="bg-military-800 rounded-lg border border-military-700 flex flex-col">
                    <div className="p-4 border-b border-military-700 bg-military-900/50">
                        <h3 className="font-semibold text-white">{t('health_operations')}</h3>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                        {missions.map((mission) => (
                            <div key={mission.id} className="bg-military-900 p-3 rounded border border-military-600 flex justify-between items-center animate-in slide-in-from-right-5">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded mt-1 ${mission.type.includes('Air') ? 'bg-blue-900/30 text-blue-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                        <Ambulance size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{mission.type === 'Air (Helo)' ? t('health_air_evac') : t('health_ground_unit')} - {mission.id}</h4>
                                        <p className="text-xs text-gray-400 flex items-center">
                                            <MapPin size={10} className="mr-1"/> {mission.location} • {mission.patients} Pax
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-white block">{mission.status}</span>
                                    <span className="text-[10px] text-gray-500">{t('lbl_eta')}: {mission.eta}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'facilities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto">
                {facilities.map((fac, idx) => (
                    <div key={idx} className="bg-military-800 rounded-lg border border-military-700 p-5 flex flex-col hover:border-red-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white text-lg">{fac.name}</h3>
                                <p className="text-xs text-gray-400 flex items-center"><MapPin size={10} className="mr-1"/> {fac.loc}</p>
                            </div>
                            <div className="p-2 bg-military-900 rounded">
                                <Building size={20} className="text-red-500" />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Occupancy</span>
                                    <span>{Math.round((fac.occupied / fac.beds) * 100)}%</span>
                                </div>
                                <div className="w-full bg-military-900 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            (fac.occupied / fac.beds) > 0.9 ? 'bg-red-500' : 
                                            (fac.occupied / fac.beds) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} 
                                        style={{ width: `${(fac.occupied / fac.beds) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>{fac.occupied} In-Patient</span>
                                    <span>{fac.beds} Total</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-military-700 flex justify-between items-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    fac.status === 'Operational' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                }`}>{fac.status}</span>
                                <button className="text-xs text-blue-400 hover:text-white">View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'logistics' && (
            <div className="h-full bg-military-800 rounded-lg border border-military-700 p-6 overflow-y-auto">
                <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                    <Package className="mr-2 text-blue-500" size={20} /> Medical Stockpile Status (Part 7.2)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="p-4 bg-military-900 rounded border border-military-600">
                            <h4 className="text-sm font-bold text-white mb-3">Trauma Kits</h4>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold text-green-500">8,500</span>
                                <span className="text-xs text-gray-400">Target: 10,000</span>
                            </div>
                            <div className="w-full bg-military-800 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-military-900 rounded border border-military-600">
                            <h4 className="text-sm font-bold text-white mb-3">Anti-Malarials</h4>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold text-yellow-500">12,000</span>
                                <span className="text-xs text-gray-400">Target: 20,000</span>
                            </div>
                            <div className="w-full bg-military-800 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-[10px] text-yellow-500 mt-2 flex items-center"><Activity size={10} className="mr-1"/> Seasonal demand spike expected in Sector 3.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-military-900 rounded border border-military-600">
                            <h4 className="text-sm font-bold text-white mb-3">Blood Bank (O-Neg)</h4>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold text-red-500">450 U</span>
                                <span className="text-xs text-gray-400">Critical Level: 400 U</span>
                            </div>
                            <div className="w-full bg-military-800 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '25%' }}></div>
                            </div>
                            <button className="mt-3 w-full bg-red-900/50 hover:bg-red-900 text-red-300 text-xs py-2 rounded border border-red-800 transition-colors">
                                INITIATE DONATION DRIVE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-military-800 border border-military-600 rounded-lg w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-military-700 flex justify-between items-center bg-red-900/10">
                      <h3 className="font-bold text-white flex items-center">
                          <Siren className="mr-2 text-red-500" /> {t('health_dispatch_btn')}
                      </h3>
                      <button onClick={() => setShowDispatchModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleDispatch} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('health_target_loc')}</label>
                          <select 
                             value={dispatchLoc}
                             onChange={(e) => setDispatchLoc(e.target.value)}
                             className="w-full bg-military-900 border border-military-600 rounded p-2 text-white text-sm"
                          >
                              <option>{t('loc_sector_1')}</option>
                              <option>{t('loc_sector_4')}</option>
                              <option>{t('loc_grid_88')}</option>
                              <option>Addis Ababa HQ</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('health_asset_type')}</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                type="button"
                                onClick={() => setDispatchType('Ground (Ambulance)')}
                                className={`p-3 border rounded flex flex-col items-center justify-center transition-all ${dispatchType.includes('Ground') ? 'bg-yellow-900/30 border-yellow-500 text-yellow-400' : 'border-military-600 text-gray-400'}`}
                              >
                                  <Ambulance size={24} className="mb-2"/>
                                  <span className="text-xs font-bold">{t('health_ground_unit')}</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setDispatchType('Air (Helo)')}
                                className={`p-3 border rounded flex flex-col items-center justify-center transition-all ${dispatchType.includes('Air') ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'border-military-600 text-gray-400'}`}
                              >
                                  <Activity size={24} className="mb-2"/>
                                  <span className="text-xs font-bold">{t('health_air_evac')}</span>
                              </button>
                          </div>
                      </div>
                      
                      <div className="bg-military-900 p-3 rounded text-xs text-gray-400 border border-military-700">
                          <p className="flex items-center"><Activity size={12} className="mr-2"/> {t('health_est_time')}: <span className="text-white ml-1 font-bold">12-18 Mins</span></p>
                      </div>

                      <div className="pt-2 flex justify-end">
                          <button 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded flex items-center transition-colors w-full justify-center"
                          >
                              {t('health_confirm_btn')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default HealthView;
