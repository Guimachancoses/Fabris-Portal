const express = require("express");
const router = express.Router();
//const turf = require("turf");
const mongoose = require("mongoose");
const Loja = require("../models/loja");
const Meta = require("../models/meta");
const LojaColaborador = require("../models/relationship/lojaColaborador")
const LojaMeta = require("../models/relationship/lojaMeta")
const ColaboradorMeta = require("../models/relationship/colaboradorMeta")

// rota para cadastro de loja
router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    //console.log("=== [POST /colaborador] INÍCIO ===");

    //console.log("📥 Body recebido:", JSON.stringify(req.body, null, 2));

    const { loja } = req.body;

    //console.log("👤 Loja recebido:", JSON.stringify(loja, null, 2));

    const colaboradorId = loja?.colaboradorId ?? null

    let newLoja = null;

    // 🔍 Verifica se já existe
    const existenteLoja = await Loja.findOne({
      nome: loja.nome
    }).session(session);

    // console.log(
    //   "🔎 Loja existente?",
    //   existenteLoja ? "SIM" : "NÃO"
    // );

    if (!existenteLoja) {
      //console.log("🆕 Criando nova loja no MongoDB...");

      newLoja = await new Loja({
        ...loja,
        recipientId: null,
      }).save({ session });

      // console.log(
      //   "✅ Nova loja salvo:",
      //   newLoja._id.toString()
      // );

    }

    const lojaId = existenteLoja
      ? existenteLoja._id
      : newLoja._id;

    //console.log("🆔 lojaId usado:", lojaId.toString());

    if (colaboradorId) {

      // 🔍 Verifica vínculo
      const existentRelationship = await LojaColaborador.findOne({
        lojaId,
        colaboradorId,
      }).session(session);

      //console.log("existentRelationship", existentRelationship)

      // console.log(
      //   "🔗 Vínculo existente?",
      //   existentRelationship ? "SIM" : "NÃO"
      // );


      if (!existentRelationship) {
        //console.log("➕ Criando vínculo Loja ↔ Colaborador...");

        await new LojaColaborador({
          lojaId,
          colaboradorId,
          status: 'A',
        }).save({ session });

        //console.log("✅ Vínculo criado com sucesso");
      }
    }

    if (existenteLoja && colaboradorId) {
      //console.log("♻️ Atualizando status do vínculo existente");

      await LojaColaborador.findOneAndUpdate(
        { lojaId, colaboradorId },
        { status: 'A' },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    //console.log("🎉 Loja incluída com sucesso");
    res.json({ loja });
  } catch (err) {
    //console.error("❌ ERRO AO SALVAR LOJA:", err);
    await session.abortTransaction();
    session.endSession();

    res.json({
      error: true,
      message: err.message,
    });
  }
});

