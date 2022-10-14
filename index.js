import express from "express";
import { v4 as uuidV4 } from "uuid";

const app = express();
app.use(express.json());
app.listen(3333);

// App
const customers = [];

// Middlewares
const verifyIfCustomerExists = (req, res, next) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return res.status(400).json({ message: "Customer not found." });
  }

  req.customer = customer;

  return next();
};

// Routes
app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );
  if (customerAlreadyExists) {
    res.status(400).json({ error: "Customer already exists." });
  }

  customers.push({ id: uuidV4(), cpf, name, statement: [] });

  res.status(201).send();
});

app.get("/statements", verifyIfCustomerExists, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});
