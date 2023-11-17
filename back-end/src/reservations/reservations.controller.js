const knex = require("../db/connection")
const reservations = require('../db/seeds/00-reservations.json')
const service = require("./reservations.service")
/**
 * List handler for reservation resources
 */
async function list(request, response) {
  const date = request.query.date;
  const reservations = await service.list(date);
  const res = reservations.filter(
    (reservation) => reservation.status !== "finished"
  );
  response.json({ data: res });
}

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
]

function hasRequiredProperties(req, res, next) {
  const { data = {}} = req.body
  const missingProperties = [];

  for (const property of REQUIRED_PROPERTIES) {
    if (!data[property]) {
      missingProperties.push(property);
    }
  }

  if (missingProperties.length > 0) {
    return res.status(400).json({
      error: `Missing required properties: ${missingProperties.join(', ')}`,
    });
  }

  next();
}

function hasValidProperties(req, res, next) {
  const { reservation_date, reservation_time, people} = req.body.data;
  const isNumber = Number.isInteger(people);
  const day = `${reservation_date}  ${reservation_time}`;
  const today = new Date();
  const date = new Date(day);
  const timeFormat = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  const dateFormat = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

  if (!isNumber || people <= 0) {
    return next({
      status: 400,
      message: "You must make a reservation for 1 or more people",
    });
  }

  if (!reservation_date.match(dateFormat)) {
    return next({
      status: 400,
      message: `reservation_date is not a valid date!`,
    });
  }

  if (!reservation_time.match(timeFormat)) {
    return next({
      status: 400,
      message: `reservation_time is not a valid time!`,
    });
  }

  next()
}

async function create(req, res, next) {
  try {
    const { data: { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = {} } = req.body;
    const newReservation = {
      first_name: first_name,
      last_name: last_name,
      mobile_number: mobile_number,
      reservation_date: reservation_date,
      reservation_time: reservation_time,
      people: people
    };

    await service.create(newReservation);
    res.status(201).json({ data: newReservation });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  list,
  create: [hasRequiredProperties, hasValidProperties, create]
};
