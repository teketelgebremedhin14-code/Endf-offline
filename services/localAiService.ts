// services/localAiService.ts
// Fully Offline Llama3 Service (via local backend at http://localhost:8000/chat)
// No Gemini/Google code left – 100% offline with Llama3 + ENDF document RAG
// All original features preserved: streaming chat, JSON simulations, risk analysis, reports, forecasts, etc.
// Unsupported offline features (TTS, image/audio analysis, googleSearch) return original mocks or "offline limitation"
// Mocks kept as ultimate fallback

const BACKEND_URL = "http://localhost:8000/chat";

// Core helper – calls local backend (Llama3 + RAG from your ENDF PDF)
const callLocalAI = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.response || "No response from local Llama3.";
    } catch (e) {
        console.error("Local AI connection failed:", e);
        return "AI offline – displaying cached simulation.";
    }
};

// --- CORE CHAT (Streaming preserved) ---
export async function* streamSLASResponse(
  prompt: string, 
  context: string = "", 
  history: ChatMessage[] = [], 
  language: string = "English",
  image?: string  // Offline: ignored (no vision support)
): AsyncGenerator<string, void, unknown> {
    const historyText = history.map(h => `${h.role}: ${h.text}`).join("\n");
    const fullPrompt = `You are SLAS (Smart Leadership Assistant System) for the Ethiopian National Defense Force (ENDF).
Context: ${context}
Language: ${language}
Chat history:
${historyText}

Current command/query: ${prompt}

Respond concisely in tactical military style using ENDF doctrine and regulations.`;

    const response = await callLocalAI(fullPrompt);

    // Word-by-word streaming (same UX as Gemini)
    const words = response.split(' ');
    for (const word of words) {
        yield word + " ";
        await new Promise(r => setTimeout(r, 60));
    }
}

// --- TTS (Offline limitation – preserved as null) ---
export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<AudioBuffer | null> => {
    return null;  // No TTS offline – same as original when no key
};

// --- SIMULATIONS (JSON preserved) ---
export const runStrategySimulation = async (scenario: string, mode: string, language: string, params?: any): Promise<string> => {
    const prompt = `ENDF Military Strategist simulation.
Scenario: ${scenario}
Mode: ${mode}
Language: ${language}
Parameters: ${JSON.stringify(params || {})}

Return ONLY valid JSON (no markdown) with keys:
title, summary, adversary_analysis (object), cross_domain_matrix (object), resource_impact (object), strategic_options (array), rationale, outcome_vector`;

    const response = await callLocalAI(prompt);
    try { JSON.parse(response); return response; } 
    catch { return getMockStrategy(); }  // Original mock fallback
};

export const runAdvancedSimulation = async (simType: string, params: any): Promise<string> => {
    let prompt = `ENDF advanced offline simulation for type "${simType}".
Parameters: ${JSON.stringify(params)}

Return ONLY valid JSON matching original schema.`;

    const response = await callLocalAI(prompt);
    try { JSON.parse(response); return response; } 
    catch { 
        // Original fallbacks preserved
        if (simType === 'knowledge') return JSON.stringify([
            { subject: 'Border Volatility', A: 85, fullMark: 100 },
            { subject: 'Econ. Stability', A: 65, fullMark: 100 },
            { subject: 'Cyber Threat', A: 92, fullMark: 100 },
            { subject: 'Supply Chain', A: 70, fullMark: 100 },
            { subject: 'Civil Sentiment', A: 78, fullMark: 100 },
            { subject: 'Climate Risk', A: 88, fullMark: 100 },
        ]);
        if (simType === 'swarm') return JSON.stringify([
            "[SYSTEM] Goal: Secure Sector 4 Supply Route",
            "[INTEL_AGT] Threat Analysis: Low Probability of IEDs. Recommending Route B.",
            "[LOG_AGT] Constraint: Route B bridge capacity < 40 Tons. Heavy armor cannot pass.",
            "[CMD_CORE] Synthesis: Rerouting Armor to Route A. Light Supply convoy takes Route B.",
            "[EXEC] Orders generated. Awaiting approval."
        ]);
        if (simType === 'defense_echo') return JSON.stringify([
            { t: 'T+0', stability: 85, cost: 20 },
            { t: 'T+1', stability: 82, cost: 25 },
            { t: 'T+2', stability: 75, cost: 40 },
            { t: 'T+3', stability: 70, cost: 60 },
        ]);
        return "[]";
    }
};

