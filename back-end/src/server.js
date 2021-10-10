const { PORT = 5000 } = process.env;

const app = require("./app");
const knex = require("./db/connection");

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}
app.listen(PORT, listener);
