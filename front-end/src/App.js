import React from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./layout/Layout";

useEffect(() => {
  fetch('https://restaurant-res-back.herokuapp.com')
    .then((res) => res.json())
    .then((nme) => setName([nme]))
}, [])

/**
 * Defines the root application component.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Switch>
      <Route path="/">
        <Layout />
      </Route>
    </Switch>
  );
}

export default App;
