const express = require('express');
const router = express.Router();

// TODO add translateClient to Request
const Translate = require('@google-cloud/translate');

const projectId = process.env.GOOGLE_PROJECT_ID;
const translateClient = Translate({
  projectId: projectId
});


// stock price by symbol
router.post('/:frm/:to', (req, res) => {
  const frm = req.params.frm,
  	to = req.params.to,
  	text = req.body;

  res.send({
  	result: {}
  });
});