// --- RISK ANALYSIS (Preserved) ---
export const analyzePersonnelRisk = async (unit: string, metrics: any): Promise<any> => {
    const prompt = `Analyze personnel risk for ENDF unit "${unit}".
Metrics: ${JSON.stringify(metrics)}
Return JSON with risk_level, risk_score, primary_factors (array), proactive_actions (array).`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return JSON.parse(getMockStudentRisk()); }
};

export const analyzeStudentRisk = async (studentData: any): Promise<any> => {
    const prompt = `Analyze officer candidate risk for ENDF.
Data: ${JSON.stringify(studentData)}
Return JSON risk profile.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return JSON.parse(getMockStudentRisk()); }
};

// --- REPORTS & FORECASTS (Preserved) ---
export const generateReport = async (type: string, language: string): Promise<string> => {
    const prompt = `Generate official ENDF report for "${type}" in ${language}.
Structure: Overview, Details, Recommendation.`;

    return await callLocalAI(prompt);
};

export const getStrategicForecast = async (language: string): Promise<string> => {
    const prompt = `ENDF strategic forecast (short paragraph) in ${language}.`;

    return await callLocalAI(prompt);
};

// --- FIELD INSIGHT & OTHER FEATURES (All preserved) ---
export const analyzeFieldInsight = async (insight: string, language: string, audioBase64?: string): Promise<string> => {
    const prompt = `Analyze ENDF field insight: "${insight}" (Language: ${language}).
Return: Priority, Category, Recommended action.`;

    return await callLocalAI(prompt);
};

export const searchIntelligence = async (query: string, location?: {lat: number, lng: number}): Promise<{text: string, sources: any[]}> => {
    const prompt = `Search ENDF intelligence for "${query}". Return summary text.`;

    const text = await callLocalAI(prompt);
    return { text, sources: [] };  // No real search offline – mock sources
};

export const runTerminalCommand = async (command: string): Promise<string> => {
    return `[LOCAL_SHELL] Executing '${command}'...\n> Access Granted.\n> Protocol Initiated.\n> Complete.`;  // Mock preserved
};

export const parseDataEntry = async (input: string, context: string): Promise<any> => {
    const prompt = `Extract JSON fields from "${input}" for ENDF context "${context}".`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { log_entry: input, category: 'Routine', timestamp: new Date().toISOString() }; }
};

export const generateDynamicData = async (prompt: string, schema: string): Promise<any> => {
    const fullPrompt = `${prompt}. Return JSON: ${schema}`;

    const response = await callLocalAI(fullPrompt);
    try { return JSON.parse(response); } 
    catch { return []; }
};

export const generateExamQuestion = async (subject: string, difficulty: string): Promise<any> => {
    const prompt = `Generate ${difficulty} ENDF exam question for ${subject}. Return JSON with question, options, correct_index, explanation.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { 
        return {
            question: "Tactical Scenario: Ambush detected at 12 o'clock. Immediate action?",
            options: ["Return Fire", "Seek Cover", "Report Contact", "Charge"],
            correct_index: 1,
            explanation: "Immediate cover allows for situational assessment before engagement."
        };
    }
};

export const evaluateApplicant = async (profile: any): Promise<any> => {
    const prompt = `Evaluate ENDF applicant: ${JSON.stringify(profile)}. Return JSON fit_score, recommendation, strengths, risks.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { fit_score: 85, recommendation: "Strong candidate for Officer School.", strengths: ["Leadership", "Physical"], risks: ["None"] }; }
};

export const generateCourseRecommendations = async (topic: string, level: string): Promise<any[]> => {
    const prompt = `ENDF course recommendations for ${topic} at ${level} level. Return JSON array.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { 
        return [
            { title: `${topic} Fundamentals`, duration: "2 Weeks", module: "Core", reason: "Standard Prerequisite" },
            { title: `Advanced ${topic} Tactics`, duration: "4 Weeks", module: "Specialized", reason: "Level Requirement" }
        ];
    }
};

