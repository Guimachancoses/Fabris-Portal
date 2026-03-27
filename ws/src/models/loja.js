const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loja = new Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
    },
    foto: String,
    capa: String,
    email: {
        type: String,
        required: false,
    },
    senha: {
        type: String,
        default: null,
    },
    meta: String,
    faturamento: String,
    telefone: String,
    status: {
        type: String,
        enum: ["A", "I"],
        default: "A",
    },
    endereco: {
        logradouro: String,
        bairro: String,
        cidade: String,
        uf: String,
        cep: String,
        numero: String,
        pais: String,
    },
    geo: {
        tipo: String,
        coordinates: [Number],
    },
    dataInicio: {
        type: Date,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },
});

loja.index({ geo: '2dsphere' });

module.exports = mongoose.model('Loja', loja)