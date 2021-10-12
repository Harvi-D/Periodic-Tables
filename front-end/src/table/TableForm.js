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
    <>
      <div className="d-flex flex-column align-items-center">
        <h2 className="text-center pb-2">Create a New Table</h2>
        <form action="" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name" className="form-label">
              Table name:
              <input
                className="form-control"
                id="table_name"
                type="text"
                name="table_name"
                onChange={handleChange}
                value={formData.table_name}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="people" className="form-label">
              capacity:
              <input
                className="form-control"
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
          <div className="form-group">
            <button className="btn btn-sm btn-info" type="submit">Submit</button>
            <button className="mx-3 btn btn-sm btn-danger" onClick={() => history.goBack()}>
              Cancel
            </button>
            <button className="btn btn-sm btn-warning" onClick={() => setFormData(initialState)}>Reset</button>
          </div>
        </form>
        <ErrorAlert error={tablesError} />
      </div>
    </>
  );
}

export default TableForm;
