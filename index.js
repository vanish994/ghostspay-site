const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const GHOSTSPAY_TOKEN = process.env.GHOSTSPAY_TOKEN || "SEU_TOKEN_AQUI";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.post("/api/purchase", async (req, res) => {
  try {
    const payload = {
      amount: req.body.amount,
      currency: "BRL",
      description: req.body.description,
      customer: req.body.customer,
      callback_url: "https://SEUSITE.onrender.com/webhook"
    };

    const response = await axios.post(
      "https://app.ghostspaysv1.com/api/v1/transaction.purchase",
      payload,
      {
        headers: {
          Authorization: `Bearer ${GHOSTSPAY_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar a compra" });
  }
});

app.get("/api/balance", async (req, res) => {
  try {
    const response = await axios.get(
      "https://app.ghostspaysv1.com/api/v1/withdraw.getBalance",
      {
        headers: {
          Authorization: `Bearer ${GHOSTSPAY_TOKEN}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao consultar saldo" });
  }
});

app.post("/api/withdraw", async (req, res) => {
  try {
    const payload = {
      amount: req.body.amount,
      receiver_id: req.body.receiver_id,
      type: "PIX"
    };

    const response = await axios.post(
      "https://app.ghostspaysv1.com/api/v1/withdraw.requestWithdraw",
      payload,
      {
        headers: {
          Authorization: `Bearer ${GHOSTSPAY_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao solicitar saque" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
