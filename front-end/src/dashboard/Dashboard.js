import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation } from "react-router-dom";
import { today, next, previous, formatDate } from "../utils/date-time";
import Reservations from "./Reservations";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard() {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [date, setDate] = useState(query.get("date") || today());

  useEffect(loadDashboard, [date]);

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  return (
    <main className="text-center">
      <h1 className="m-3">{formatDate(date)}</h1>
      <button 
        onClick={() => setDate(previous(date))} 
        className="btn btn-sm btn-secondary font-weight-bold text-light">
          <span className="oi oi-arrow-left"></span> Previous Day
          </button>
      <button 
      onClick={() => setDate(today())}
      className="mx-3 btn btn-sm btn-dark font-weight-bold text-light" 
      >
        Today
      </button>
      <button 
      onClick={() => setDate(next(date))} 
      className="btn btn-sm btn-secondary font-weight-bold text-light"
      >
        Next Day <span className="oi oi-arrow-right"></span>
        </button>
      <br />
      <label 
      htmlFor="reservation_date" 
      className="form-label m-3 bg-light">
        <input
          className="border-secondary rounded"
          type="date"
          pattern="\d{4}-\d{2}-\d{2}"
          name="reservation_date"
          onChange={handleDateChange}
          value={date}
        />
      </label>
      <div className="d-md-flex mb-3 "></div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      {reservations.length ? (
        <h3>Reservations</h3>
      ) : (
        `No reservations for ${date}`
      )}
      <div className="d-flex justify-content-center flex-wrap">
        {reservations.map((reservation) => (
          <Reservations
            key={reservation.reservation_id}
            reservation={reservation}
          />
        ))}
      </div>
      <h3>Tables </h3>
      <div className="d-flex justify-content-center mb-1 flex-wrap">
        {tables.map((table) => (
          <Tables key={table.table_id} table={table} />
        ))}
      </div>
      
    </main>
  );
}

export default Dashboard;