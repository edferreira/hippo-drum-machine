
import "./App.css";
import GridSequencer from "./components/Sequencer/GridSequencer";
import logoImage from "../assets/images/logo.png";

function App() {
  return (
    <div className="app">
      <div className="header">
        <img className="logo" src={logoImage} alt="logo" />
        <h1>Drum sequencer</h1>
      </div>
      <GridSequencer />
    </div>
  );
}

export default App;
