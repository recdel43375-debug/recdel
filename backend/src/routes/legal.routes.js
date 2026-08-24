const fs = require('fs');
const path = require('path');
const express = require('express');
const { marked } = require('marked');

const router = express.Router();

const LEGAL_DIR = path.join(__dirname, '..', 'data', 'legal');
const BRAND_GREEN = '#0B7A3B';

function readLegalFile(fileName) {
  const filePath = path.join(LEGAL_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const stat = fs.statSync(filePath);
  return { content, updatedAt: stat.mtime.toISOString() };
}

function renderHtmlPage(title, markdown, updatedAt) {
  const bodyHtml = marked.parse(markdown);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — Reshow</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background: #F5F6F7;
    color: #1A1A1A;
    font-family: -apple-system, Roboto, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
  }
  header {
    background: ${BRAND_GREEN};
    color: #fff;
    padding: 24px 20px;
  }
  header h1 {
    margin: 0;
    font-size: 22px;
  }
  header p {
    margin: 4px 0 0;
    font-size: 13px;
    opacity: 0.85;
  }
  main {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    padding: 24px 28px 48px;
    min-height: 100vh;
    box-sizing: border-box;
  }
  h2 {
    font-size: 18px;
    margin-top: 32px;
  }
  p, li {
    font-size: 15px;
    color: #333;
  }
  a { color: ${BRAND_GREEN}; }
</style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>Reshow · Last updated ${new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </header>
  <main>
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function serveHtmlPage(title, fileName) {
  return (req, res) => {
    const { content, updatedAt } = readLegalFile(fileName);
    res.type('html').send(renderHtmlPage(title, content, updatedAt));
  };
}

function serveJson(fileName) {
  return (req, res) => {
    const { content, updatedAt } = readLegalFile(fileName);
    res.json({ format: 'markdown', updatedAt, content });
  };
}

// GET /legal/privacy-policy — human-readable page (Play Store listing URL, browser visitors)
router.get('/privacy-policy', serveHtmlPage('Privacy Policy', 'privacy-policy.md'));

// GET /legal/terms — human-readable page
router.get('/terms', serveHtmlPage('Terms and Conditions', 'terms.md'));

// GET /legal/privacy-policy.json — raw markdown JSON, consumed by the mobile app's in-app legal screens
router.get('/privacy-policy.json', serveJson('privacy-policy.md'));

// GET /legal/terms.json — raw markdown JSON, consumed by the mobile app's in-app legal screens
router.get('/terms.json', serveJson('terms.md'));

module.exports = router;
