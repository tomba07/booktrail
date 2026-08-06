const cds = require('@sap/cds');
const path = require('path');

cds.on('bootstrap', async (app) => {
  app.use('/booktrail', require('express').static(path.join(__dirname, 'app/booktrail/webapp')));
  app.get('/', (req, res) => res.redirect('/booktrail/index.html'));
});

if (require.main === module) {
  cds.server();
} else {
  module.exports = cds.server;
}
