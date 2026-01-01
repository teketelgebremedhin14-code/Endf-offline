const express = require('express');
const ollama = require('ollama');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Simple document context (load text files from docs folder)
let docsContext = '';

async function loadDocsContext() {
    try {
        // Try to load from docs folder (one level up)
        const docsPath = path.join(__dirname, '..', 'docs');
        const files = await fs.readdir(docsPath);
        
        let allText = '';
        for (const file of files) {
            if (file.endsWith('.txt')) {
                const content = await fs.readFile(path.join(docsPath, file), 'utf8');
                allText += content + '\n';
            }
        }
        docsContext = allText.slice(0, 3000); // Limit to 3000 chars
        console.log('Loaded document context:', docsContext.length, 'characters');
    } catch (error) {
        console.log('No document context available:', error.message);
        docsContext = 'General knowledge about Ethiopian National Defense Force.';
    }
}

// API endpoint for AI queries
app.post('/api/ai/query', async (req, res) => {
    try {
        const { prompt, role = 'ENDF Officer' } = req.body;
        
        // Build prompt with context
        const fullPrompt = `You are an AI assistant for Ethiopian National Defense Force Nexus.
Role: ${role}
Context from ENDF documents: ${docsContext}
User query: ${prompt}
Respond professionally in English or Amharic as appropriate.`;

        // Call Ollama locally
        const response = await ollama.chat({
            model: 'llama3',
            messages: [{ role: 'user', content: fullPrompt }],
        });

        res.json({
            response: response.message.content,
            role: role,
            model: 'llama3',
            context_used: docsContext.length > 0
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'ENDF Nexus AI',
        offline: true,
        model: 'llama3'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'ENDF Nexus AI Server',
        endpoints: {
            ai_query: 'POST /api/ai/query',
            health: 'GET /health'
        }
    });
});

// Start server
const PORT = 3000;
async function startServer() {
    await loadDocsContext();
    app.listen(PORT, () => {
        console.log(`ENDF Nexus Server running on http://localhost:${PORT}`);
        console.log(`Ollama model: llama3`);
        console.log(`Document context: ${docsContext.length > 0 ? 'Loaded' : 'Not available'}`);
    });
}

startServer();
