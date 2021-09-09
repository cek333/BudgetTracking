// Requiring necessary npm packages
const express = require('express');
const db = require('../models');
const store = require('../store/store');
const { refreshStore } = require('../store/slices/enterSlice');

// Creating express app and configuring middleware needed for authentication
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content from the "public" directory
app.use(express.static('public'));

// Setup Handlebars.
const exphbs = require('express-handlebars');
const helpers = require('../views/helpers');
const hbs = exphbs.create({
  defaultLayout: false,
  helpers
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Import routes and give the server access to them.
const enterRoutes = require('../routes/enterRoutes.js');
const editRoutes = require('../routes/editRoutes.js');
const resetEnterMessages = require('../routes/resetEnterMessages.js');
const reportRoutes = require('../routes/reportRoutes.js');
app.post('/enter/*', resetEnterMessages);
app.use('/edit', resetEnterMessages, editRoutes);
app.use('/enter', enterRoutes);
app.use('/report', resetEnterMessages, reportRoutes);

// Connect to database
db.sequelize.sync();

// Populate store
store.dispatch(refreshStore());

// If no API routes are hit, redirect to /enter
app.use(function (req, res) {
  res.redirect('/enter');
});

module.exports = app;
