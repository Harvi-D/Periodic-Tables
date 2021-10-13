import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ResSeat from "../reservation/ResSeat";
import ResForm from "../reservation/ResForm";
import TableForm from "../table/TableForm";
import SearchByNumber from "../search/SearchByNumber";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <ResForm type="New" />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      <Route path="/tables/new">
        <TableForm />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <ResSeat />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <ResForm type="Edit" />
      </Route>
      <Route path="/search">
        <SearchByNumber />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
