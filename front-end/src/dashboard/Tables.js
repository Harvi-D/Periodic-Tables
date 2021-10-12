import { clearTable } from "../utils/api";

function Tables({ table }) {
  const handleFinish = async () => {
    if (
      window.confirm(
        "Is this table ready to seat new guests? \n \n \nThis cannot be undone."
      )
    ) {
      try {
        await clearTable(table.table_id);
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };
  return (
    <>
      <div className="card m-3 bg-light" style={{ width: "10rem" }}>
        <div className="card-body">
          <h5 className="card-title">Table {table.table_name}</h5>
          <h6 className="card-subtitle mb-2 text-muted">
          <span className="oi oi-people m-2"> </span> {table.capacity}
          </h6>
          {table.reservation_id ? (
            <h6 data-table-id-status={table.table_id}>occupied</h6>
          ) : (
            <h6 data-table-id-status={table.table_id}>free</h6>
          )}
          {table.reservation_id ? (
            <button
              data-table-id-finish={table.table_id}
              onClick={handleFinish}
            >
              Finish
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
} 

export default Tables;