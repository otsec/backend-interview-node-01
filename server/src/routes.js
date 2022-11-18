const express = require('express');
const axios = require('axios');
const config = require('./config');
const mysql = require('./mysql');

const router = express.Router();

router.get('/email-verifications', (req, res) => {
  mysql.query(
    `SELECT email_verification.*, email.email
        FROM email_verification 
        JOIN email ON email.id=email_verification.email_id
        ORDER BY email.last_verified_at`,
    (err, results) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(results);
      }
    });
});

router.post('/email-verification', (req, res) => {
  axios.post(
    config.prospect.baseUrl + '/api/v1/email-verifier',
    {email: [req.body.email]},
    {headers: {'Authorization': 'Bearer ' + config.prospect.apiKey}}
  )
    .then(function (response) {
      mysql.query('INSERT INTO email (email) VALUES (?)', [req.body.email], function (err, result) {
        mysql.query('INSERT INTO email_verification (email_id, result) VALUES (?, ?)', [result.insertId, 'success'], function (err, result) {
          return res.send(response);
        });
      });
    })
    .catch(function (error) {
      return res.send(error);
    });
});

module.exports = router;
