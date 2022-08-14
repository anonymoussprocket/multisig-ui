import { Route, Routes } from "react-router-dom";
import { HashRouter } from "react-router-dom";

import "./App.css";
import Create from "./components/create";
import Execute from "./components/execute";
import Header from "./components/header";
import Submit from "./components/submit";

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/create" element={ <Create /> } />
          <Route path="/submit" element={ <Submit /> } />
          <Route path="/execute" element={ <Execute /> } />
        </Routes>
      </div>
      </HashRouter>
      
  );
}

export default App;
