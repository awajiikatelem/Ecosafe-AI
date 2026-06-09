import React, { useState, useEffect, useRef } from "react";
import { queryChatbot } from "../api";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 **Hello! I'm EcoSafe AI, your environmental protection assistant.**\n\nI can help you with:\n• Safety protocols for oil spills, gas leaks, and floods\n• Proper electronic and solid waste disposal guidelines\n• Advice on identifying water/air pollution hazards\n\nWhat environmental safety topic can I help you with today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    if (!textToSend) {
      setInputValue("");
    }

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setIsLoading(true);

    try {
      const data = await queryChatbot(query);
      if (data && data.response) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "I'm having trouble connecting to the service. Please try again." }
        ]);
      }
    } catch (error) {
      console.error("Chatbot query error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "An error occurred. Please verify your connection." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatMessageText = (text) => {
    // Simple parser to handle bold formatting (**text**) and bullet points (• or numerical points)
    return text.split("\n").map((line, index) => {
      let content = line;
      
      // Replace bold markers
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const formattedLine = parts.length > 0 ? parts : content;

      if (line.trim().startsWith("•") || line.trim().startsWith("-") || /^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="pl-3 py-0.5 text-sm text-slate-700 leading-relaxed flex items-start">
            <span className="mr-2 text-emerald-600">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }
      return (
        <p key={index} className="text-sm text-slate-700 leading-relaxed mb-2">
          {formattedLine}
        </p>
      );
    });
  };

  const quickPrompts = [
    { label: "🛢️ Oil Spill Tips", query: "What are safety guidelines for oil spills?" },
    { label: "💨 Gas Leak Guide", query: "What should I do during a gas leak?" },
    { label: "🌊 Flood Safety", query: "What is the flood mitigation protocol?" },
    { label: "💧 Water Pollution", query: "What advice do you have on water pollution?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative group border border-emerald-400"
        title="EcoSafe AI Environmental Chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        {/* Pulsing ring indicator */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-85 md:w-96 h-[500px] flex flex-col glass-panel shadow-2xl rounded-2xl border border-white/40 overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/20">
                🤖
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight">EcoSafe AI Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs text-emerald-100 font-medium">Environmental Agent Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <div>{formatMessageText(msg.text)}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Container */}
          <div className="p-3 bg-white border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium block mb-2 px-1">Quick safety topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt.query)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full border border-emerald-100 transition-all font-medium hover-lift active:scale-95 disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about oil spills, gas leaks, safety advice..."
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-75 transition-all text-slate-800"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors shadow-md hover-lift"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9-7-9-7V7a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h8v-2z" />
              </svg>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
