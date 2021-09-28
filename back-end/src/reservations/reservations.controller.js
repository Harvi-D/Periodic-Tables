const service = require('./reservations.service');
const checkProperties = require('../errors/checkProperties');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

const VALID_PROPERTIES = [
  'first_name',
  'last_name',
  'mobile_number',
  'reservation_date',
  'reservation_time',
  'people'
];

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ID: ${reservationId} not found.`
  })
}

const hasProperties = checkProperties(...VALID_PROPERTIES);
const timeStyle = /^\d\d:\d\d$/;
const dateStyle = /^\d\d\d\d-\d\d-\d\d$/;

function onlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidField = Object.keys(data).filter(field => 
    !VALID_PROPERTIES.includes(field)
  );

  if (invalidField.length) {
    return next({
      status: 400,
      message: `Invalid field: ${invalidField.join(', ')}`,
    });
  }
  next();
}

function validDate(date) {
  return date.match(dateStyle)?.[0];
}

function validTime(time) {
  return time.match(timeStyle)?.[0];
}

function notTuesday(reservationDate) {
  const date = new Date(reservationDate);
  return date.getUTCDay() !== 2;
}

function notPastDate(reservation_time, reservation_date) {
  const currentDay = Date.now();
  const reservationDate = new Date(`${reservation_date} ${reservation_time}`);
  return reservationDate.valueOf() > currentDay;
}

function duringBusinessHours(reservation_time) {
  const open = '10:30';
  const closed = '21:30';
  return reservation_time <= closed && reservation_time >= open;
}

function hasValidValues(req, res, next) {
  const { reservation_date, reservation_time, people } = req.body.data;

  if(!Number.isInteger(people) || people < 1) {
    return next({
      status: 400,
      message: `Number of people can't be less than 1 or a decimal.`
    });
  }

  if(!validDate(reservation_date)) {
    return next({
      status: 400,
      message: `reservation_date must be formatted as: YYYY-MM-DD.`
    });
  }

  if (!validTime(reservation_time)) {
    return next({
      status: 400,
      message: `reservation_time must be formatted as: HH:MM.`
    });
  }

  if (!notTuesday(reservation_date)) {
    return next({
      status: 400,
      message: `The restaurant is closed on Tuesday.`
    });
  }

  if (!notPastDate(reservation_time, reservation_date)) {
    return next({
      status: 400, 
      message: `Only future reservations are permitted.`
    });
  }

  if (!duringBusinessHours(reservation_time)) {
    return next({
      status: 400,
      message: `The restaurant accepts reservations between 10:30 am and 9:30 pm.`
    });
  }
  next();
}

//create reservation 
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

//read reservations
async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

// list reservations
async function list(req, res) {
  const { date } = req.query;
  const reservation = await service.list(date);
  res.locals.data = reservation;
  const { data } = res.locals;
  res.json({ data: data });
}

module.exports = {
  create: [hasProperties, onlyValidProperties, hasValidValues, asyncErrorBoundary(create)],
  read: [reservationExists, asyncErrorBoundary(read)],
  list: [asyncErrorBoundary(list)],
};
