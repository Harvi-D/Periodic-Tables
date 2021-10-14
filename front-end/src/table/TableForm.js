import { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api";

function TableForm() {
  const history = useHistory();
  const initialState = {
    table_name: "",
    capacity: 0,
  };
  const [formData, setFormData] = useState({ ...initialState });
  const [tablesError, setTablesError] = useState(null);
  const handleChange = ({ target }) => {
    const value =
      target.type === "number" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createTable({ data: formData });
      setFormData({ ...initialState });
      history.push(`/dashboard`);
    } catch (err) {
      setTablesError({ message: err.response.data.error });
    }
  };

  return (
    <main>
      <form action="" onSubmit={handleSubmit}>
        <ErrorAlert error={tablesError} />
        <div className="card border-secondary mt-2">
          <div className="card-header text-center bg-dark text-light">
            <h2>Create a New Table</h2>
          </div>
          <div className="form-col d-flex justify-content-center">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                Table name:
                <input
                  className="form-control border-secondary bg-light"
                  placeholder="#x"
                  id="table_name"
                  type="text"
                  name="table_name"
                  onChange={handleChange}
                  value={formData.table_name}
                  required
                />
              </label>

              <div className="form-group">
                <label htmlFor="people" className="form-label">
                  Capacity:
                  <input
                    className="form-control border-secondary bg-light"
                    id="capacity"
                    type="number"
                    min="1"
                    max="22"
                    name="capacity"
                    onChange={handleChange}
                    value={formData.capacity}
                    required
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="form-row d-flex justify-content-center">
            <div className="form-group mx-4">
              <button  
              type="submit" 
              className="m-2 btn btn-sm btn-outline-info font-weight-bold"
              >
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
    </main>
  );
}

export default TableForm;
