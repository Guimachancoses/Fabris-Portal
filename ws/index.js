const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const app = express();
require("./database"); 

// Middlewares
app.use(morgan("dev"));
// Informa que vai trabalhar com dados de retorno JSON
app.use(express.json());
app.use(cors());

// Settings
app.set("port", 8080);

// Routes
app.use("/loja", require("./src/routes/loja.routes"));
app.use("/colaborador", require("./src/routes/colaborador.routes"));
app.use("/metas", require("./src/routes/meta.routes"));
app.use('/clerk', require("./src/routes/api/clerk/clerk.routes"))

// Start server
app.listen(app.get("port"), () => {
    console.log("Ws escutando na porta", app.get("port"));
});
