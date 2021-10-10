import React from "react";
import { Link } from "react-router-dom";
import { formatAsTime, twelveHour, usStandardDate } from '../utils/date-time';

function Reservations({onCancel, reservations = [] }) {
    function cancelHandler({
        target: { dataset: { reservationIdCancel } } = {},
    }) {
        if (
          reservationIdCancel &&
          window.confirm(
            "Do you want to cancel this reservation? This cannot be undone."
          )
        ) {
          onCancel(reservationIdCancel);
        }
    }
    const rows = reservations.map((reservation) => {
        return (
          <div key={reservation.reservation_id} className="card mb-1">
            <div className="card-body">
              <h5 className="card-title">{reservation.first_name} {reservation.last_name}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{reservation.mobile_number}</h6>
              <p className="card-text">{twelveHour(formatAsTime(reservation.reservation_time))}</p>
              <p className="card-text">{usStandardDate(reservation.reservation_date)}</p>
              <p className="card-text">Party Size: {reservation.people}</p>
              <p className="card-text" data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status}</p>
              {reservation.status === "booked" ? (
                <div>
                    <Link className="btn btn-dark m-2" to={`/reservations/${reservation.reservation_id}/seat`}>seat</Link>
                    <Link className="btn btn-secondary m-2" to={`/reservations/${reservation.reservation_id}/edit`}>edit</Link>
                    <button type="button" className="btn cancel btn-danger m-2" data-reservation-id-cancel={reservation.reservation_id} onClick={cancelHandler}>cancel</button>
                </div>) : ( "" )}
            </div>
          </div>
        )
      });
      
    return reservations.length ? (
      <div>{rows}</div>
    ) : (
      <div>No reservations found</div>
    );
  }
  

export default Reservations;