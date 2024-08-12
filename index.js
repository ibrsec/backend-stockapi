"use strict";

/* --------------------------------- imports -------------------------------- */
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnection } = require("./src/configs/dbConnection");
const logger = require("./src/middlewares/logger");
const errorHandler = require("./src/middlewares/erroHandler");
const cors = require("cors");
const queryHandler = require("./src/middlewares/queryHandler");
const path = require("path");
const userDataSync = require("./src/helpers/userDataSync");
const adminUser = require("./src/helpers/adminUser");


/* ------------------------------- Express app ------------------------------ */
const app = express();
const PORT = process.env.PORT;

/* ------------------------------ dbconnection ------------------------------ */
dbConnection();
adminUser();

/* ------------------------------- middlewares ------------------------------ */
//customError ok,swagger ok,redoc ok ,authentication,permission,query handler, notfound route

//cors
app.use(cors());

app.use(express.json());

//logger
app.use(logger);

// authentication
app.use(require("./src/middlewares/auhthentication"));

//query handler
app.use(queryHandler);

/* --------------------------------- routes --------------------------------- */
//welcome route
app.all("/", (req, res) => {
  res.json({
    message: "Welcome to Stock api!",
    documents: ["/documents/json", "/documents/swagger", "/documents/redoc"],
    user: req.user,
  });
});

//main route index
app.use("/", require("./src/routes/routerIndex"));

//swagger statics
app.use(
  "/swagger",
  express.static(path.join(__dirname, "node_modules", "swagger-ui-dist"))
);

//not found route
app.use("*", (req, res) => {
  res.errorStatusCode = 400;
  throw new Error("route not found!");
});

/* ------------------------------ error handle ------------------------------ */
app.use(errorHandler);

/* ----------------------------------- RUN ---------------------------------- */
app.listen(PORT, () => console.log("Server is running on:", PORT));

// clean and add user data
// userDataSync()



// const { Token } = require("./src/models/tokenModel");
// Token.deleteMany().then(()=>console.log('object'))



//productsa quantityyi unutmusuz
//  onu ekle ve  purcahse 'e devam et.!!!!