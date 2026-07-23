const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

const LEGAL_DIR = path.join(__dirname, '..', 'data', 'legal');

function serveLegalText(fileName) {
  return (req, res) => {
    const filePath = path.join(LEGAL_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    const stat = fs.statSync(filePath);
    res.json({
      format: 'markdown',
      updatedAt: stat.mtime.toISOString(),
      content,
    });
  };
}

// GET /legal/privacy-policy
router.get('/privacy-policy', serveLegalText('privacy-policy.md'));

// GET /legal/terms
router.get('/terms', serveLegalText('terms.md'));

module.exports = router;
