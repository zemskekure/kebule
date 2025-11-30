import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AIChatWindow({ onCommand }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Ahoj! Jsem tvůj AI asistent. Můžu ti pomoci s úpravou dat, například: "Posuň opening Nový Lokál na 30.5.2026" nebo "Vytvoř úkol Zkontrolovat rozpočet".' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simulate AI processing
        setTimeout(() => {
            const responseText = processCommand(userMsg.text);
            const aiMsg = { id: Date.now() + 1, sender: 'ai', text: responseText };
            setMessages(prev => [...prev, aiMsg]);
        }, 600);
    };

    const processCommand = (text) => {
        const lowerText = text.toLowerCase();

        // Basic Pattern Matching for Demo
        if (lowerText.includes('posuň') || lowerText.includes('změň datum') || lowerText.includes('opening')) {
            // Extract date (very basic regex for DD.MM.YYYY)
            const dateMatch = text.match(/(\d{1,2}\.\s?\d{1,2}\.\s?\d{4})/);
            if (dateMatch) {
                // In a real app, we would parse the entity name and call onCommand
                // For prototype, we'll try to find a "restaurant" or "project" name in the text
                onCommand({ type: 'UPDATE_DATE', text: text, date: dateMatch[0] });
                return `Rozumím. Aktualizuji datum na ${dateMatch[0]}.`;
            }
            return "Změna data? Prosím, uveď datum ve formátu DD.MM.YYYY.";
        }

        if (lowerText.includes('vytvoř') || lowerText.includes('přidej')) {
            onCommand({ type: 'CREATE_TASK', text: text });
            return "Vytvářím nový úkol/projekt.";
        }

        return "Omlouvám se, zatím rozumím jen jednoduchým příkazům pro změnu data nebo vytvoření úkolu.";
    };

    return (
        <div className="ai-chat-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ai-chat-window glass-card"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="chat-header">
                            <div className="chat-title">
                                <Bot size={18} />
                                <span>AI Asistent</span>
                            </div>
                            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="chat-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.sender}`}>
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-area">
                            <input
                                type="text"
                                placeholder="Napiš příkaz..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} disabled={!inputValue.trim()}>
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="ai-chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
}
