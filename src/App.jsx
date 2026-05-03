import { useState, useRef, useEffect } from 'react';
import { Bot, User, CheckCircle2, Circle, Send, Info, Calendar, Newspaper, ArrowRight, UserPlus, Search, Users, Vote, X, ExternalLink } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

// --- Data ---

const PROCESS_STEPS = [
  {
    id: 1,
    phase: "PHASE 01",
    title: "Voter Registration",
    icon: <UserPlus size={24} />,
    summary: "Register via Form 6 if you are 18+ or update details using Form 8.",
    details: "Indian citizens can register online via the NVSP portal or Voter Helpline App. You need a passport-sized photo, age proof, and residence proof. First-time voters should use Form 6, while those needing corrections use Form 8.",
    keyResource: "Official guidance for voter registration.",
    recommendedAction: "Complete this step before next deadline.",
    highPriority: true
  },
  {
    id: 2,
    phase: "PHASE 02",
    title: "Check Electoral Roll",
    icon: <Search size={24} />,
    summary: "Verify your name in the Voter List to ensure you can cast your vote.",
    details: "Even if you have an EPIC card, your name must be in the current Electoral Roll. You can check this on the ECI website or via the Voter Helpline App using your EPIC number or personal details.",
    keyResource: "Official guidance for check electoral roll.",
    recommendedAction: "Complete this step before next deadline.",
    highPriority: false
  },
  {
    id: 3,
    phase: "PHASE 03",
    title: "Know Your Candidate",
    icon: <Users size={24} />,
    summary: "Check candidate credentials, criminal records, and assets via KYC.",
    details: "The Election Commission of India provides the \"Know Your Candidate\" (KYC) app where you can view affidavits filed by candidates, including their education, assets, and any criminal history.",
    keyResource: "Official guidance for know your candidate.",
    recommendedAction: "Complete this step before next deadline.",
    highPriority: false
  },
  {
    id: 4,
    phase: "PHASE 04",
    title: "Polling Day",
    icon: <Vote size={24} />,
    summary: "Carry your EPIC card or valid ID and find your polling booth.",
    details: "On election day, identify your designated polling station. If you don't have an EPIC card, you can use any of the 12 alternative photo identity documents approved by the ECI, such as Aadhaar, PAN, or Passport.",
    keyResource: "Official guidance for polling day.",
    recommendedAction: "Complete this step before next deadline.",
    highPriority: false
  }
];

// --- Components ---

