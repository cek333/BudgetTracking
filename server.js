// Requiring necessary npm packages
require('dotenv').config();
const app = require('./app/app.js');

// Setting up port and requiring models for syncing
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
