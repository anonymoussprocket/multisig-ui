import { Route, HashRouter, Switch } from "react-router-dom";

import "./App.css";
import Create from "./components/create";
import Execute from "./components/execute";
import Header from "./components/header";
import Submit from "./components/submit";

function App() {
  return (
    <HashRouter basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/">
            <Create />
          </Route>{" "}
          <Route exact path="/create">
            <Create />
          </Route>
          <Route exact path="/submit">
            <Submit />
          </Route>
          <Route exact path="/execute">
            <Execute />
          </Route>
        </Switch>
      </div>
    </HashRouter>
  );
}

export default App;
