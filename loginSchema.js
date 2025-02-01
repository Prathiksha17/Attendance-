const mdb = require("mongoose");
const loginSchema = mdb.Schema({
  email: String,
  password: String,
});
const login_schema = mdb.model("login", loginSchema);
module.exports= login_schema;