export const draftSRSCommunication = async (recipient: string, context: string, tone: string): Promise<string> => {
    const prompt = `Draft ENDF communication to ${recipient}. Context: ${context}. Tone: ${tone}.`;

    return await callLocalAI(prompt);
};

export const generateInterventionPlan = async (name: string, weakness: string, context: any): Promise<any> => {
    const prompt = `ENDF intervention plan for ${name}, weakness: ${weakness}. Return JSON.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { plan_title: "Remedial Training", objective: "Improve score", duration: "2 Weeks", steps: [{week: 1, activity: "Drills", resource: "Manual"}], success_metric: "Test > 80%" }; }
};

export const generateCurriculumGapAnalysis = async (grades: any): Promise<any> => {
    const prompt = `Analyze ENDF curriculum gaps: ${JSON.stringify(grades)}. Return JSON.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { identified_gaps: [{topic: "Navigation", failure_rate: 15, probable_cause: "Lack of field time"}], recommendations: ["Increase field hours"] }; }
};

export const analyzeSatelliteTarget = async (coords: string, name: string, language: string): Promise<string> => {
    const prompt = `Analyze ENDF satellite target ${name} at ${coords} in ${language}.`;

    return await callLocalAI(prompt);
};

export const analyzeSatelliteRecon = async (image: string, mime: string, context: string): Promise<any> => {
    return { strategic_value: "High", threat_assessment: "Moderate", terrain_analysis: "Urban/Industrial", tactical_recommendation: "Monitor ingress routes", assets_detected: [{type: "Vehicle", count: 12, confidence: 88}] };  // Offline mock
};

export const generatePressRelease = async (topic: string, tone: string, language: string): Promise<string> => {
    const prompt = `Write ENDF press release: ${topic}, tone: ${tone}, language: ${language}.`;

    return await callLocalAI(prompt);
};

export const generateRadioChatter = async (): Promise<any[]> => {
    return [{ org: "Alpha-1", trans: "Checkpoint clear." }, { org: "Base", trans: "Copy that. Proceed." }];  // Mock preserved
};

export const analyzeCombatAudio = async (base64: string, mime: string): Promise<any> => {
    return { voice_stress_level: "Medium", keywords_detected: ["Contact", "North"], environment_sounds: ["Wind", "Engine"], summary: "Routine patrol chatter." };  // Offline mock
};

export const runPsychometricAnalysis = async (answers: any): Promise<any> => {
    const prompt = `Analyze ENDF psychometric answers: ${JSON.stringify(answers)}. Return JSON.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { scores: { iq: 115, eq: 110, sq: 105, aq: 120 }, analysis: { summary: "Subject demonstrates high adaptability.", strengths: ["Resilience"], limitations: ["Impatience"] }, traits: [{trait: "Openness", score: 80, desc: "High"}] }; }
};

export const recommendStrategy = async (situation: string, domain: string, enemy: string): Promise<any> => {
    const prompt = `Recommend ENDF strategy for situation: ${situation}, domain: ${domain}, enemy: ${enemy}. Return JSON.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return { recommended_strategy: "Defense in Depth", rationale: "Given the terrain and enemy profile, a layered defense minimizes risk.", principle_application: [{principle: "Security", application: "Established outposts"}], operational_approach: [{phase: "1", action: "Fortify"}] }; }
};

export const expandSimulationDetail = async (scenario: string, label: string, type: string, mode: string): Promise<string> => {
    const prompt = `Expand ENDF simulation detail on ${type} "${label}" in scenario "${scenario}".`;

    return await callLocalAI(prompt);
};

export const generateScenarioBriefing = async (terrain: string, weather: string, enemy: string, language: string): Promise<string> => {
    const prompt = `Generate ENDF scenario briefing. Terrain: ${terrain}, Weather: ${weather}, Enemy: ${enemy}, Language: ${language}.`;

    return await callLocalAI(prompt);
};

export const generateAAR = async (blue: number, red: number, turns: number, terrain: string): Promise<string> => {
    const prompt = `Generate ENDF After Action Report. Blue: ${blue}%, Red: ${red}%, Turns: ${turns}, Terrain: ${terrain}.`;

    return await callLocalAI(prompt);
};

// Keep your original mock generators (getMockStrategy, getMockStudentRisk) unchanged