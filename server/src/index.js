const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const router = require('./routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(router);

app.listen(8000, '0.0.0.0', () => {
  console.log(`App server now listening on port 8000`);
});