const GuideModal = ({ step, onClose, onNext }) => {
  if (!step) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <div className="header-top">
            <span className="phase-label">{step.phase}</span>
            {step.highPriority && <span className="priority-tag">HIGH PRIORITY</span>}
          </div>
          <h2>{step.title}</h2>
        </div>

        <div className="modal-body">
          <p className="description">{step.details}</p>
          
          <div className="resource-grid">
            <div className="resource-box">
              <h4>Key Resource</h4>
              <p>{step.keyResource}</p>
            </div>
            <div className="resource-box">
              <h4>Recommended Action</h4>
              <p>{step.recommendedAction}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="continue-btn" onClick={() => onNext(step.id)}>
            {step.id === 4 ? "Finish Guide" : "Continue to Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
};

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

const HomePage = ({ onStart }) => {
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');
  const [activeStep, setActiveStep] = useState(null);

  const staticKnowledge = [
    { q: "Who can vote in India?", a: "Any Indian citizen aged 18 or above with a valid Voter ID (EPIC) can vote." },
    { q: "What is an EVM?", a: "Electronic Voting Machines are used to record votes. They are secure and tamper-proof." },
    { q: "What is the Lok Sabha?", a: "It's the lower house of India's Parliament, representing the people directly." },
    { q: "How often are general elections held?", a: "General elections are held every 5 years, unless the house is dissolved earlier." },
    { q: "What is NOTA?", a: "'None Of The Above' allows voters to officially register a vote of rejection for all candidates." },
    { q: "What is the Model Code of Conduct?", a: "A set of guidelines issued by the ECI to regulate the conduct of political parties during elections." }
  ];

  const electionDates = [
    { event: "Phase 1 Voting", date: "April 19, 2024" },
    { event: "Phase 7 (Final) Voting", date: "June 1, 2024" },
    { event: "Counting & Results", date: "June 4, 2024" }
  ];

  const checklist = [
    "Verify your name in the Electoral Roll",
    "Locate your Polling Station online",
    "Keep your Voter ID (EPIC) or alternative ID ready",
    "Learn about the candidates in your constituency",
    "Understand the working of VVPAT"
  ];

  const handleNextStep = (currentId) => {
    if (currentId < 4) {
      setActiveStep(PROCESS_STEPS.find(s => s.id === currentId + 1));
    } else {
      setActiveStep(null);
    }
  };

  return (
    <div className="home-page animate-fade-in">
      <section className="hero-section">
        <h1>Civic Guide</h1>
        <p>Empowering citizens through interactive knowledge of the Indian Democratic Process.</p>
      </section>

      <section className="process-guide-section">
        <div className="section-header">
          <h2>Election Process Guide</h2>
          <p>Follow these simple steps to ensure your voice is heard.</p>
        </div>
        
        <div className="process-steps-grid">
          {PROCESS_STEPS.map(step => (
            <div key={step.id} className="process-card">
              <div className="step-indicator">
                <div className="step-number">{step.id}</div>
              </div>
              <div className="process-card-content">
                <span className="step-label">STEP {step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.summary}</p>
                <button className="read-guide-link" onClick={() => setActiveStep(step)}>
                  Read Guide <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="home-grid">
        {/* Quick Knowledge Base (Static Chat) */}
        <div className="info-card">
          <h3><Info size={20} /> Quick Knowledge</h3>
          <div className="static-chat-container">
            {staticKnowledge.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="static-bubble q">{item.q}</div>
                <div className="static-bubble a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Election Info */}
        <div className="info-card">
          <h3><Calendar size={20} /> General Elections 2024</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              The 18th Lok Sabha elections were held in 7 phases across India.
            </p>
            {electionDates.map((d, i) => (
              <div key={i} className="timeline-item">
                <span className="date-tag">{d.date}</span>
                <span style={{ fontSize: '0.9rem' }}>{d.event}</span>
              </div>
            ))}
          </div>
          <div className="news-links">
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="news-btn">
              <Newspaper size={16} /> Official ECI Portal
            </a>
            <a href="https://www.ndtv.com/elections" target="_blank" rel="noopener noreferrer" className="news-btn">
              Latest News
            </a>
          </div>
        </div>

        {/* Voter Checklist (New Section) */}
        <div className="info-card">
          <h3><CheckCircle2 size={20} /> Voter's Checklist</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Be a responsible citizen. Follow these steps before you head to the booth:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="var(--green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start AI Assistant */}
        <div className="start-chat-card">

          <div className="start-chat-content">
            <h2 style={{ color: 'var(--navy)', margin: '0 0 0.5rem 0' }}>Ready for a deep dive?</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Start our AI-powered interactive guide to learn step-by-step.
            </p>
          </div>
          <div className="start-chat-actions">
            <div className="input-group" style={{ margin: 0 }}>
              <label htmlFor="knowledge">Select your level:</label>
              <select 
                id="knowledge" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontFamily: 'inherit', fontSize: '1rem'}}
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
              >
                <option value="beginner">I'm new (Beginner)</option>
                <option value="intermediate">I know basics (Intermediate)</option>
                <option value="expert">I follow closely (Expert)</option>
              </select>
            </div>
            <button className="primary-btn" onClick={() => onStart(knowledgeLevel)}>
              Start AI Assistant <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
      </div>

      <GuideModal 
        step={activeStep} 
        onClose={() => setActiveStep(null)} 
        onNext={handleNextStep}
      />
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
      alert("Failed to initialize AI Assistant.");
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
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          addBotMessage("Service is busy. Please try again in a moment!");
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="app-container">
      {!hasStarted && <HomePage onStart={handleStart} />}
      
      <Sidebar topics={topics} currentTopicId={currentTopicId} />
      
      <main className="main-content">
        <header className="top-bar">
          <h2>{topics.find(t => t.id === currentTopicId)?.title}</h2>
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

