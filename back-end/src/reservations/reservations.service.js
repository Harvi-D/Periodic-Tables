const knex = require('../db/connection');

//create and return a new reservation
function create(reservation) {
    return knex('reservations')
        .insert(reservation)
        .returning('*')
        .then(newRes => newRes[0]);
}

//read individual reservation based on id
function read(id) {
    return knex('reservations')
        .select('*')
        .where({ reservation_id: id })
        .then(foundRes => foundRes[0]);
}

//return all reservations for day
function list(date) {
    return knex('reservations')
        .select('*')
        .where({ reservation_date: date })
        .orderBy('reservation_time');
}

module.exports = {
    create,
    read,
    list,
}