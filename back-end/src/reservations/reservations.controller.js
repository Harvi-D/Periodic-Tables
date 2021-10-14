const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//vvvvvvvvvv validation middleware vvvvvvvvvvvvvvvv

//confirm that request body has valid fields; if not send error
function hasValidFields(req, res, next) {
  const { data = {} } = req.body;
  const validFields = new Set([
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
    "status",
    "created_at",
    "updated_at",
    "reservation_id",
  ]);

  const invalidFields = Object.keys(data).filter(
    (field) => !validFields.has(field)
  );

  if (!invalidFields.length) {
    return next();
  }
  next({
    status: 400,
    message: `Invalid field(s): ${invalidFields.join(", ")}`,
  });
}

//verify existing reservation
async function reservationIdExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation: ${reservation_id} not found`,
  });
}

//confirm reservation status is not 'finished'
function statusNotFinished(req, res, next) {
  if (res.locals.reservation.status !== "finished") {
    return next();
  }
  next({
    status: 400,
    message: `A finished reservation can't be updated`,
  });
}

//verify that reservation status is valid
function reservationStatus(req, res, next) {
  const {
    data: { status },
  } = req.body;
  const validStatus = ["booked", "seated", "finished", "cancelled"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `Status: ${status}, not allowed for this reservation`,
  });
}

//verify that request body has appropriate data
function bodyHasData(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include ${propertyName}.`,
    });
  };
}

//define accepted request data
const has_first_name = bodyHasData("first_name");
const has_last_name = bodyHasData("last_name");
const has_mobile_number = bodyHasData("mobile_number");
const has_reservation_date = bodyHasData("reservation_date");
const has_reservation_time = bodyHasData("reservation_time");
const has_people = bodyHasData("people");

//vvvvvvv validate request properties vvvvvv
function firstNamePropertyIsValid(req, res, next) {
  const {
    data: { first_name },
  } = req.body;
  const invalidResult = [""];
  if (!invalidResult.includes(first_name)) {
    return next();
  }
  next({
    status: 400,
    message: "First name is required.",
  });
}

function lastNamePropertyIsValid(req, res, next) {
  const {
    data: { last_name },
  } = req.body;
  const invalidResult = [""];
  if (!invalidResult.includes(last_name)) {
    return next();
  }
  next({
    status: 400,
    message: "Last name is required.",
  });
}

function mobileNumberPropertyIsValid(req, res, next) {
  const {
    data: { mobile_number },
  } = req.body;
  const justNums = mobile_number.replace(/\D/g, "");
  if (justNums.length === 10) {
    return next();
  }
  next({
    status: 400,
    message: "Mobile number format is invalid.",
  });
}

function peoplePropertyIsValid(req, res, next) {
  const {
    data: { people },
  } = req.body;
  const peopleNum = Number.isInteger(people);
  if (peopleNum && peopleNum > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Number of people must be a positive whole number.",
  });
}

//when booked reservation initial status must be 'booked'
function initialStatusValid(req, res, next) {
  const {
    data: { status },
  } = req.body;
  if (status == "seated" || status == "finished") {
    next({
      status: 400,
      message: `Status: ${status} is not valid.`,
    });
  }
  return next();
}
//^^^^^^^^ !validate request properties ^^^^^^^^

//vvvvvvv validate time and date properties vvvvvvvvvv
//verify valid time string
function isTime(req, res, next) {
  const { data = {} } = req.body;

  if (
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data["reservation_time"]) ||
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
      data["reservation_time"]
    )
  ) {
    return next();
  }
  next({
    status: 400,
    message: `Invalid reservation_time.`,
  });
}

//verify that reservation request is not scheduled for date in the past.
function dateIsFutureDate(req, res, next) {
  const date = req.body.data.reservation_date;
  const resDate = new Date(date);
  const today = new Date();

  if (resDate >= today) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_date: ${resDate} is in the past. Reservations must be in the future.`,
  });
}

//verify reservation is not on Tuesdat; restaurant closed.
function dayNotTuesday(req, res, next) {
  const date = req.body.data.reservation_date;
  const resDate = new Date(date);

  if (resDate.getUTCDay() !== 2) {
    return next();
  }
  next({
    status: 400,
    message: `Reservation date: ${resDate} is invalid. Restaurant is closed on Tuesdays`,
  });
}

//verify that reservation is during business hours.
function isOpenHours(req, res, next) {
  const {
    data: { reservation_time },
  } = req.body;
  const hour = parseInt(reservation_time.split(":")[0]);
  const mins = parseInt(reservation_time.split(":")[1]);

  if (hour < 10 || (hour === 10 && mins <= 30)) {
    next({
      status: 400,
      message: "reservation_time must be between 10:30 a.m. and 9:30 p.m.",
    });
  } else if (hour > 21 || (hour === 21 && mins > 30)) {
    next({
      status: 400,
      message: "reservation_time must be between 10:30 a.m. and 9:30 p.m.",
    });
  }
  return next();
}
//^^^^^^^^ !validate time and date properties ^^^^^^^^

//^^^^^^^^ !validation middleware ^^^^^^^^^^^^^^

//vvvvvvvvvvvvv CRUDL vvvvvvvvvvvvvvvvvvvvvv
async function create(req, res, next) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

function read(req, res) {
  res.json({ data: res.locals.reservation });
}

async function updateRes(req, res) {
  const updatedRes = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };

  await service.update(res.locals.reservation.reservation_id, updatedRes);

  const updated = await service.read(res.locals.reservation.reservation_id);

  res.json({ data: updated });
}

async function updateStatus(req, res) {
  const updatedRes = {
    ...res.locals.reservation,
    ...req.body.data,
  };

  await service.update(res.locals.reservation.reservation_id, updatedRes);

  const updated = await service.read(res.locals.reservation.reservation_id);

  res.json({ data: updated });
}

async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    const data = await service.list(date);
    res.json({
      data,
    });
  } else if (mobile_number) {
    const data = await service.search(mobile_number);
    res.json({
      data,
    });
  }
}
//^^^^^^^^^^^^^ !CRUDL^^^^^^^^^^^^^^^^^^^^^
module.exports = {
  create: [
    hasValidFields,
    has_first_name,
    has_last_name,
    has_mobile_number,
    has_reservation_date,
    has_reservation_time,
    has_people,
    firstNamePropertyIsValid,
    lastNamePropertyIsValid,
    mobileNumberPropertyIsValid,
    isTime,
    dateIsFutureDate,
    dayNotTuesday,
    isOpenHours,
    peoplePropertyIsValid,
    initialStatusValid,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationIdExists), read],
  updateRes: [
    asyncErrorBoundary(reservationIdExists),
    hasValidFields,
    has_first_name,
    has_last_name,
    has_mobile_number,
    has_reservation_date,
    has_reservation_time,
    has_people,
    firstNamePropertyIsValid,
    lastNamePropertyIsValid,
    mobileNumberPropertyIsValid,
    isTime,
    dateIsFutureDate,
    dayNotTuesday,
    isOpenHours,
    peoplePropertyIsValid,
    initialStatusValid,
    asyncErrorBoundary(updateRes),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationIdExists),
    statusNotFinished,
    reservationStatus,
    asyncErrorBoundary(updateStatus),
  ],
  list: asyncErrorBoundary(list),
};
