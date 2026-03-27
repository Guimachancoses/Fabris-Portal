const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lojaMeta = new Schema({
  lojaId: {
    type: mongoose.Types.ObjectId,
    ref: "Loja",
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

module.exports = mongoose.model("lojaMeta", lojaMeta);
