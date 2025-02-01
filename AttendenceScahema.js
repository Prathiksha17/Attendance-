const mdb = require("mongoose");
const attendanceSchema = mdb.Schema({
    name: String,
    status: String,
    date: String,
    time: String
});
const attendance_schema = mdb.model("attendance", attendanceSchema);
module.exports= attendance_schema;