import { useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "../dashboard/Reservations";

/**
 * Search Form Component
 * @returns {JSX.Element}
 */
function SearchByNumber() {
  const [mobile_number, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const reservationsContent = reservations.map((reservation, index) => {
    return <Reservations reservation={reservation} key={index} />;
  });

  const handleChange = (e) => setMobileNumber(e.target.value);

  const handleSearch = (e) => {
    e.preventDefault();

    const abortController = new AbortController();

    listReservations({ mobile_number }, abortController.signal)
      .then(setReservations)
      .then(() =>
        reservationsContent.length === 0
          ? setReservationsError({ message: "No reservations found" })
          : setReservationsError(null)
      )
      .catch(setReservationsError);
  };

  return (
    <>
      <h2 className="text-center pb-2">Search for Reservation</h2>
      <div className="d-flex flex-column align-items-center">
        <form onSubmit={handleSearch} className="mt-3 w-50 text-center">
          <div className="form-group">
            <input
              name="mobile_number"
              placeholder="customer's phone number"
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-light mb-5">
            Find
          </button>
        </form>
        {reservationsContent.length !== 0 ? <h3>Reservations</h3> : ""}
        {reservationsContent.length === 0 ? (
          <ErrorAlert error={reservationsError} />
        ) : (
          ""
        )}
        <div className="d-flex justify-content-center flex-wrap mb-5">
          {reservationsContent}
        </div>
      </div>
    </>
  );
}

export default SearchByNumber;