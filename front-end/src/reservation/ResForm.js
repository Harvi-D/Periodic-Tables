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
      if (newDate.getDay() === 2)
        throw new Error("Closed on Tuesdays!");
      if (newDate < currentDay) throw new Error("Not Available");
     
      let time = Number(formData.reservation_time.replace(":", ""));
      if (time < 1030 || time > 2130)
        throw new Error(
          "Only from 10:30 AM to 9:30 PM."
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
      if(err.response) setReservationsError({ message: err.response.data.error })
      if(!err.response)setReservationsError(err);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <h2 className="text-center pb-2">{type} Reservation</h2>
      <form action="" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name" className="form-label">
            First name:
            <input
              className="form-control"
              id="first_name"
              type="text"
              name="first_name"
              onChange={handleChange}
              value={formData.first_name}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="last_name" className="form-label">
            Last name:
            <input
              className="form-control"
              id="last_name"
              type="text"
              name="last_name"
              onChange={handleChange}
              value={formData.last_name}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="mobile_number" className="form-label">
            Phone number:
            <input
              className="form-control"
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
        <div className="form-group">
          <label htmlFor="reservation_date" className="form-label">
            Date:
            <input
              className="form-control"
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
        <div className="form-group">
          <label htmlFor="reservation_time" className="form-label">
            Time:
            <input
              className="form-control"
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
        <div className="form-group">
          <label htmlFor="people" className="form-label">
            Number of guests:
            <input
              className="form-control"
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
        <div className="form-group">
          <button type="submit" className="btn btn-sm btn-info">Submit</button>
          <button className="mx-3 btn btn-sm btn-danger" onClick={() => history.goBack()}>
            Cancel
          </button>
          <button className="btn btn-sm btn-warning" onClick={() => setFormData(initialState)}>Reset</button>
        </div>
      </form>
      <ErrorAlert error={reservationsError} />
    </div>
  );
}


export default ResForm;
