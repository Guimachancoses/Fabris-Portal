// Estrutura padrão de rota
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Colaborador = require("../models/colaborador");
const LojaColaborador = require("../models/relationship/lojaColaborador");
const ColaboradorMeta = require("../models/relationship/colaboradorMeta");
const Meta = require("../models/meta");

// Rota para criar o colaborador no banco de dados MongoDB
router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    //console.log("=== [POST /colaborador] INÍCIO ===");

    //console.log("📥 Body recebido:", JSON.stringify(req.body, null, 2));

    const { colaborador, lojaId } = req.body;

    //console.log("👤 Colaborador recebido:", JSON.stringify(colaborador, null, 2));
    //console.log("🏬 LojaId recebido:", lojaId);

    let newColaborador = null;

    // 🔍 Verifica se já existe
    const existenteColaborador = await Colaborador.findOne({
      email: colaborador.email,
      telefone: colaborador.telefone,
    }).session(session);

    // console.log(
    //   "🔎 Colaborador existente?",
    //   existenteColaborador ? "SIM" : "NÃO"
    // );

    if (!existenteColaborador) {
      //console.log("🆕 Criando novo colaborador no MongoDB...");

      newColaborador = await new Colaborador({
        ...colaborador,
        recipientId: null,
      }).save({ session });

      // console.log(
      //   "✅ Novo colaborador salvo:",
      //   newColaborador._id.toString()
      // );
    }

    const colaboradorId = existenteColaborador
      ? existenteColaborador._id
      : newColaborador._id;

    //console.log("🆔 ColaboradorId usado:", colaboradorId.toString());

    if (lojaId) {
      // 🔍 Verifica vínculo
      const existentRelationship = await LojaColaborador.findOne({
        lojaId,
        colaboradorId,
        status: "E",
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
          status: colaborador?.vinculo?.status,
        }).save({ session });

        //console.log("✅ Vínculo criado com sucesso");
      }

      if (existenteColaborador) {
        //console.log("♻️ Atualizando status do vínculo existente");

        await LojaColaborador.findOneAndUpdate(
          { lojaId, colaboradorId },
          { status: colaborador?.vinculo?.status },
          { session }
        );
      }

    }

    // // 🔍 Metas
    //console.log("🎯 Metas recebidas:", colaborador.metas);

    if (Array.isArray(colaborador.metas) && colaborador.metas.length > 0) {
      await ColaboradorMeta.insertMany(
        colaborador.metas.map((metaId) => ({
          metaId,
          colaboradorId,
        })),
        { session }
      );

      //console.log("✅ Metas vinculadas ao colaborador");
    } else {
      //console.log("⚠️ Nenhuma meta para inserir");
    }

    await session.commitTransaction();
    session.endSession();

    //console.log("💾 Transação COMMITADA com sucesso");

    // if (existenteColaborador && existentRelationship) {
    //   console.log("⚠️ Colaborador já existia e já estava vinculado");

    //   return res.json({
    //     error: true,
    //     message: "Colaborador já cadastrado.",
    //   });
    // }

    //console.log("🎉 Colaborador incluído com sucesso");
    res.json({ error: false });

  } catch (err) {
    //console.error("❌ ERRO AO SALVAR COLABORADOR:", err);

    await session.abortTransaction();
    session.endSession();

    res.json({ error: true, message: err.message });
  } finally {
    //console.log("=== [POST /colaborador] FIM ===");
  }
});

