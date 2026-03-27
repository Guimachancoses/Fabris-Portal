const express = require("express")
const mongoose = require("mongoose");
const Colaborador = require("../../../models/colaborador");
const { clerkClient } = require("@clerk/express")

const router = express.Router()

/**
 * Deletar usuário no Clerk
 */
router.post("/deleteUser", async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: "userId é obrigatório",
      })
    }

    await clerkClient.users.deleteUser(userId)

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("Erro ao deletar usuário Clerk:", err)

    return res.status(500).json({
      error: true,
      message: err.message || "Erro ao deletar usuário no Clerk",
    })
  }
})

/**
 * Deletar usuário no Clerk com email
 */
router.post("/deleteUserEmail", async (req, res) => {
  // console.log("📥 /deleteUserEmail chamado");
  // console.log("📦 Body recebido:", req.body);

  try {
    const { email, recipientId } = req.body;

    if (!email) {
      // console.warn("⚠️ Email não informado");
      return res.status(400).json({
        error: true,
        message: "email é obrigatório",
      });
    }

    // ==========================
    // 🔹 SEM recipientId → deleta usuário
    // ==========================
    if (!recipientId) {
      // console.log("🔍 Buscando usuário no Clerk pelo email:", email);

      const { data } = await clerkClient.users.getUserList({
        emailAddress: [email], // ⚠️ TEM QUE SER ARRAY
      });

      // console.log("📄 Resultado Clerk getUserList:", data);

      if (!data || !data.length) {
        // console.warn("⚠️ Usuário não encontrado no Clerk");
        return res.status(404).json({
          error: true,
          message: "Usuário não encontrado no Clerk",
        });
      }

      const userId = data[0].id;
      // console.log("🧾 userId encontrado:", userId);

      await clerkClient.users.deleteUser(userId);

      // console.log("✅ Usuário deletado com sucesso no Clerk");

      return res.status(200).json({ success: true });
    }

    // ==========================
    // 🔹 COM recipientId → revoga convite
    // ==========================
    // console.log("📨 Revogando convite Clerk:", recipientId);

    await clerkClient.invitations.revokeInvitation(recipientId);

    // console.log("✅ Convite revogado com sucesso");

    return res.status(200).json({
      success: true,
      message: "Invitation revoked",
    });

  } catch (err) {
    // console.error("❌ Erro ao deletar usuário Clerk");
    // console.error("👉 Mensagem:", err.message);
    // console.error("👉 Stack:", err.stack);
    // console.error("👉 Erro completo:", err);

    return res.status(500).json({
      error: true,
      message: err.message || "Erro ao deletar usuário no Clerk",
    });
  }
});

/**
 * Criar usuário via convite (email + password)
 */
router.post("/createUser", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "email e password são obrigatórios",
      });
    }

    session.startTransaction();

    // 1️⃣ Cria convite no Clerk
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      password,
      redirectUrl: "http://localhost:3000/login",
      notify: true,
      ignore_existing: false,
      expires_in_days: null,
      template_slug: "invitation",
    });

    // 2️⃣ Atualiza colaborador no banco
    await Colaborador.findOneAndUpdate(
      { email },
      {
        recipientId: invitation.id,
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 3️⃣ Resposta
    return res.status(201).json({
      success: true,
      invitationId: invitation.id,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Erro ao criar convite Clerk:", err);

    return res.status(500).json({
      error: true,
      message: err.message || "Erro ao criar usuário no Clerk",
    });
  }
});


module.exports = router
