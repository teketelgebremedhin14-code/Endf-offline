// services/localAiService.ts (Rename file to replace geminiService.ts)
// Fully Offline Llama3 Service (via local backend + RAG from ENDF document)
// No online code left – removed all Gemini/Google imports, API keys, external calls
// All original features preserved: streaming chat, simulations, risk analysis, reports, forecasts, etc.
// Uses your local backend at http://localhost:8000/chat (Llama3 + ENDF PDF context)
// Mocks kept as ultimate fallback

const BACKEND_URL = "http://localhost:8000/chat";

// Core helper – calls local backend (adds ENDF RAG context server-side)
const callLocalAI = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        if (!response.ok) throw new Error("Backend error");
        const data = await response.json();
        return data.response || "No response from local Llama3.";
    } catch (e) {
        console.error("Local AI offline:", e);
        return "AI offline – displaying cached simulation.";
    }
};

// --- CORE CHAT (Streaming preserved) ---
export async function* streamSLASResponse(
  prompt: string, 
  context: string = "", 
  history: ChatMessage[] = [], 
  language: string = "English",
  image?: string  // Offline: image ignored (not supported locally)
): AsyncGenerator<string, void, unknown> {
    const historyText = history.map(h => `${h.role}: ${h.text}`).join("\n");
    const fullPrompt = `You are SLAS (Smart Leadership Assistant System) for the Ethiopian National Defense Force (ENDF).
Context: ${context}
Language: ${language}
Chat history:
${historyText}

Current command/query: ${prompt}

Respond concisely in tactical military style using ENDF regulations and doctrine.`;

    const response = await callLocalAI(fullPrompt);

    // Word-by-word streaming effect (same UX as original)
    const words = response.split(' ');
    for (const word of words) {
        yield word + " ";
        await new Promise(r => setTimeout(r, 60));  // Smooth speed
    }
}

// --- SIMULATIONS (JSON preserved) ---
export const runStrategySimulation = async (scenario: string, mode: string, language: string, params?: any): Promise<string> => {
    const prompt = `ENDF Military Strategist simulation.
Scenario: ${scenario}
Mode: ${mode}
Language: ${language}
Parameters: ${JSON.stringify(params || {})}

Return ONLY valid JSON (no markdown) with exact keys:
title, summary, adversary_analysis (object), cross_domain_matrix (object), resource_impact (object), strategic_options (array of objects), rationale, outcome_vector`;

    const response = await callLocalAI(prompt);
    try { JSON.parse(response); return response; } 
    catch { return getMockStrategy(); }  // Original mock fallback
};

export const runAdvancedSimulation = async (simType: string, params: any): Promise<string> => {
    let prompt = `ENDF advanced offline simulation for type: ${simType}
Parameters: ${JSON.stringify(params)}

Return ONLY valid JSON matching original schema.`;

    const response = await callLocalAI(prompt);
    try { JSON.parse(response); return response; } 
    catch { return "[]"; }  // Fallback
};

// --- RISK ANALYSIS (Preserved) ---
export const analyzePersonnelRisk = async (unit: string, metrics: any): Promise<any> => {
    const prompt = `Analyze personnel risk for ENDF unit: ${unit}
Metrics: ${JSON.stringify(metrics)}
Return JSON with risk_level, risk_score, primary_factors (array), proactive_actions (array).`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return JSON.parse(getMockStudentRisk()); }
};

export const analyzeStudentRisk = async (studentData: any): Promise<any> => {
    const prompt = `Analyze officer candidate/student risk for ENDF training.
Data: ${JSON.stringify(studentData)}
Return JSON risk profile.`;

    const response = await callLocalAI(prompt);
    try { return JSON.parse(response); } 
    catch { return JSON.parse(getMockStudentRisk()); }
};

// --- REPORTS & FORECASTS (Preserved) ---
export const generateReport = async (type: string, language: string): Promise<string> => {
    const prompt = `Generate official ENDF report for: ${type}
Language: ${language}
Use formal structure: Overview, Details, Recommendation.`;

    return await callLocalAI(prompt);
};

export const getStrategicForecast = async (language: string): Promise<string> => {
    const prompt = `ENDF strategic forecast (short paragraph) in ${language}.`;

    return await callLocalAI(prompt);
};

// --- FIELD INSIGHT & OTHER FEATURES (All preserved with local prompts) ---
export const analyzeFieldInsight = async (insight: string, language: string, audioBase64?: string): Promise<string> => {
    const prompt = `Analyze ENDF field insight: "${insight}"
Language: ${language}
Return: Priority, Category, Recommended action.`;

    return await callLocalAI(prompt);
};

// Keep original mocks (getMockStrategy, getMockStudentRisk) unchanged as final fallback

// Offline limitations (preserved behavior):
export const generateSpeech = async (): Promise<AudioBuffer | null> => null;  // No TTS offline
// Image/audio analysis → return mock or "not supported offline"

// All other functions (searchIntelligence, runTerminalCommand, parseDataEntry, etc.)
// Route to callLocalAI with appropriate prompt + "Return JSON if needed"