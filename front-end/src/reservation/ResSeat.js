import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "../dashboard/Reservations";
import { listTables, updateTable, readReservation } from "../utils/api";

function ResSeat() {
  const [formData, setFormData] = useState("Please Select a table");
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [reservation, setReservation] = useState([]);
  const [reservationError, setReservationError] = useState(null);

  const history = useHistory();
  const { reservation_id } = useParams();

  useEffect(() => {
    async function loadDashboard() {
      const abortController = new AbortController();
      setTablesError(null);
      setReservationError(null);
      try {
        const listedTables = await listTables(abortController.signal);
        setTables(listedTables);
        const reserved = await readReservation(reservation_id);
        setReservation(reserved);
      } catch (err) {
        setTablesError({ message: err.response.data.error });
        setReservationError({ message: err.response.data.error });
      }
      return () => abortController.abort();
    }
    loadDashboard();
  }, [reservation_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData === "Please Select a table")
        throw new Error("Please select a valid table");
      await updateTable(formData, { data: { reservation_id } });
      history.push("/dashboard");
    } catch (error) {
      if (error.response)
        setTablesError({ message: error.response.data.error });
      if (!error.response) setTablesError(error);
    }
  };
  const handleChange = (event) => {
    setFormData(event.target.value);
  };
  const handleCancel = () => {
    setFormData("Please Select a table");
    history.goBack();
  };

  return (
    <form action="" onSubmit={handleSubmit} className="d-flex flex-column">
      <div className="d-flex flex-column align-items-center justify-content-center mt-5">
        <div className="row justify-content-center">
          {reservation.reservation_time && (
            <Reservations reservation={reservation} type="seating" />
          )}

          <label htmlFor="table_id">
            <select
              id="table_id"
              name="table_id"
              onChange={handleChange}
              value={formData}
              className="mt-3 bg-light text-secondary font-weight-bold border-secondary rounded"
            >
              <option>Please Select a table</option>
              {tables.map((table) => {
                return (
                  <option key={table.table_id} value={table.table_id}>
                    {table.table_name} - {table.capacity}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <div className="row mt-2">
          <button type="submit" className="btn btn-sm btn-info mr-3">
            <span className="oi oi-check"></span> Submit
          </button>

          <button onClick={handleCancel} className="btn btn-sm btn-danger">
            <span className="oi oi-x"></span> Cancel
          </button>
        </div>
        <ErrorAlert error={tablesError} />
        <ErrorAlert error={reservationError} />
      </div>
    </form>
  );
}

export default ResSeat;
