const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
// const cors = require('cors');
// const path = require('path');
// const nodeMailer = require('nodemailer');
require('dotenv').config();
const bodyParser = require('body-parser');

const { router: usersRouter } = require('../users');
const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('../config');
const { User, BetEvent, Submission } = require('../models');

const jsonParser = bodyParser.json();
const app = express();

// const { CLIENT_ORIGIN } = require('../config');

// app.use(
//   cors({
//     origin: CLIENT_ORIGIN
//   })
// );

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(morgan('common'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users', usersRouter);
app.use('/auth/', authRouter);

// const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/', (req, res) => {
  res.json({ ok: true });
});

// GET endpoint for all bet events of one user
app.get('/betevents/:user', (req, res) => {
  const userId = req.params.user;
  BetEvent.find({ createdBy: userId })
    .exec()
    .then((betEvents) => {
      res.json({ betEvents });
    })
    .catch((err) => {
      res.status(500).json({ message: `Internal server error: ${err}` });
    });
});

// GET event by id
app.get('/betevent/:id', (req, res) => {
  BetEvent.findById(req.params.id)
    .then((bet) => res.status(200).json(bet))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

const findEventByName = async (eventIds, name) => {
  for (const eventId of eventIds) {
    const foundEvent = await BetEvent.findById(eventId);
    if (foundEvent.name === name) {
      return foundEvent;
    }
  }
};

// GET event by username and eventName
app.get('/eventname/:encoded', async (req, res) => {
  const { encoded } = req.params;
  const decoded = Buffer.from(encoded, 'base64').toString();
  const names = decoded.split(':');
  const username = names[0];
  const eventname = names[1];
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404).end();
  }
  const event = await findEventByName(user.betEvents, eventname);
  if (event) {
    res.status(200).json(event);
  } else {
    res.status(404).end();
  }
});

// Post endpoint for new betEvent
app.post('/betevent', jsonParser, async (req, res) => {
  const requiredFields = ['name'];
  // check for required fields
  for (let i = 0; i < requiredFields.length; i += 1) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      return res.status(400).send(message);
    }
  }
  // check to see if that user has betevent with that name
  const user = await User.findById(req.body.createdBy);
  if (user.betEvents) {
    const names = await Promise.all(
      user.betEvents.map(async (id) => {
        const event = await BetEvent.findById(id);
        return event.name;
      })
    );
    const dupeFound = names.find((name) => name === req.body.name);
    if (dupeFound) {
      res.status(400).json({
        message:
          'You already have a Bet Event by this name. Please use a unique name for this Bet Event'
      });
    }
  }

  BetEvent.create({
    name: req.body.name,
    // password: req.body.password,
    questions: req.body.questions,
    createdBy: req.body.createdBy
  })
    .then(async (bet) => {
      // persist eventId to user
      await User.findOneAndUpdate(
        { _id: req.body.createdBy },
        { betEvents: [...user.betEvents, bet._id] },
        { new: true }
      );
      res.status(201).json(bet);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: err });
    });
});

// PUT endpoint for editing BetEvents
app.put('/betevent/:id', jsonParser, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message });
  }
  const toUpdate = {};
  const updateableFields = ['name', 'questions', 'confirmed'];
  updateableFields.forEach((field) => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  BetEvent.findOneAndUpdate({ _id: req.params.id }, toUpdate, { new: true })
    .then((betevent) => {
      res.status(201).json(betevent);
    })
    .catch((err) =>
      res.status(500).json({ message: `Internal server error: ${err}` })
    );
});

// GET endpoint for submission by id
app.get('/submission/:id', (req, res) => {
  Submission.findById(req.params.id)
    .then((submission) => res.status(200).json(submission))
    .catch((err) => {
      res.status(500).json({ message: `Internal server error: ${err}` });
    });
});

// Post enpoint for new submission
app.post('/submission', jsonParser, (req, res) => {
  const requiredFields = ['bettor'];
  for (let i = 0; i < requiredFields.length; i += 1) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Submission.create({
    bettor: req.body.bettor
  })
    .then((bet) => {
      res.status(201).json(bet);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Server setup
let server;
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, (err) => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', (err) => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}
if (require.main === module) {
  runServer(DATABASE_URL).catch((err) => console.error(err));
}

module.exports = { app, runServer, closeServer };
