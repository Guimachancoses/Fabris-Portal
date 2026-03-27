// Estrutura padrão de rota
const express = require("express");
const router = express.Router();
const Meta = require("../models/meta");
const LojaMeta = require("../models/relationship/lojaMeta")

// Rota para criar meta
router.post("/", async (req, res) => {
  try {
    const meta = await new Meta(req.body).save();
    res.json({ meta });
  } catch (err) {
    req.json({ error: true, message: err.message });
  }
});

// Rota para atualizar os metas
router.put("/:metaId", async (req, res) => {
  try {
    const { metaId } = req.params;
    const meta = req.body;

    await Meta.findByIdAndUpdate(metaId, meta);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

// Rota para deletar uma meta
router.delete("/:metaId", async (req, res) => {
  try {
    const { metaId } = req.params;

    await Meta.findByIdAndDelete(metaId);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
