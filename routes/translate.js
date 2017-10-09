const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

const API_KEY = process.env.GOOGLE_API_KEY,
  BASE_API_URL = 'https://translation.googleapis.com/language/translate/v2',
  HEADER_REFERRER = process.env.HEADER_REFERRER || '';


const _makeTranslateRequest = (q, to = 'es', frm = 'en') => {
  const url = `${BASE_API_URL}?q=${q}&target=${to}&source=${frm}&key=${API_KEY}`,
    headers = {};

  return fetch(url, { method: 'GET', headers: headers })
    .then(response => response.json())
    .then(json => (
      ('error' in json) 
        ? json.error 
        : (json.data.translations || [{translatedText: null}])[0]
    ))
}

const _getFromCache = (key, req) => {
  return new Promise((resolve) => {
    req._redis.get(key, (err, reply) => {
      resolve(reply);
    })
  }).then((reply) => reply);
};

// only for testing
router.get('/:frm/:to', async (req, res) => {
  const frm = req.params.frm,
    to = req.params.to,
    text = req.query.text || '';

  if (/^[\w\s\-\'\?\.\,]{2,256}$/.test(text)) {

    let result = null;
    const key = `${frm}:${to}:${text.toLowerCase()}`;

    result = await _getFromCache(key, req);
    if (result === null) {
      result = await _makeTranslateRequest(text, to, frm);
      if (result.errors === undefined) {  // cache successful results
        req._redis.set(key, JSON.stringify(result));
      }
    } else {
      result = JSON.parse(result);
    }

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

    const data = JSON.parse(msg || '{}');
    if (/^[\w\s\-\'\?\.\,]{2,256}$/.test(data.text || '')) {

      let result = null;
      const key = `${data.frm}:${data.to}:${data.text.toLowerCase()}`;

      result = await _getFromCache(key, req);
      if (result === null) {
        result = await _makeTranslateRequest(data.text, data.to, data.frm);
        if (result.errors === undefined) {  // cache successful results
          req._redis.set(key, JSON.stringify(result));
        }
      } else {
        result = JSON.parse(result);
      }

      ws.send(JSON.stringify({
        result: result,
        success: result.errors === undefined }));
    }

  });

});


module.exports = router;
