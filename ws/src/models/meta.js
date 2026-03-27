const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meta = new Schema({
  status: {
    type: String,
    enum: ["A", "I"],
    default: "A",
  },
  meta: {
    type: Number,
    required: true
  },
  faturamento: {
    type: Number,
    required: true
  },
  dataInicio: Date,
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Meta", meta);
