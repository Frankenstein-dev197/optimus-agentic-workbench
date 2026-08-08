import { OptimusLayout } from './components/optimus/layout/optimus-layout';

function App() {
  return (
    <OptimusLayout>
      <div className="optimus-welcome">
        <h1>Welcome to OPTIMUS</h1>
        <p>Your Agentic Development Workbench</p>
        <div className="optimus-features">
          <div className="feature">
            <h3>🔧 Agent Runtime</h3>
            <p>Connect your AI agent to build software collaboratively</p>
          </div>
          <div className="feature">
            <h3>📁 File Explorer</h3>
            <p>Browse and manage your project files</p>
          </div>
          <div className="feature">
            <h3>⌨️ Monaco Editor</h3>
            <p>Edit code with a powerful IDE experience</p>
          </div>
          <div className="feature">
            <h3>🖥️ Terminal</h3>
            <p>Run commands and see results in real-time</p>
          </div>
          <div className="feature">
            <h3>🐛 Problems</h3>
            <p>Track and fix code issues</p>
          </div>
          <div className="feature">
            <h3>📚 Source Control</h3>
            <p>Manage Git changes and commits</p>
          </div>
        </div>
      </div>
    </OptimusLayout>
  );
}

export default App;
