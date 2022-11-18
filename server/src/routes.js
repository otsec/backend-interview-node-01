const express = require('express');
const axios = require('axios');
const config = require('./config');
const mysql = require('./mysql');
const { isValidEmail } = require('./lib/validators')

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

router.post('/email-verification', async (req, res) => {
  try {
    const inputEmail = req.body.email;
    if (!isValidEmail(inputEmail)) {
      throw new Error('Invalid email.');
    }

    // TODO: check if email already exists.

    const apiRes = await axios.post(
      config.prospect.baseUrl + '/api/v1/email-verifier',
      {email: [req.body.email]},
      {headers: {'Authorization': 'Bearer ' + config.prospect.apiKey}},
    );
    const apiEmailInfo = apiRes.data['result'][0];

    // TODO: Catch API error: apiRes.data['result'][0]['error'].

    const newEmail = {
      email: req.body.email,
      last_verified_at: mysql.formatDate(apiEmailInfo['verifiedAt']),
    }
    const query1 = await mysql.asyncQuery('INSERT INTO email SET ?', [newEmail]);

    const verification = {
      email_id: query1.results.insertId,
      result: apiEmailInfo['result'],
      is_private: apiEmailInfo['isPrivate'],
      is_catchall: apiEmailInfo['catchall'],
      is_disposable: apiEmailInfo['disposable'],
      is_freemail: apiEmailInfo['freemail'],
      is_rolebased: apiEmailInfo['rolebased'],
      is_dns_valid: apiEmailInfo['dnsValidMx'], // TODO: not exists in response
      is_dns_valid_mx: apiEmailInfo['dnsValidMx'],
      is_smtp_valid: apiEmailInfo['smtpValid'],
    }
    await mysql.asyncQuery('INSERT INTO email_verification SET ?', [verification]);

    return res.send(apiRes.data['result']);
  } catch (e) {
    return res.status(400).send({
      message: e.message,
    });
  }
});

module.exports = router;
