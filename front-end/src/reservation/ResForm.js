import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  createReservation,
  readReservation,
  updateReservation,
} from "../utils/api";

function ResForm({ type }) {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [reservationsError, setReservationsError] = useState(null);
  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };
  const [formData, setFormData] = useState({ ...initialState });

  const handleChange = ({ target }) => {
    const value =
      target.type === "number" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  useEffect(() => {
    if (type === "Edit") {
      const loadForm = async () => {
        const newRes = await readReservation(reservation_id);
        setFormData({
          ...newRes,
          reservation_date: newRes.reservation_date.slice(0, 10),
        });
      };
      loadForm();
    }
  }, [type, reservation_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    let newDate = new Date(
      `${formData.reservation_date} ${formData.reservation_time}`
    );
    let currentDay = new Date();
    try {
      if (newDate.getDay() === 2) throw new Error("Closed on Tuesdays!");
      if (newDate < currentDay) throw new Error("Not Available");

      let time = Number(formData.reservation_time.replace(":", ""));
      if (time < 1030 || time > 2130)
        throw new Error(
          "Reservations only available from 10:30 AM to 9:30 PM."
        );
      if (type === "Edit") {
        await updateReservation(reservation_id, { data: formData });
      } else {
        await createReservation({ data: formData });
      }
      setFormData({ ...initialState });
      history.push(`/dashboard?date=${formData.reservation_date}`);
      //console.log(formData)
    } catch (err) {
      if (err.response)
        setReservationsError({ message: err.response.data.error });
      if (!err.response) setReservationsError(err);
    }
  };

  return (
    <form action="" onSubmit={handleSubmit}>
      <ErrorAlert error={reservationsError} />
      <div className="card border-secondary mt-2">
        <div className="card-header text-center bg-dark text-light">
        <h2>{type} Reservation</h2>
        </div>
        <div className='form-row d-flex justify-content-center p-2'>
        <div className="form-group mx-4">
          <label htmlFor="first_name" className="form-label">
            First name:
            <input
              className="form-control border-secondary bg-light"
              placeholder='Jane/John'
              id="first_name"
              type="text"
              name="first_name"
              onChange={handleChange}
              value={formData.first_name}
              required
            />
          </label>
        </div>
        <div className="form-group mx-4">
          <label htmlFor="last_name" className="form-label">
            Last name:
            <input
              className="form-control border-secondary bg-light"
              placeholder='Doe'
              id="last_name"
              type="text"
              name="last_name"
              onChange={handleChange}
              value={formData.last_name}
              required
            />
          </label>
        </div>
        <div className="form-group mx-4">
          <label htmlFor="mobile_number" className="form-label">
            Phone number:
            <input
              className="form-control border-secondary bg-light"
              placeholder='(xxx)xxx-xxx'
              id="mobile_number"
              type="tel"
              pattern="(1?)\(?([0-9]{3})?\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})"
              name="mobile_number"
              onChange={handleChange}
              value={formData.mobile_number}
              required
            ></input>
          </label>
        </div>
        </div>
        <div className='form-row d-flex justify-content-center p-2'>
        <div className="form-group mx-4">
          <label htmlFor="reservation_date" className="form-label">
            Date:
            <input
              className="form-control border-secondary bg-light"
              id="reservation_date"
              type="date"
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              name="reservation_date"
              onChange={handleChange}
              value={formData.reservation_date}
              required
            />
          </label>
        </div>
        <div className="form-group mx-4">
          <label htmlFor="reservation_time" className="form-label">
            Time:
            <input
              className="form-control border-secondary bg-light"
              id="reservation_time"
              type="time"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              name="reservation_time"
              onChange={handleChange}
              value={formData.reservation_time}
              required
            />
          </label>
        </div>
        <div className="form-group mx-4">
          <label htmlFor="people" className="form-label">
            Number of guests:
            <input
              className="form-control border-secondary bg-light"
              id="people"
              type="number"
              min="1"
              max="22"
              name="people"
              onChange={handleChange}
              value={formData.people}
              required
            />
          </label>
        </div>
        </div>
        <div className="form-row d-flex justify-content-center">
        <div className="form-group mx-4">
          <button type="submit" className="m-2 btn btn-sm btn-outline-info font-weight-bold">
          <span className="oi oi-check"></span> Submit
          </button>
          <button
            className="m-2 btn btn-sm btn-outline-danger font-weight-bold"
            onClick={() => history.goBack()}
          >
           <span className="oi oi-x"></span> Cancel
          </button>
          <button
            className="m-2 btn btn-sm btn-outline-warning font-weight-bold"
            onClick={() => setFormData(initialState)}
          >
            <span className="oi oi-action-undo"></span> Reset
          </button>
        </div>
        </div>
      </div>
    </form>
  );
}

export default ResForm;
