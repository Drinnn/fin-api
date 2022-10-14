import express from "express";
import { v4 as uuidV4 } from "uuid";

const app = express();
app.use(express.json());

const accounts = [];

app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = accounts.some((account) => account.cpf === cpf);
  if (customerAlreadyExists) {
    res.status(400).json({ error: "Customer already exists." });
  }

  accounts.push({ id: uuidV4(), cpf, name, statement: [] });

  res.status(201).send();
});

app.get("/statements", (req, res) => {
  const { cpf } = req.headers;

  const customer = accounts.find((account) => account.cpf === cpf);
  if (!customer) {
    return res.status(400).json({ message: "Customer not found." });
  }

  return res.json(customer.statement);
});

app.listen(3333);
