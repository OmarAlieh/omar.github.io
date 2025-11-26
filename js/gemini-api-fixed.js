/**
 * FIXED AI CHAT - Better error handling and fallback responses
 */

// Test if API key works, use fallback if not
const TEST_MODE = false; // Set to true to use mock responses

class FixedOmarAI {
    constructor() {
        this.knowledgeBase = null;
        this.apiWorking = false;
        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/omar-knowledge-base.json');
            this.knowledgeBase = await response.json();
            console.log('✅ Knowledge base loaded');
            
            // Test API
            await this.testAPI();
        } catch (error) {
            console.error('❌ Init failed:', error);
        }
    }

    async testAPI() {
        try {
            const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCEAtCZ_7PnT4lFA6EBRV0H5URKWTjRh60', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'test' }] }]
                })
            });
            
            this.apiWorking = testResponse.ok;
            console.log(this.apiWorking ? '✅ API working' : '⚠️ API not working, using fallback');
        } catch (error) {
            console.log('⚠️ API test failed, using fallback responses');
            this.apiWorking = false;
        }
    }

    async chat(userMessage) {
        if (!this.knowledgeBase) {
            return {
                success: false,
                message: "Still loading my knowledge base. Give me a moment!"
            };
        }

        // Use fallback if API not working or test mode
        if (!this.apiWorking || TEST_MODE) {
            return this.getFallbackResponse(userMessage);
        }

        // Try API
        try {
            const context = this.buildContext();
            const prompt = `You are Omar Alieh. ${context}\n\nUser: ${userMessage}\n\nOmar (respond in first person, 2-3 sentences):`;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCEAtCZ_7PnT4lFA6EBRV0H5URKWTjRh60', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300
                    }
                })
            });

            if (!response.ok) throw new Error('API failed');

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            return {
                success: true,
                message: aiResponse
            };

        } catch (error) {
            console.error('API error, using fallback:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(question) {
        const q = question.toLowerCase();
        const kb = this.knowledgeBase;

        // AI projects
        if (q.includes('ai') && (q.includes('project') || q.includes('build') || q.includes('tool'))) {
            return {
                success: true,
                message: "I've built several AI tools: an appraisal generator that cut report time from 6 hours to 30 minutes (92% reduction), a team performance analytics dashboard with AI-driven action plans, and a presales automation tool that was adopted by 80% of the department. I don't just talk about AI—I build it."
            };
        }

        // Leadership
        if (q.includes('leader') || q.includes('team') || q.includes('manage')) {
            return {
                success: true,
                message: "I lead a team of 10 consultants at Odoo Middle East. I developed an onboarding program that gets new hires leading projects within 2-3 months, implemented agile methodologies that cut delivery time by 30%, and maintain a 96% client satisfaction rate. I believe in empowering my team and leading by example."
            };
        }

        // Client satisfaction
        if (q.includes('96') || q.includes('satisfaction') || q.includes('client')) {
            return {
                success: true,
                message: "I maintain a 96% client satisfaction rate. The secret? Proactive communication, managing expectations honestly, and always delivering more than promised. I once turned a frustrated 2/5-rated client into a 5/5 strategic partner by truly listening to their needs and delivering a tailored solution."
            };
        }

        // Projects
        if (q.includes('how many') || q.includes('project')) {
            return {
                success: true,
                message: "I've successfully delivered 32+ ERP implementations across diverse industries including F&B, Retail, eCommerce, and Services. Each project taught me something new about business transformation. 28+ companies went live with the solutions I implemented."
            };
        }

        // Experience
        if (q.includes('experience') || q.includes('background')) {
            return {
                success: true,
                message: "I'm a Digital Transformation Leader with 7+ years of experience spanning ERP consulting, team leadership, and AI tool development. I hold a Master's in Computer Science & Business Technology from IE Madrid (scholarship recipient) and a BA in Economics from AUB. Currently leading digital transformation initiatives at Odoo Middle East."
            };
        }

        // Education
        if (q.includes('education') || q.includes('study') || q.includes('school') || q.includes('ie') || q.includes('madrid')) {
            return {
                success: true,
                message: "I completed my Master's in Computer Science & Business Technology at IE Madrid (2019-2020) where I received the IE Foundation Scholarship. Before that, I earned my BA in Economics from the American University of Beirut. I speak Arabic, English, and French fluently."
            };
        }

        // What makes different
        if (q.includes('different') || q.includes('unique') || q.includes('special')) {
            return {
                success: true,
                message: "Most consultants recommend solutions—I build them. When I saw our performance reviews taking 6 hours, I didn't write a report about it; I built an AI tool that automated it. That's my 'Where Strategy Meets Code' approach. I bridge the gap between strategic thinking and technical execution."
            };
        }

        // Why hire
        if (q.includes('hire') || q.includes('why you')) {
            return {
                success: true,
                message: "Because I deliver results. I've led 32+ successful implementations, enabled $250K+ in sales, and maintain 96% client satisfaction. But beyond numbers—I'm a builder who thinks strategically and executes technically. I don't just identify problems; I create solutions. That's what makes me valuable."
            };
        }

        // Default response
        return {
            success: true,
            message: "Great question! Let me tell you more: I'm a Digital Transformation Leader with 7+ years of experience. I've built AI tools (like an appraisal generator that saved 92% of time), led 32+ ERP projects, and manage a team of 10 consultants. What specifically would you like to know about my experience?"
        };
    }

    buildContext() {
        const kb = this.knowledgeBase;
        return `I'm ${kb.profile.name}, ${kb.profile.current_role}. Key achievements: ${kb.key_metrics.projects_delivered} projects, ${kb.key_metrics.client_satisfaction} satisfaction, $${kb.key_metrics.sales_enabled} sales enabled. I built AI tools, lead a team of ${kb.key_metrics.team_size}, and specialize in digital transformation.`;
    }

    getSuggestedQuestions() {
        return [
            "What AI projects have you built?",
            "Tell me about your leadership experience",
            "How did you increase client satisfaction?",
            "What makes you different?",
            "Why should I hire you?",
            "What's your experience with ERP systems?"
        ];
    }
}

// Replace the old OmarAI
window.OmarAI = FixedOmarAI;
console.log('🔧 Fixed AI loaded with fallback responses');
