const express = require('express');
const axios = require('axios');
const config = require('./config');
const mysql = require('./mysql');
const { isValidEmail, normalizeInt } = require('./lib/validators')

const router = express.Router();

router.get('/email-verifications', async (req, res, next) => {
  try {
    const defaultPerPage = 10;

    const params = {
      page: normalizeInt(req.query['page'], 1, 100),
      perPage: normalizeInt(req.query['per-page'] || defaultPerPage, 1, 50),
    };

    // TODO: Validate that page is too big?

    const offset = (params.page - 1) * params.perPage;

    const emailsSql = `
      SELECT
          e.email,
          e.last_verified_at,
          ev.*
      FROM email e
      LEFT JOIN email_verification ev ON ev.email_id = e.id
      ORDER BY e.last_verified_at
      LIMIT ?, ?`;
    const emailsQuery = await mysql.asyncQuery(emailsSql, [offset, params.perPage]);

    const emailsCountSql = `
      SELECT COUNT(*) totalCount
      FROM email
    `;
    const emailsCountQuery = await mysql.asyncQuery(emailsCountSql);

    const result = {
      items: emailsQuery.results.map(rawData => formatEmailResponse(rawData)),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: emailsCountQuery.results[0]['totalCount'],
      }
    }

    return res.send(result);
  } catch (e) {
    next(e);

    // TODO: Proper error response for PROD env.
    // return res.status(400).send({
    //   message: e.message,
    // });
  }
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
      .map(rawData => rawData.email);

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

    const result = {
      items: emailsQuery.results.map(rawData => formatEmailResponse(rawData)),
    };

    return res.send(result);
  } catch (e) {
    next(e);

    // TODO: Proper error response for PROD env.
    // return res.status(400).send({
    //   message: e.message,
    // });
  }
});

function formatEmailResponse(rawData) {
  return {
    email: rawData['email'],
    result: rawData['result'],
    is_private: rawData['is_private'],
    is_catchall: rawData['is_catchall'],
    is_disposable: rawData['is_disposable'],
    is_freemail: rawData['is_freemail'],
    is_rolebased: rawData['is_rolebased'],
    is_dns_valid: rawData['is_dns_valid'],
    is_dns_valid_mx: rawData['is_dns_valid_mx'],
    is_smtp_valid: rawData['is_smtp_valid'],
    created_at: rawData['created_at'],
    last_verified_at: rawData['last_verified_at'],
  };
}

module.exports = router;
