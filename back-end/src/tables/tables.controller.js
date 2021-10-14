const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("../reservations/reservations.service");

//vvvvvvvvvvvvv validation middleware vvvvvvvvvvvvvvvv

//vvvvvvv request body middleware vvvvvvv
//verify that request body has data
function bodyHasData(req, res, next) {
  const body = req.body.data;
  if (body) {
    return next();
  }
  next({
    status: 400,
    message: "No data received.",
  });
}

//verify the reservation_id property
function bodyHasResIdProperty(req, res, next) {
  const {
    data: { reservation_id },
  } = req.body;
  if (reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: "reservation_id field is required.",
  });
}

//verify the table_name property
function bodyHasTableNameProperty(req, res, next) {
  const {
    data: { table_name },
  } = req.body;
  if (table_name) {
    return next();
  }
  next({
    status: 400,
    message: "table_name field is required.",
  });
}

function tableNamePropertyIsValid(req, res, next) {
  const {
    data: { table_name },
  } = req.body;
  if (table_name.length >= 2) {
    return next();
  }
  next({
    status: 400,
    message: "table_name must be two or more characters.",
  });
}

//verify the capacity property
function bodyHasCapacityProperty(req, res, next) {
  const {
    data: { capacity },
  } = req.body;
  if (capacity) {
    return next();
  }
  next({
    status: 400,
    message: "Table capacity field is required.",
  });
}

function capacityPropertyIsValid(req, res, next) {
  const capacity = req.body.data.capacity;

  if (Number.isInteger(capacity) && capacity > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Table capacity must be a whole number greater than zero.",
  });
}
//^^^^^^^^ request body middleware ^^^^^^^^^

//vvvvvv table middleware vvvvvvvv
//verify existing table
async function tableIdExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table: ${table_id} was not found.`,
  });
}
//verify that table is occupied
function tableIsOccupied(req, res, next) {
  if (res.locals.table.reservation_id !== null) {
    return next();
  }
  next({
    status: 400,
    message: "Table is not occupied.",
  });
}

function tableIsUnoccupied(req, res, next) {
  if (res.locals.table.reservation_id === null) {
    return next();
  }
  next({
    status: 400,
    message: "Table is already occupied.",
  });
}
//compare table and pary size
function sufficientCapacity(req, res, next) {
  if (res.locals.reservation.people <= res.locals.table.capacity) {
    return next();
  }
  next({
    status: 400,
    message:
      "Table capacity is not large enough for number of people in party.",
  });
}
//^^^^^^^^^ !table middleware ^^^^^^^^^

//vvvvvvvv reservation middleware vvvvvvv
//verify existing reservation
async function resIdExists(req, res, next) {
  const {
    data: { reservation_id },
  } = req.body;
  const reservation = await reservationsService.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation: ${reservation_id} not found.`,
  });
}
//verify that reservation is not currently seated
function resNotSeated(req, res, next) {
  if (res.locals.reservation.status !== "seated") {
    return next();
  }
  next({
    status: 400,
    message: "Reservation is currently seated.",
  });
}
//^^^^^^^ !reservation middleware ^^^^^^^^

//^^^^^^^^^^^^^^ !validation middleware ^^^^^^^^^^^^^^^^^

//vvvvvvvvvvvvvv CRUDL vvvvvvvvvvvvvvvvv
async function create(req, res, next) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

async function update(req, res) {
  const updatedTable = {
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };

  await service.update(updatedTable);

  const updated = await service.read(updatedTable.table_id);

  res.json({ data: updated });
}

async function finish(req, res) {
  const data = await service.finish(
    res.locals.table.table_id,
    res.locals.table.reservation_id
  );
  res.json({
    data,
  });
}

async function list(req, res) {
  const data = await service.list();
  res.json({
    data,
  });
}
//^^^^^^^^^^^^^^ !CRUDL ^^^^^^^^^^^^^^^^^

module.exports = {
  create: [
    bodyHasData,
    bodyHasTableNameProperty,
    tableNamePropertyIsValid,
    bodyHasCapacityProperty,
    capacityPropertyIsValid,
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(tableIdExists),
    bodyHasData,
    bodyHasResIdProperty,
    tableIsUnoccupied,
    asyncErrorBoundary(resIdExists),
    sufficientCapacity,
    resNotSeated,
    asyncErrorBoundary(update),
  ],
  finish: [
    asyncErrorBoundary(tableIdExists),
    tableIsOccupied,
    asyncErrorBoundary(finish),
  ],
  list: asyncErrorBoundary(list),
};
