const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

const stockFile = path.join(__dirname, 'stock.json');

// Helper to read stock
const readStock = () => {
  try {
    const data = fs.readFileSync(stockFile, 'utf-8');
    console.log("Stock read successfully");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading stock:", err);
    return { fish: [], invertebrates: [], corals: [] };
  }
};

// Helper to write stock
const writeStock = (data) => {
  fs.writeFileSync(stockFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log("Stock written successfully");
};

// ---------------- Routes ----------------

// GET /stock
app.get('/stock', (req, res) => {
  console.log("GET /stock called");
  const stock = readStock();
  res.json(stock);
});

// POST /stock (overwrite entire stock)
app.post('/stock', (req, res) => {
  console.log("POST /stock called");
  const newStock = req.body;
  writeStock(newStock);
  res.json({ message: 'Stock updated!' });
});

// PUT /stock/:name (update single item, including type changes and deletion)
app.put('/stock/:name', (req, res) => {
  const { name } = req.params;
  const { newName, newType, quantity } = req.body;

  const stock = readStock();

  // Find and remove item from any category
  let foundItem = null;
  for (const type of ['fish', 'invertebrates', 'corals']) {
    const index = stock[type].findIndex(item => item.name === name);
    if (index !== -1) {
      foundItem = stock[type][index];
      stock[type].splice(index, 1);
      break;
    }
  }

  if (!foundItem) return res.status(404).json({ error: 'Item not found' });

  // Only add back if quantity > 0
  if (quantity > 0) {
    stock[newType].push({
      name: newName || foundItem.name,
      quantity
    });
  }

  writeStock(stock);
  res.json(stock);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

