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

// Helpers
const getBalance = (customerStatement) => {
  return customerStatement.reduce((balance, operation) => {
    if (operation.type === "CREDIT") {
      return (balance += operation.amount);
    } else {
      return (balance -= operation.amount);
    }
  }, 0);
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
  const { date } = req.params;
  if (date) {
    const formattedDate = new Date(date + "00:00");
    const filteredStatement = customer.statement.filter(
      (operation) =>
        operation.date.toDateString() === new Date(formattedDate).toDateString()
    );

    return res.json(filteredStatement);
  } else {
    return res.json(customer.statement);
  }
});

app.post("/deposits", verifyIfCustomerExists, (req, res) => {
  const { amount, description } = req.body;
  const { customer } = req;

  const operation = {
    amount,
    description,
    date: new Date(),
    type: "CREDIT",
  };

  customer.statement.push(operation);

  return res.send();
});

app.post("/withdraws", verifyIfCustomerExists, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const customerBalance = getBalance(customer.statement);
  if (customerBalance < amount) {
    return res.status(400).json({ message: "Insufficient funds." });
  }

  const operation = {
    amount,
    date: new Date(),
    type: "DEBIT",
  };

  customer.statement.push(operation);

  return res.send();
});
