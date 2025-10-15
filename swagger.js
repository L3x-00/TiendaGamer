// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tienda Gamer",
      version: "1.0.0",
      description: "Documentación de la API Tienda Gamer desarrollada por Alex",
      contact: {
        name: "Alex",
        email: "alex@example.com",
      },
    },
    servers: [
      { url: "https://tienda-alex.onrender.com/api", description: "Servidor Render" },
      { url: "http://localhost:3000/api", description: "Servidor Local" },
    ],
  },
  apis: ["./routes/*.js"], // Rutas documentadas
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs disponibles en /api-docs");
}

module.exports = swaggerDocs;
