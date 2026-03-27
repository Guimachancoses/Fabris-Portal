const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const colaborador = new Schema({
  email: {
    type: String,
    required: [true, "E-mail é obrigatório"],
  },
  nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  sobrenome: {
    type: String,
    required: [true, "Sobreome é obrigatório"],
  },
  funcao: {
    type: String,
    enum: ["G", "V", "Aux", "Admin"],
    required: false,
  },
  telefone: {
    area: {
      type: String,
    },
    numero: {
      type: String,
    },
  },
  senha: {
    type: String,
    default: null,
  },
  identificacao: {
    tipoD: String,
    numero: String,
  },
  enderecoPadrao: {
    type: String,
  },
  endereco: {
    id: String,
    cep: String,
    logradouro: String,
    bairro: String,
    numero: Number,
    cidade: {
      nome: String,
    },
  },
  foto: {
    type: String,
  },
  dataNascimento: {
    type: String, // YYYY-MM-dd
    required: false,
  },
  sexo: {
    type: String,
    enum: ["M", "F"],
    required: false,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    default: "A",
  },
  recipientId: {
    type: String,
  },
  meta: {
    type: String,
  },
  faturamento: {
    type: String,
  },
  first: {
    type: Boolean,
    default: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Colaborador", colaborador);
