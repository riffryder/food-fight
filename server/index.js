require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const passport = require('passport');
const auth = require('../lib/auth');
const session = require('express-session');
const morgan = require('morgan');

const Mailjet = require('node-mailjet').connect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET,
);

const db = require('../database-postgresql/models');
const helpers = require('../db-controllers');

// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
// var items = require('../database-mysql');
// var items = require('../database-mongo');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/../react-client/dist`));
app.use(morgan('dev'));


//
// ─── AUTHENTICAITON MIDDLEWARE ──────────────────────────────────────────────────
//
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { },
}));
app.use(passport.initialize());
app.use(passport.session());
auth.passportHelper(passport);


//
// ─── SERVE EMAILS ───────────────────────────────────────────────────────────────
//
app.post('/api/email', (req, res) => {
  console.log('Received request to send email to', req.body.email);
  const { email, id } = req.body;
  const emailData = {
    FromEmail: 'foodfightHR@gmail.com',
    FromName: 'Food Fight',
    Subject: 'You\'ve been invited to a Food Fight!',
    'Text-part': `You've been invited to a new Food Fight. Visit ${process.env.DOMAIN || 'http://localhost:3000/'}rooms/${id} to begin.`,
    Recipients: [{ Email: email }],
  };
  Mailjet.post('send')
    .request(emailData)
    .then(() => {
      res.end('Email sent!');
    })
    .catch((err) => {
      console.log('Error in interacting with the MailJet API', err);
      res.status(404).end();
    });
});

<<<<<<< HEAD

//
// ─── API LOGIC ──────────────────────────────────────────────────────────────────
//
=======
// TO DO: Store this info in the database
>>>>>>> c1c67ecbceb9eb711ceb1169ac541dca5704f71c
app.post('/api/save', (req, res) => {
  const { id, members } = req.body;
  helpers.saveRoom(id, (err, room) => {
    if (err) {
      console.log('Error saving room', err);
    } else {
      console.log('Success', room);
      helpers.saveMembers(members, (error, result) => {
        if (error) {
          console.log('Error saving room members to database', error);
        } else {
          console.log('Members saved!', result);
        }
      });
      res.end(`Room ${id} saved`, room);
    }
  });
});

app.post('/api/search', (req, res) => {
  console.log('Received request for Yelp search of', req.body);
  const { zip } = req.body;
  // TO DO: Store the zip code in the database (may be incorporated into /api/save request
  // depending on how the front end is structured)
  const options = {
    method: 'GET',
    uri: 'https://api.yelp.com/v3/businesses/search',
    headers: {
      Authorization: process.env.YELP_API_KEY,
    },
    qs: {
      location: zip,
    },
  };
  request(options, (err, data) => {
    if (err) {
      console.log('Error in interacting with the Yelp API', err);
      res.status(404).end();
    }
    res.send(JSON.parse(data.body));
  });
});
// ────────────────────────────────────────────────────────────────────────────────


// Sets up default case so that any URL not handled by the Express Router
// will be handled by the React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../react-client/dist/index.html`));
});

// create the tables based on the models and once done, listen on the given port
db.models.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port', process.env.PORT || 3000);
  });
});
