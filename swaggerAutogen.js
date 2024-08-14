"use strict";
 
require("dotenv").config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const swaggerAutogen = require("swagger-autogen");
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.name,
    description: packageJson.description,
    termsOfService: "https://www.ibrsec.com",
    license: { name: packageJson.license },
    contact: { name: packageJson.author, email: "ibr.seckin@gmail.com" },
  },
  host: `${HOST}${process.env.NODE_ENV === 'dev' ? (":"+ PORT) : ""}`,
  basePath: "/",
  schemes: ["https", "http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Token: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        " Simple token authentication *  example: <b>Token ...tokenkey...</b>",
    },
    Bearer: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Jwt token authentication *  example : <b>Bearer ...jwt tokenkey...</b>",
    },
  },
  security: [{ Token: [] }, { Bearer: [] }],
  definitions: {
    User: require("./src/models/userModel").User.schema.obj,
    Token: require("./src/models/tokenModel").Token.schema.obj,
    Firm: require("./src/models/firmModel").Firm.schema.obj,
    Category: require("./src/models/categoryModel").Category.schema.obj,
    Brand: require("./src/models/brandModel").Brand.schema.obj,
    Product: require("./src/models/productModel").Product.schema.obj,
    Purchase: require("./src/models/purchaseModel").Purchase.schema.obj,
    Sale: require("./src/models/saleModel").Sale.schema.obj,
    // Car: require("./src/models/carModel").Car.schema.obj,
    // Reservation: require("./src/models/reservationModel").Reservation.schema.obj,
    Error: {
      error: "true",
      message: "error message",
      body: "error body",
      stack: "errorstack info"
    },
  },
};

const routes = ["./index.js"];
const outputFile = "./src/configs/swagger.json";

swaggerAutogen(outputFile, routes, document);
