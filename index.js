import express from "express";
import { v4 as uuidV4 } from "uuid";

const app = express();
app.use(express.json());

const accounts = [];

app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;

  const id = uuidV4();

  accounts.push({ id, cpf, name, statement: [] });

  res.status(201).send();
});

app.listen(3333);
