import { Link } from "react-router-dom";
import { updateStatus } from "../utils/api";
import { formatDate, formatTime, formatPhone } from "../utils/date-time";

function Reservations({ reservation, type }) {
  const date = formatDate(reservation.reservation_date);
  const time = formatTime(reservation.reservation_time);
  const phone = formatPhone(reservation.mobile_number);

  const handleCancel = async () => {
    if (
      window.confirm(
        "Do you want to cancel this reservation? \n \n \nThis cannot be undone."
      )
    ) {
      try {
        await updateStatus(reservation.reservation_id, {
          data: { status: "cancelled" },
        });
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="card m-3 bg-light" style={{ width: "18rem" }}>
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h4 className="card-title">
              {reservation.first_name} {reservation.last_name}
            </h4>
            <h6>
              <span className="oi oi-people m-2"> </span>
              {reservation.people}
            </h6>
          </div>

          <div className="d-flex justify-content-between">
            <h6>{date}</h6>
            <h6>{time}</h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>{phone}</h6>

            <h5 data-reservation-id-status={reservation.reservation_id}>
              {reservation.status}
            </h5>
          </div>

          {reservation.status === "booked" && !type ? (
            <>
              <Link
                to={`/reservations/${reservation.reservation_id}/seat`}
                className="btn btn-outline-info btn-sm font-weight-bold"
              >
                Seat
              </Link>
              <button
                data-reservation-id-cancel={reservation.reservation_id}
                className="mx-3 btn btn-outline-danger btn-sm font-weight-bold"
                onClick={handleCancel}
              >
                <span className="oi oi-trash"></span> Cancel
              </button>
              <Link
                to={`/reservations/${reservation.reservation_id}/edit`}
                className="btn btn-outline-warning btn-sm font-weight-bold"
              >
                <span className="oi oi-pencil"></span> Edit
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Reservations;