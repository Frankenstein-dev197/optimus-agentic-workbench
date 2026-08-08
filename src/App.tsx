import { OptimusLayout } from './components/optimus/layout/optimus-layout';
import { OptimusChatInterface } from './components/optimus/chat/chat-interface';
import { useOptimusLayoutStore } from './stores/optimus/layout-store';
import { useWorkbenchEvents } from './hooks/optimus/use-workbench-events';

function App() {
  const viewMode = useOptimusLayoutStore((state) => state.viewMode);
  const chatPanelHeight = useOptimusLayoutStore((state) => state.chatPanelHeight);
  const optimusEnabled = useOptimusLayoutStore((state) => state.optimusEnabled);
  
  // Initialize workbench events
  useWorkbenchEvents();
  
  // Default to welcome screen
  if (!optimusEnabled) {
    return (
      <OptimusLayout>
        <WelcomeScreen />
      </OptimusLayout>
    );
  }
  
  return (
    <div className="optimus-app">
      {/* Left: Chat Panel (resizable) */}
      <div 
        className="optimus-chat-container"
        style={{ width: viewMode === "focus" ? "0px" : `${Math.min(chatPanelHeight, 60)}%` }}
      >
        {viewMode !== "focus" && <OptimusChatInterface />}
      </div>
      
      {/* Right: Workbench */}
      <div className="optimus-workbench-container">
        <OptimusLayout>
          <WorkbenchContent />
        </OptimusLayout>
      </div>
    </div>
  );
}

// Workbench Content Component
function WorkbenchContent() {
  const panels = useOptimusLayoutStore((state) => state.panels);
  
  return (
    <div className="optimus-welcome">
      <h1>OPTIMUS Workbench</h1>
      <p>Your Agentic Development Environment</p>
      <div className="optimus-features">
        <div className="feature">
          <h3>📁 Explorer</h3>
          <p>Browse project files</p>
        </div>
        <div className="feature">
          <h3>⌨️ Monaco Editor</h3>
          <p>Edit code with IDE features</p>
        </div>
        <div className="feature">
          <h3>🖥️ Terminal</h3>
          <p>Run commands</p>
        </div>
        <div className="feature">
          <h3>📚 Git</h3>
          <p>Source control</p>
        </div>
        <div className="feature">
          <h3>🐛 Problems</h3>
          <p>Track issues</p>
        </div>
        <div className="feature">
          <h3>🔧 Testing</h3>
          <p>Run tests</p>
        </div>
      </div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen() {
  const setOptimusEnabled = useOptimusLayoutStore((state) => state.setOptimusEnabled);
  const setViewMode = useOptimusLayoutStore((state) => state.setViewMode);
  
  const handleStart = () => {
    setOptimusEnabled(true);
    setViewMode("split");
  };
  
  return (
    <div className="optimus-welcome-screen">
      <div className="optimus-welcome-content">
        <div className="optimus-welcome-logo">⚡</div>
        <h1>OPTIMUS</h1>
        <p className="optimus-welcome-tagline">Agentic Development Environment</p>
        <p className="optimus-welcome-description">
          Build software collaboratively with AI. Chat with OPTIMUS, 
          edit code in real-time, and see your changes come to life.
        </p>
        <button className="optimus-start-btn" onClick={handleStart}>
          Start Building →
        </button>
        <div className="optimus-welcome-features">
          <div className="welcome-feature">
            <span className="welcome-feature-icon">💬</span>
            <span>Conversational AI</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">⌨️</span>
            <span>Monaco Editor</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">🖥️</span>
            <span>Integrated Terminal</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">📚</span>
            <span>Git Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
