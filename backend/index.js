// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

const stockFile = path.join(__dirname, 'stock.json');

// ---------------- GitHub Setup ----------------
const GITHUB_USERNAME = 'Skarp89';
const GITHUB_REPO = 'aquarium-stock';
const GITHUB_BRANCH = 'main';
const GITHUB_TOKEN = process.env.GITHUBSYNC_TOKEN;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// ---------------- Helpers ----------------

// Read stock JSON safely
const readStock = () => {
  try {
    if (!fs.existsSync(stockFile)) {
      console.log("stock.json not found, initializing empty stock");
      return { fish: [], invertebrates: [], corals: [] };
    }
    const data = fs.readFileSync(stockFile, 'utf-8');
    console.log("Stock read successfully");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading stock:", err);
    return { fish: [], invertebrates: [], corals: [] };
  }
};

// Write stock JSON safely
const writeStock = (data) => {
  try {
    fs.writeFileSync(stockFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log("Stock written successfully");
  } catch (err) {
    console.error("Error writing stock:", err);
  }
};

// Push stock.json to GitHub
const pushToGitHub = async () => {
  try {
    const content = fs.readFileSync(stockFile, 'utf-8');
    const base64Content = Buffer.from(content).toString('base64');

    // Get SHA of the current file if exists
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_USERNAME,
        repo: GITHUB_REPO,
        path: 'stock.json',
        ref: GITHUB_BRANCH,
      });
      sha = data.sha;
    } catch (err) {
      // File may not exist yet, that's okay
      sha = undefined;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path: 'stock.json',
      message: 'Update stock.json from Render backend',
      content: base64Content,
      branch: GITHUB_BRANCH,
      sha,
    });

    console.log('stock.json pushed to GitHub successfully');
  } catch (err) {
    console.error('Error pushing to GitHub:', err);
  }
};

// ---------------- Routes ----------------

// GET /stock
app.get('/stock', (req, res) => {
  const stock = readStock();
  res.json(stock);
});

// POST /stock (overwrite entire stock)
app.post('/stock', async (req, res) => {
  const newStock = req.body;
  writeStock(newStock);
  await pushToGitHub();
  res.json({ message: 'Stock updated and pushed to GitHub!' });
});

// PUT /stock/:name (update single item, including type changes and deletion)
app.put('/stock/:name', async (req, res) => {
  const { name } = req.params;
  const { newName, newType, quantity } = req.body;

  const stock = readStock();

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

  if (quantity > 0) {
    stock[newType].push({
      name: newName || foundItem.name,
      quantity,
    });
  }

  writeStock(stock);
  await pushToGitHub();
  res.json(stock);
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
