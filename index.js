"use strict";

/* --------------------------------- imports -------------------------------- */
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnection } = require("./src/configs/dbConnection");
const logger = require("./src/middlewares/logger");
const errorHandler = require("./src/middlewares/erroHandler");
const cors = require("cors");


/* ------------------------------- Express app ------------------------------ */
const app = express();
const PORT = process.env.PORT;


/* ------------------------------ dbconnection ------------------------------ */
dbConnection();

/* ------------------------------- middlewares ------------------------------ */
//customError ok,swagger ok,redoc ok ,authentication,permission,query handler, notfound route

app.use(express.json());

//logger
app.use(logger);

//cors
app.use(cors());


/* --------------------------------- routes --------------------------------- */
app.use("/", require("./src/routes/routerIndex"));

/* ------------------------------ error handle ------------------------------ */
app.use(errorHandler);

/* ----------------------------------- RUN ---------------------------------- */
app.listen(PORT, () => console.log("Server is running on:", PORT));
