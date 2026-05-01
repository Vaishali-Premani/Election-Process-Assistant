import { useState, useRef, useEffect } from 'react';
import { Bot, User, CheckCircle2, Circle, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

// --- Placeholder Components ---

const Sidebar = ({ topics, currentTopicId }) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <h1 className="sidebar-title">
        <Bot size={24} color="var(--navy)" />
        Civic Guide
      </h1>
      <span className="sidebar-subtitle">Indian Election Process</span>
    </div>
    <div className="topic-list">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className={`topic-item ${currentTopicId === topic.id ? 'active' : ''} ${
            topic.completed ? 'completed' : ''
          }`}
        >
          <div className="topic-icon">
            {topic.completed ? (
              <CheckCircle2 size={18} />
            ) : currentTopicId === topic.id ? (
              <Circle size={18} fill="currentColor" />
            ) : (
              <Circle size={18} />
            )}
          </div>
          {topic.title}
        </div>
      ))}
    </div>
  </aside>
);

const Onboarding = ({ onStart }) => {
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card animate-fade-in">
        <h1>Welcome to Civic Guide</h1>
        <p>Your interactive guide to understanding the Indian Election Process.</p>
        
        <div className="input-group">
          <label htmlFor="knowledge">How much do you know about elections?</label>
          <select 
            id="knowledge" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontFamily: 'inherit', fontSize: '1rem'}}
            value={knowledgeLevel}
            onChange={(e) => setKnowledgeLevel(e.target.value)}
          >
            <option value="beginner">I'm new to voting (Beginner)</option>
            <option value="intermediate">I know the basics (Intermediate)</option>
            <option value="expert">I follow politics closely (Expert)</option>
          </select>
        </div>

        <button 
          className="primary-btn" 
          onClick={() => onStart(knowledgeLevel)}
        >
          Start Learning
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const SYSTEM_PROMPT = `You are a friendly, conversational Civic Guide helping users understand the Indian Election Process.
Your goal is to break down complex concepts into simple, interactive steps based on the user's knowledge level.
The user's knowledge level is: {KNOWLEDGE_LEVEL}

Topics to cover in order:
1. Democracy & What Elections Are
2. Types of Elections (Lok Sabha, Vidhan Sabha, Local)
3. The Election Commission of India
4. Voting Process & EVMs
5. Counting & Results

Rules:
1. Explain in small chunks. DO NOT output long paragraphs.
2. Use real-world Indian examples.
3. Keep responses friendly.
4. At the end of EVERY response, ask a follow-up question to check understanding or move the conversation forward.
5. Provide 2-3 short suggested quick replies for the user wrapped in <replies>reply1|reply2</replies> at the very end of your message.`;

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [knowledgeLevel, setKnowledgeLevel] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const chatEndRef = useRef(null);
  const [genAI, setGenAI] = useState(null);
  const [chatSession, setChatSession] = useState(null);

  // Layout State
  const [currentTopicId, setCurrentTopicId] = useState('t1');
  const topics = [
    { id: 't1', title: 'What is a Democracy?', completed: messages.length > 3 },
    { id: 't2', title: 'Types of Elections', completed: messages.length > 7 },
    { id: 't3', title: 'The Election Commission', completed: false },
    { id: 't4', title: 'Voting Process & EVMs', completed: false },
    { id: 't5', title: 'Counting & Results', completed: false },
  ];

  const handleStart = async (level) => {
    setKnowledgeLevel(level);
    
    // Retrieve the API key from environment variables
    const key = import.meta.env.VITE_GEMINI_API_KEY;

    if (!key) {
      alert("API Key is missing! Please configure the .env file.");
      return;
    }
    
    try {
      const ai = new GoogleGenerativeAI(key);
      setGenAI(ai);
      
      const model = ai.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT.replace('{KNOWLEDGE_LEVEL}', level)
      });
      
      const session = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      
      setChatSession(session);
      setHasStarted(true);
      
      const initialMsg = `Namaste! Welcome to your guide on the Indian Election Process. I see you selected the ${level} level. Let's start from the very beginning. Do you know what makes a country a "Democracy"? <replies>It's rule by the people|I'm not exactly sure</replies>`;
      addBotMessage(initialMsg);
    } catch (e) {
      alert("Failed to initialize API. Please check your key configuration.");
    }
  };

  const parseMessage = (text) => {
    const replyMatch = text.match(/<replies>(.*?)<\/replies>/);
    let replies = [];
    let cleanText = text;
    if (replyMatch) {
      replies = replyMatch[1].split('|').map(s => s.trim());
      cleanText = text.replace(replyMatch[0], '').trim();
    }
    return { text: cleanText, replies };
  };

  const addBotMessage = (text) => {
    const parsed = parseMessage(text);
    setMessages(prev => [...prev, { role: 'bot', text: parsed.text, replies: parsed.replies }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading || !chatSession) return;
    
    addUserMessage(text);
    setInputText('');
    setIsLoading(true);

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await chatSession.sendMessage(text);
        addBotMessage(result.response.text());
        
        if (messages.length > 3) setCurrentTopicId('t2');
        if (messages.length > 7) setCurrentTopicId('t3');
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error(error);
          addBotMessage("The Google AI servers are experiencing extremely high demand right now. Please wait a few seconds and try sending your message again!");
        } else {
          // Wait 2 seconds before retrying to give the server a break
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!hasStarted) {
    return <Onboarding onStart={handleStart} />;
  }

  const currentTopic = topics.find(t => t.id === currentTopicId)?.title;

  return (
    <div className="app-container">
      <Sidebar topics={topics} currentTopicId={currentTopicId} />
      
      <main className="main-content">
        <header className="top-bar">
          <h2>{currentTopic}</h2>
        </header>

        <div className="chat-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper bot animate-fade-in">
              <div className="avatar bot"><Bot size={20} /></div>
              <div className="message-bubble bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '40px' }}>
                <div className="typing-dot" style={{width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1.5s infinite'}}></div>
                <div className="typing-dot" style={{width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s'}}></div>
                <div className="typing-dot" style={{width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
           {messages.length > 0 && messages[messages.length - 1].role === 'bot' && messages[messages.length - 1].replies?.length > 0 && !isLoading && (
             <div className="quick-replies">
                {messages[messages.length - 1].replies.map((reply, i) => (
                  <button key={i} className="quick-reply-btn" onClick={() => handleSend(reply)}>
                    {reply}
                  </button>
                ))}
             </div>
           )}
           
           <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
             <input 
               type="text" 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
               placeholder="Type your answer..."
               style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-light)', outline: 'none', fontFamily: 'inherit' }}
               disabled={isLoading}
             />
             <button 
               onClick={() => handleSend(inputText)}
               disabled={!inputText.trim() || isLoading}
               style={{ background: 'var(--saffron)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
             >
               <Send size={18} />
             </button>
           </div>
        </div>
      </main>
    </div>
  );
}

export default App;