// Rota de atualização do vinculo do colaborador no banco de dados MongoDB
router.put("/:vinculoId", async (req, res) => {
  try {
    const { vinculo, vinculoId } = req.body;

    // 1º Atualizar vinculo pelo ID do vinculo
    await LojaColaborador.findByIdAndUpdate(vinculoId, { status: vinculo });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

// Rota de atualização do colaborador no banco de dados MongoDB
router.patch("/updateColaborador", async (req, res) => {
  try {

    const { colaborador } = req.body;
    //console.log("📥 Body recebido:", req.body);

    if (!colaborador) {
      return res.status(400).json({
        error: true,
        message: "Objeto colaborador não enviado",
      });
    }

    //console.log("📦 Colaborador recebido:", colaborador);

    const email = colaborador.email

    if (!email) {
      return res.status(400).json({
        error: true,
        message: "Email do colaborador não informado",
      });
    }

    const atualizado = await Colaborador.findOneAndUpdate(
      { email }, // 🔍 filtro correto
      { $set: colaborador },
      { new: true }
    );

    //console.log("✅ Colaborador atualizado:", atualizado);

    return res.json({ error: false, data: atualizado });
  } catch (err) {
    //console.error("❌ Erro ao atualizar colaborador:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
});

// Rota para deletar o vinculo do colaborador com o loja
router.delete("/vinculo/:id", async (req, res) => {
  try {
    await LojaColaborador.findByIdAndUpdate(req.params.id, { status: "E" });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

// Rota para retornar todos os colaboradores cadastrados
router.post("/filter", async (req, res) => {
  try {
    // Buscar colaboradores conforme filtros
    const colaboradores = await Colaborador.find(req.body.filters).select("-senha");

    if (!colaboradores.length) {
      return res.json({ error: false, colaboradores: [] });
    }

    const colaboradorIds = colaboradores.map(c => c._id);

    //console.log("colaboradorIds: ", colaboradorIds)

    // Buscar vínculos com lojas
    const vinculos = await LojaColaborador.find({
      colaboradorId: { $in: colaboradorIds },
    })
      .populate("lojaId") // traz dados da loja
      .populate("colaboradorId"); // traz colaborador sem senha

    // 3️⃣ Inicializa TODOS os colaboradores
    const colaboradoresMap = {};

    for (const colab of colaboradores) {
      colaboradoresMap[colab._id.toString()] = {
        _id: colab._id,
        nome: colab.nome,
        sobrenome: colab.sobrenome,
        email: colab.email,
        funcao: colab.funcao,
        status: colab.status,
        first: colab.first,
        telefone: colab.telefone,
        empresas: [],
      };
    }

    // Preenche empresas apenas para quem tem vínculo
    for (const vinculo of vinculos) {
      const colaborador = vinculo.colaboradorId;
      if (!colaborador) continue;

      const colaboradorId = colaborador._id.toString();

      colaboradoresMap[colaboradorId].empresas.push({
        vinculoId: vinculo._id,
        status: vinculo.status,
        loja: {
          _id: vinculo.lojaId._id,
          nome: vinculo.lojaId.nome,
          email: vinculo.lojaId.email,
          status: vinculo.lojaId.status
        },
      });
    }

    res.json({
      error: false,
      colaboradores: Object.values(colaboradoresMap),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: err.message });
  }
});

// Rota para retornar todos os colaboradores de uma loja com suas metas
router.get("/loja/:lojaId", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  try {
    const { lojaId } = req.params;

    if (!lojaId) {
      return res.status(400).json({
        error: true,
        message: "lojaId é obrigatório",
      });
    }

    // Busca vínculos da loja
    const lojaColaboradores = await LojaColaborador.find({
      lojaId,
      status: { $ne: "E" },
    })
      .populate({
        path: "colaboradorId",
        select: "-senha -dataCadastro -dataNascimento -foto -sexo -identificacao -endereco -enderecoPadrao -__v",
      })
      .lean();

    const colaboradorIds = lojaColaboradores
      .map(v => v.colaboradorId?._id)
      .filter(Boolean);

    // Busca TODAS as metas dos colaboradores de uma vez
    const metasColaboradores = await ColaboradorMeta.find({
      colaboradorId: { $in: colaboradorIds },
    })
      .populate({
        path: "metaId",
        select: "meta faturamento ano mes status",
      })
      .lean();

    // Agrupa metas por colaboradorId
    const metasPorColaborador = metasColaboradores.reduce((acc, item) => {
      const id = item.colaboradorId.toString();
      if (!acc[id]) acc[id] = [];
      acc[id].push(item);
      return acc;
    }, {});

    // Monta resposta final
    const colaboradores = lojaColaboradores.map(vinculo => {
      const colaborador = vinculo.colaboradorId;
      const metas = metasPorColaborador[colaborador._id.toString()] || [];
    
      return {
        ...colaborador,
        vinculoId: vinculo._id,
        vinculo: vinculo.status,
        metas: metas.map(m => ({
          meta: m.metaId,               // dados da meta
        })),
      };
    });   

    return res.status(200).json({
      error: false,
      colaboradores,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message || "Erro interno",
    });
  }
});

// Rota para checar colaborador e retornar colaborador + lojaId
router.get("/check/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // 1️Busca colaborador
    const colaborador = await Colaborador.findOne({ email }).lean();

    if (!colaborador) {
      return res.status(404).json({
        error: true,
        message: "Colaborador não encontrado",
      });
    }

    //  Busca vínculo loja x colaborador
    const lojaColaborador = await LojaColaborador.findOne(
      { colaboradorId: colaborador._id },
      { lojaId: 1, _id: 0 },
    );

    if (lojaColaborador) {
      // Injeta lojaId dentro do colaborador
      colaborador.lojaId = lojaColaborador?.lojaId ?? null;
    }

    const ativoColaborador = await LojaColaborador.findOne(
      {
        colaboradorId: colaborador._id,
        status: { $in: ["E", "I", "P"] }
      },
      { lojaId: 1, _id: 0 }
    );

    if (ativoColaborador) {
      return res.json({
        error: true,
        message: "Colaborador inativo, contate o administrador do sistema."
      });
    }

    // Retorna colaborador completo
    return res.json({
      error: false,
      colaborador,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});

// Rota para encontrar todas as metas de um determinado colaborador
router.get("/metas/:colaboradorId", async (req, res) => {
  try {
    const { colaboradorId } = req.params;

    // 1️⃣ Busca todos os vínculos da loja
    const vinculos = await ColaboradorMeta.find(
      { colaboradorId })
      .populate("metaId");

    // 2️⃣ Extrai os metaId
    const metaIds = vinculos.map(v => v.metaId);

    // 3️⃣ Busca todas as metas relacionadas
    const metas = await Meta.find({
      _id: { $in: metaIds }
    });

    res.json({ error: false, metas });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;
