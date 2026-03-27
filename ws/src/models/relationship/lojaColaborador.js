const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lojaColaborador = new Schema({
  lojaId: {
    type: mongoose.Types.ObjectId,
    ref: "Loja",
    required: true,
  },
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I",'E'],
    default: "A",
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LojaColaborador", lojaColaborador);
