const mysql = require('mysql');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST_IP,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function asyncQuery(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve({ results, fields });
      }
    });
  });
}

/**
 * Converts date from API to MySQL format.
 * '2022-10-24T13:23:18.000Z' -> '2022-10-24 13:23:18'
 *
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  return isoString.slice(0, 10) + ' ' + isoString.slice(11, 19);
}

/**
 * Converts any value to mysql-ish boolean ints.
 *
 * @param {any} value
 * @returns {number}
 */
function formatBoolean(value) {
  return Boolean(value) ? 1 : 0;
}

module.exports = {
  pool,
  asyncQuery,
  formatDate,
  formatBoolean,
};
