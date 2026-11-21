// api/index.js
// Vercel Serverless Function entrypoint for Phúc An Retail Copilot
const handleRequest = require('../server.js');

module.exports = (req, res) => {
  handleRequest(req, res);
};
