const knex = require("../db/connection");

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createRecords) => createRecords[0]);
}

function read(table_id) {
  return knex("tables").select("*").where({ table_id: table_id }).first();
}

//update reservation status to seated and add reservation_id to the table
function update(updatedTable) {
  return knex.transaction((trx) => {
    return knex("reservations")
      .transacting(trx)
      .where({ reservation_id: updatedTable.reservation_id })
      .update({ status: "seated" })
      .then(() => {
        return knex("tables")
          .where({ table_id: updatedTable.table_id })
          .update({ reservation_id: updatedTable.reservation_id })
          .returning("*");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
}

//update reservation status to finished and remove reservation_id from table
function finish(table_id, reservation_id) {
  return knex.transaction((trx) => {
    return knex("reservations")
      .transacting(trx)
      .where({ reservation_id: reservation_id })
      .update({ status: "finished" })
      .returning("*")
      .then(() => {
        return knex("tables")
          .where({ table_id: table_id })
          .update({ reservation_id: null })
          .returning("*");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
}

async function list() {
  return knex("tables").select("*").orderBy("table_name");
}

module.exports = {
  list,
  create,
  read,
  update,
  finish,
};
