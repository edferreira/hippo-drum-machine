
import "./App.css";
import GridSequencer from "./components/Sequencer/GridSequencer";

function App() {
  return (
    <div className="app">
      <div className="header">
        <img className="logo" src="./assets/images/logo.png" alt="logo" />
        <h1>Drum sequencer</h1>
      </div>
      <GridSequencer />
    </div>
  );
}

export default App;