// Rota de atualização da loja no banco de dados MongoDB
router.put("/updateLoja", async (req, res) => {
  try {
    const { loja } = req.body;
    console.log("📥 Body recebido:", req.body);

    if (!loja) {
      return res.status(400).json({
        error: true,
        message: "Objeto loja não enviado",
      });
    }

    //console.log("📦 Loja recebido:", loja);

    const lojaId = loja._id;

    if (!lojaId) {
      return res.status(400).json({
        error: true,
        message: "Id da loja não informado",
      });
    }

    // remove _id do payload para evitar erro de cast
    const { _id, ...dadosAtualizar } = loja;

    const atualizado = await Loja.findByIdAndUpdate(
      lojaId,
      { $set: dadosAtualizar },
      { new: true }
    );

    //console.log("✅ Loja atualizada:", atualizado);

    return res.json({ error: false, data: atualizado });
  } catch (err) {
    //console.error("❌ Erro ao atualizar loja:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
});

// Rota para retornar todos os colaboradores cadastrados
router.post("/filter", async (req, res) => {
  try {
    // console.log(
    //   "Filtros recebidos:",
    //   JSON.stringify(req.body.filters, null, 2)
    // );

    // Busca colaboradores
    const lojaDB = await Loja.find(req.body.filters);

    const lojaIds = lojaDB.map((c) => c._id);

    // Busca vínculos da loja
    const vinculos = await LojaColaborador.find({
      lojaId: { $in: lojaIds },
    });

    // Cria um map lojaId -> status
    const vinculoMap = {};
    vinculos.forEach((v) => {
      vinculoMap[v.lojaId.toString()] = v.status;
    });

    // Monta o retorno final
    const lojas = lojaDB.map((item) => ({
      _id: item._id,
      email: item?.email,
      nome: item?.nome,
      meta: item?.meta,
      status: item?.status,
      vinculo: vinculoMap[item._id.toString()] || null,
    }));

    res.json({ error: false, lojas });
  } catch (err) {
    console.error(err);
    res.json({ error: true, message: err.message });
  }
});

// Rota par retornar todos os metas de uma determinada loja
router.get("/metas/:lojaId", async (req, res) => {
  try {
    const { lojaId } = req.params;

    // Busca todos os vínculos da loja
    const vinculos = await LojaMeta.find(
      { lojaId })
      .populate("metaId");

    // Extrai os metaId
    const metaIds = vinculos.map(v => v.metaId);

    // Busca todas as metas relacionadas
    const metas = await Meta.find({
      _id: { $in: metaIds }
    });

    res.json({ error: false, metas });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

// Rota para retornar todas as metas de uma determinada loja e do colaborador filtrando ano e mes
router.post("/metas/periodo", async (req, res) => {
  try {
    const { filters } = req.body;

    // console.log("📥 Body recebido:", req.body);

    if (!filters.lojaId || !filters.ano || !filters.mes) {
      return res.status(400).json({
        error: true,
        message: "lojaId, colaboradorId, ano e mes são obrigatórios"
      });
    }

    const lojaId = filters.lojaId
    const ano = filters.ano
    const mes = filters.mes

    // METAs DA LOJA
    const vinculosLoja = await LojaMeta.find({
      lojaId,
      status: { $ne: "E" },
    })
      .populate({
        path: "metaId",
        match: { ano, mes },
        select: "_id meta faturamento ano mes status"
      });

    const metasLoja = vinculosLoja
      .map(v => v.metaId)
      .filter(Boolean);
    // METAS DOS COLABORADORES
    let listaColaboradores = [];

    const lojaColaboradores = await LojaColaborador.find({
      lojaId,
      status: { $ne: "E" },
    })
      .populate({
        path: "colaboradorId",
        select: "nome sobrenome",
      })
      .select("colaboradorId");

    for (const vinculo of lojaColaboradores) {

      if (!vinculo.colaboradorId) {
        continue;
      }

      const objetivosId = await ColaboradorMeta.find({
        colaboradorId: vinculo.colaboradorId._id,
        status: { $ne: "E" },
      }).populate({
        path: "metaId",
        match: { ano, mes },
        select: "_id metaId meta faturamento ano mes status",
      });

      console.log(objetivosId)

      const metasFiltradas = objetivosId
        .map(m => m.metaId)
        .filter(Boolean);

      if (metasFiltradas.length === 0) continue;

      listaColaboradores.push({
        colaboradorId: vinculo.colaboradorId._id,
        nome: vinculo.colaboradorId.nome,
        sobrenome: vinculo.colaboradorId.sobrenome,
        metas: metasFiltradas
      });
    }

    res.json({
      error: false,
      loja: metasLoja,
      colaboradores: listaColaboradores
    });

  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message
    });
  }
});

// Rota para retornar todos os meses e anos de metas de uma determinada loja
router.get("/metas/meses-anos/:lojaId", async (req, res) => {
  try {
    const { lojaId } = req.params;

    if (!lojaId) {
      return res.status(400).json({
        error: true,
        message: "lojaId é obrigatório",
      });
    }

    const vinculos = await LojaMeta.find({
      lojaId,
      status: { $ne: "E" },
    })
      .populate({
        path: "metaId",
        select: "ano mes",
      })
      .lean();

    /**
     * Resultado final:
     * {
     *   2026: ["Janeiro"],
     *   2025: ["Dezembro"]
     * }
     */
    const resultado = vinculos.reduce((acc, item) => {
      if (!item.metaId) return acc;

      const { ano, mes } = item.metaId;

      if (!ano || !mes) return acc;

      if (!acc[ano]) {
        acc[ano] = [];
      }

      if (!acc[ano].includes(mes)) {
        acc[ano].push(mes);
      }

      return acc;
    }, {});

    return res.json({
      error: false,
      periodos: resultado,
    });

  } catch (err) {
    //console.error("Erro /metas/meses-anos:", err);
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});

// Buscar loja pelo ID com metas
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const loja = await Loja.findById(id).lean().select("nome status");

    if (!loja) {
      return res.status(404).json({
        error: true,
        message: "Loja não encontrada",
      });
    }

    const vinculos = await LojaMeta.find({ lojaId: id })
      .populate({
        path: "metaId",
        select: "meta faturamento ano mes status dataInicio"
      })
      .lean();

    const metas = vinculos
      .map(v => v.metaId)
      .filter(Boolean);

    if (metas) { loja.metas = metas ?? "" }

    return res.json({
      error: false,
      loja,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});

module.exports = router;
