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

router.post('/email-verification', async (req, res, next) => {
  try {
    let inputEmails = req.body.email;
    if (!Array.isArray(req.body.email)) {
      inputEmails = [req.body.email];
    }

    if (inputEmails.length > 50) {
      throw new Error(`Maximum 50 emails allowed. Got ${inputEmails.length}.`);
    }

    const errorEmails = [];
    for (const email of inputEmails) {
      if (!isValidEmail(email)) {
        errorEmails.push(email)
      }
    }
    if (errorEmails.length) {
      const errorEmailsString = errorEmails.map(email => '"' + email + '"').join(', ');
      throw new Error(`Invalid emails: ${errorEmailsString}.`);
    }

    const existingEmailsSql = `
      SELECT email
      FROM email
      WHERE email in (?)`;
    const existingEmailsQuery = await mysql.asyncQuery(existingEmailsSql, [inputEmails]);
    const existingEmails = existingEmailsQuery.results
      .map(row => row.email);

    const emailsForValidation = inputEmails
      .filter(email => !existingEmails.includes(email));

    if (emailsForValidation.length) {
      const apiRes = await axios.post(
        config.prospect.baseUrl + '/api/v1/email-verifier',
        {email: emailsForValidation},
        {headers: {'Authorization': 'Bearer ' + config.prospect.apiKey}},
      );

      // TODO: Handle API error properly. HTTP error status codes raise errors with confusing message.
      // TODO: Handle errors in response body: apiRes.data['result'][0]['error'].

      // TODO: Insert new values into DB as batch.
      // const newRows = emailsForValidation.map(email => [email]);
      // const query1 = await mysql.asyncQuery('INSERT INTO email (email) VALUES ?', [newRows]);
      // console.log(query1);

      for (const apiResItem of apiRes.data['result']) {
        const newEmail = {
          email: apiResItem['email'],
          last_verified_at: mysql.formatDate(apiResItem['verifiedAt']),
        }
        console.log(newEmail);
        const newEmailQuery = await mysql.asyncQuery('INSERT INTO email SET ?', [newEmail]);

        const verification = {
          email_id: newEmailQuery.results.insertId,
          result: apiResItem['result'],
          is_private: apiResItem['isPrivate'],
          is_catchall: apiResItem['catchall'],
          is_disposable: apiResItem['disposable'],
          is_freemail: apiResItem['freemail'],
          is_rolebased: apiResItem['rolebased'],
          is_dns_valid: apiResItem['dnsValidMx'], // TODO: not exists in response
          is_dns_valid_mx: apiResItem['dnsValidMx'],
          is_smtp_valid: apiResItem['smtpValid'],
        }
        await mysql.asyncQuery('INSERT INTO email_verification SET ?', [verification]);
      }
    }

    const emailsSql = `
      SELECT 
          e.email,
          e.last_verified_at,
          ev.*
      FROM email e 
      LEFT JOIN email_verification ev ON ev.email_id = e.id
      WHERE e.email in (?)
      ORDER BY e.last_verified_at`;
    const emailsQuery = await mysql.asyncQuery(emailsSql, [inputEmails]);

    const result = emailsQuery.results.map(row => {
      return {
        email: row['email'],
        result: row['result'],
        is_private: row['is_private'],
        is_catchall: row['is_catchall'],
        is_disposable: row['is_disposable'],
        is_freemail: row['is_freemail'],
        is_rolebased: row['is_rolebased'],
        is_dns_valid: row['is_dns_valid'],
        is_dns_valid_mx: row['is_dns_valid_mx'],
        is_smtp_valid: row['is_smtp_valid'],
        created_at: row['created_at'],
        last_verified_at: row['last_verified_at'],
      };
    });

    return res.send(result);
  } catch (e) {
    next(e);

    // return res.status(400).send({
    //   message: e.message,
    // });
  }
});

module.exports = router;
