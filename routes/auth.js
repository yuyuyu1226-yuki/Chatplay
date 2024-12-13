var express = require("express");
var db = require("../db");
var router = express.Router();

// ユーザー登録
router.post("/register", async (req, res) => {
  var { username, accountId, profile } = req.body;

  if (!username || !accountId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    var result = await db.query(
      "INSERT INTO users (username, account_id, profile) VALUES ($1, $2, $3) RETURNING *",
      [username, accountId, profile]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// ユーザーログイン
router.post("/login", async (req, res) => {
  var { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "Missing accountId" });
  }

  try {
    var result = await db.query(
      "SELECT * FROM users WHERE account_id = $1",
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

module.exports = router;
