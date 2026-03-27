const mongoose = require("mongoose");

//console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Db is Up"))
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));
