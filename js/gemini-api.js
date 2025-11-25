/**
 * =================================================================== 
 * Gemini API Integration for Omar's AI Assistant
 * Uses Google's Gemini Pro model for intelligent responses
 * =================================================================== 
 */

const GEMINI_API_KEY = 'AIzaSyCEAtCZ_7PnT4lFA6EBRV0H5URKWTjRh60';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class OmarAI {
    constructor() {
        this.knowledgeBase = null;
        this.conversationHistory = [];
        this.init();
    }

    async init() {
        try {
            // Load Omar's knowledge base
            const response = await fetch('data/omar-knowledge-base.json');
            this.knowledgeBase = await response.json();
            console.log('✅ Omar\'s knowledge base loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load knowledge base:', error);
        }
    }

    /**
     * Generate AI response using Gemini API
     */
    async chat(userMessage) {
        if (!this.knowledgeBase) {
            return {
                success: false,
                message: "I'm still loading my knowledge base. Please try again in a moment!"
            };
        }

        try {
            // Build context from knowledge base
            const context = this.buildContext();
            
            // Create system prompt
            const systemPrompt = `You are Omar Alieh, a Digital Transformation Leader speaking in first person.

${context}

CRITICAL INSTRUCTIONS:
1. Always respond as "I" (you ARE Omar)
2. Reference specific projects, metrics, and stories from the context
3. Be professional but conversational and authentic
4. Use numbers and concrete examples
5. Never invent information not in the context
6. If you don't know something, say "I'd need to think more about that"
7. Keep responses concise (2-3 paragraphs max unless asked for detail)
8. Show personality—you're confident but humble, innovative but practical

Examples of good responses:
- "When I built the AI appraisal tool, I reduced report time from 6 hours to 30 minutes..."
- "I've led 32+ ERP implementations across F&B, Retail, and eCommerce..."
- "My approach is simple: understand the root cause, build a solution, iterate based on feedback."

Now respond to the user's message:`;

            // Prepare API request
            const request = {
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${userMessage}\n\nOmar:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.8,
                    topK: 40
                }
            };

            // Call Gemini API
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract response text
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Add to conversation history
            this.conversationHistory.push({
                user: userMessage,
                ai: aiResponse,
                timestamp: new Date()
            });

            return {
                success: true,
                message: aiResponse,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Gemini API error:', error);
            return {
                success: false,
                message: "I apologize, but I'm having trouble processing that right now. Please try asking something else!",
                error: error.message
            };
        }
    }

    /**
     * Build context from knowledge base
     */
    buildContext() {
        const kb = this.knowledgeBase;
        
        return `
ABOUT ME:
- Name: ${kb.profile.name}
- Role: ${kb.profile.current_role} at ${kb.profile.company}
- Location: ${kb.profile.location}
- Tagline: "${kb.profile.tagline}"
- Education: Master's in CS & Business Technology from IE Madrid (scholarship recipient), BA in Economics from AUB
- Languages: ${kb.profile.languages.join(', ')}

KEY METRICS:
${Object.entries(kb.key_metrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

MY APPROACH: ${kb.personality.approach}

WHAT DRIVES ME: ${kb.personality.what_drives_me}

MY VALUE: ${kb.personality.unique_value}

TOP PROJECTS:
${kb.projects.slice(0, 5).map(p => `
- ${p.name}: ${p.impact}
  Story: ${p.story}
`).join('\n')}

SKILLS:
- Consulting: ${kb.skills.consulting_strategy.join(', ')}
- Technical: ${kb.skills.technical_solutioning.join(', ')}
- Innovation: ${kb.skills.data_innovation.join(', ')}
- Leadership: ${kb.skills.leadership_management.join(', ')}

CURRENT ROLE HIGHLIGHTS (Team Lead at Odoo):
${kb.experience[0].key_achievements.map(a => `- ${a.title}: ${a.impact}`).join('\n')}
`;
    }

    /**
     * Get suggested questions
     */
    getSuggestedQuestions() {
        return [
            "What AI projects have you built?",
            "Tell me about your leadership experience",
            "What's your biggest achievement?",
            "How did you increase client satisfaction to 96%?",
            "What makes you different from other consultants?",
            "Why should I hire you?",
            "Tell me about a time you solved a difficult problem",
            "What's your approach to digital transformation?"
        ];
    }

    /**
     * Get random fun fact
     */
    getRandomFact() {
        const facts = [
            "I built an AI tool that cut performance review time by 92% (6 hours → 30 minutes)!",
            "I've delivered 32+ ERP implementations across 5 different industries.",
            "I turned a failing client relationship (2/5) into a strategic partner (5/5) with a major upsell.",
            "My presales automation tool was adopted by 80% of the department within weeks.",
            "I led a market-entry strategy that increased project inflow by 35% in 6 months.",
            "I maintain a 96% client satisfaction rate across all my projects.",
            "I speak three languages fluently: Arabic, English, and French.",
            "I received the IE Foundation Scholarship for my Master's program in Madrid."
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }
}

// Export for use in other files
window.OmarAI = OmarAI;
