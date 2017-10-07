const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

const API_KEY = process.env.GOOGLE_API_KEY;
const BASE_API_URL = 'https://translation.googleapis.com/language/translate/v2';


const _makeTranslateRequest = (q, to = 'es', frm = 'en') => {
  const url = `${BASE_API_URL}?q=${q}&target=${to}&source=${frm}&key=${API_KEY}`;

  console.log('makeTranslateRequest', url);
  return fetch(url, { method: 'GET' })
    .then(response => response.json())
    .then(json => (
      ('error' in json) 
        ? json.error 
        : (json.data.translations || [{translatedText: null}])[0]
    ))
}

// only for testing
router.get('/:frm/:to', async (req, res) => {
  const frm = req.params.frm,
    to = req.params.to,
    text = req.query.text || null;

  if (text && /^[\w\s\-\'\?\.\,]{2,256}$/.test(text)) {
    const result = await _makeTranslateRequest(text, to, frm);
    res.send({
      result: result,
      success: result.errors === undefined });
  } else {
    res.send({
      result: { message: 'Invalid string provided' },
      success: false });
  }
});

// WS
router.ws('/', (ws, req) => {

  ws.on('message', async (msg) => {
    console.log(msg);
    const data = JSON.parse(msg || '{}');
    if (data.text && /^[\w\s\-\'\?\.\,]{2,256}$/.test(data.text)) {
      const result = await _makeTranslateRequest(data.text, data.to, data.frm);
      ws.send(JSON.stringify({
        result: result,
        success: result.errors === undefined }));
    }
  });

});


module.exports = router;
