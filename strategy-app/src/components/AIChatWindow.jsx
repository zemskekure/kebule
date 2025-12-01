import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AIChatWindow({ onCommand, data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Ahoj! Vidím celou tvou strategii (značky, vize, úkoly). Co potřebuješ vědět nebo upravit?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // --- Gemini API Integration ---
    const callGeminiAPI = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            return "Chybí API klíč. Prosím zkontrolujte .env soubor.";
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const responseData = await response.json();

            if (responseData.error) {
                console.error("Gemini API Error:", responseData.error);
                return `Chyba API: ${responseData.error.message} (Code: ${responseData.error.code})`;
            }

            return responseData.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, nerozuměl jsem odpovědi.";
        } catch (error) {
            console.error("Network Error:", error);
            return `Chyba sítě: ${error.message}`;
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Prepare Data Context
        const brandsList = data?.brands?.map(b => b.name).join(', ') || 'Žádné';
        const visionsList = data?.visions?.map(v => `${v.title} (${v.description})`).join('; ') || 'Žádné';
        const projectsList = data?.projects?.map(p => `${p.title} (Status: ${p.status})`).join('; ') || 'Žádné';
        const newRestaurantsList = data?.newRestaurants?.map(r => `${r.title} (Otevření: ${r.openingDate})`).join('; ') || 'Žádné';

        // Context for the AI
        const context = `
            Jsi strategický AI partner pro aplikaci "Thought OS: Ambiente".
            
            TADY JSOU AKTUÁLNÍ DATA Z APLIKACE:
            -----------------------------------
            Značky: ${brandsList}
            Vize a Cíle: ${visionsList}
            Běžící Projekty: ${projectsList}
            Nové Restaurace/Facelifty: ${newRestaurantsList}
            -----------------------------------
            
            INSTRUKCE PRO AKCE:
            Pokud uživatel chce něco změnit (např. datum otevření, status), MUSÍŠ vygenerovat JSON příkaz na konci odpovědi.
            
            Formát pro změnu data:
            \`\`\`json
            { "command": "UPDATE_DATE", "target": "Název restaurace", "date": "YYYY-MM-DD" }
            \`\`\`
            
            Uživatel se ptá: "${inputValue}"
            
            Odpověz česky. Pokud je potřeba akce, přidej JSON blok na konec.
        `;

        const aiResponseText = await callGeminiAPI(context);

        // Parse JSON command if present
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/) || aiResponseText.match(/{[\s\S]*"command"[\s\S]*}/);

        let displayText = aiResponseText;

        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                const command = JSON.parse(jsonStr);
                console.log("AI Command:", command);

                // Remove JSON from display text
                displayText = aiResponseText.replace(jsonMatch[0], '').trim();

                // Execute command
                if (onCommand) {
                    onCommand(command);
                    displayText += `\n\n✅ Provedl jsem akci: ${command.command}`;
                }
            } catch (e) {
                console.error("Failed to parse AI command", e);
            }
        }

        const aiMessage = { id: Date.now() + 1, text: displayText, sender: 'ai', timestamp: new Date() };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="ai-chat-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ai-chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                            width: '380px',
                            height: '600px',
                            marginBottom: '1rem',
                            background: 'rgba(20, 20, 20, 0.85)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            color: '#fff'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(to right, rgba(255,255,255,0.03), transparent)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                                }}>
                                    <Sparkles size={18} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>AI Partner</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
                            >
                                <ChevronDown size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%'
                                    }}
                                >
                                    <div style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user'
                                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none',
                                        border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.3)',
                                        marginTop: '4px',
                                        display: 'block',
                                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                                        padding: '0 4px'
                                    }}>
                                        {msg.sender === 'ai' ? 'AI Asistent' : 'Ty'}
                                    </span>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '20px 20px 20px 4px' }}
                                >
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '1.25rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Zeptej se na cokoliv..."
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '0.75rem',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading}
                                    style={{
                                        background: inputValue.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: inputValue.trim() ? 'pointer' : 'default',
                                        color: '#fff',
                                        transition: 'all 0.2s ease',
                                        opacity: inputValue.trim() ? 1 : 0.5
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="ai-chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    zIndex: 1001
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Sparkles size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
