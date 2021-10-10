import React, { useEffect, useState } from "react";
import { listReservations, cancelReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from './Reservations';
import { useHistory } from "react-router";
import { previous, next, today, dayAndDate } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
 function Dashboard({ date }) {
  const history = useHistory();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
 

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new window.AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

  }

  function onCancel(reservation_id) {
    cancelReservation(reservation_id)
      .then(loadDashboard)
      .catch(setReservationsError);
  }


  return (
    <main className="text-center mt-3 font">
      <h1>Dashboard</h1>
      <div className="mb-3" role="group" aria-label="Date Buttons">
        <button className="btn btn-dark mr-2" onClick={() => history.push(`/dashboard?date=${previous(date)}`)}>Previous</button>
        <button className="btn btn-secondary" onClick={() => history.push(`/dashboard?date=${today()}`)}>Today</button>
        <button className="btn btn-dark ml-2" onClick={() => history.push(`/dashboard?date=${next(date)}`)}>Next</button>
      </div>
      <div className="d-md-flex mb-3 justify-content-center pt-2">
        <h4 className="mb-0">Reservations for {dayAndDate(date)}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <Reservations reservations={reservations} onCancel={onCancel} />
    </main>
  );
}

export default Dashboard;