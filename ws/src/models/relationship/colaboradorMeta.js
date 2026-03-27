const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const colaboradorMeta = new Schema({
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  metaId: {
    type: mongoose.Types.ObjectId,
    ref: "Meta",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    default: "A",
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ColaboradorMeta", colaboradorMeta);
