'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');
const path = require('path')
const nodeMailer = require('nodemailer');
require('dotenv').config();
const bodyParser = require('body-parser');

// const { router: usersRouter } = require('../users');
// const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('../config');
const { User} = require('../models');

const jsonParser = bodyParser.json();
const app = express();


const {CLIENT_ORIGIN} = require('../config');
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(morgan('common'));

// passport.use(localStrategy);
// passport.use(jwtStrategy);

// app.use('/users', usersRouter);
// app.use('/auth/', authRouter);

// const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/', (req, res) => {
    res.json({ok: true});
});

//GET endpoint for trips by id
// app.get('/trips/:id', (req, res) => {
//   	Trip
// 	.findById(req.params.id)
// 	.populate('tripLeader')
// 	.populate('collaborators')
// 	.populate('itineraryItems')
// 	.populate({
// 	    path:'itineraryItems.votes', select: 'Vote'
// 	})
// 	.then(trip => res.status(200).json(trip.serialize()))
// 	.catch(err => {
// 	    console.error(err);
// 	    res.status(500).json({message: 'Internal server error'});
// 	});
// });

//POST endpoint for new trips
// app.post('/trips', jsonParser, (req, res) => {
//     // Check for required fields
//     const requiredFields = ['name', 'dates', 'location', 'tripLeader', 'collaborators'];
//     for (let i = 0; i < requiredFields.length; i++) {
//         const field = requiredFields[i];
//       	if (!(field in req.body)) {
//     		const message = `Missing \`${field}\` in request body`;
//     		console.error(message);
//     		return res.status(400).send(message);
//       	}
//     }
//     User
//     // GET user information to attach to trip document
//     .findOne({_id: `${req.body.tripLeader}`})
//     .then( user => { 
//         if (user) {
//     		const collaborators = req.body.collaborators
//     		collaborators.push(req.body.tripLeader)
//     		User
//     		.find({
//                 _id: {$in: collaborators}
//     		})
//     		.then(collaborators => {
// 	        	Trip
// 	        	.create({
// 	          		name: req.body.name,
// 	          		dates: req.body.dates,
// 	          		location: req.body.location,
// 	          		tripLeader: user,
// 	          		collaborators: collaborators,
// 	          		itineraryItems: []
//                 })
// 	        	.then(trip => {
// 	        	    collaborators.forEach(collaborator => {
//                         User
//     			        .findByIdAndUpdate(collaborator._id, { $push: {trips: trip}})
//                         .then(updatedUser => res.status(201).end())
//                         .catch(err => {
//                             console.error(err);
//                             res.status(500).json({ message: 'Internal server error' });
//                         })
//                     })
//         	    res.status(201).json(trip.serialize())
//         	    })
//         	    .catch(err => {
//         	        console.error(err);
//         	        res.status(500).json({ message: 'Internal server error' });
//         	    })
//             })
//   	        .catch(err => {
//   	        	console.error(err);
//   	        	res.status(500).json({ message: 'Internal server error' });
//   	        })	
//       	} else {
//           	const message = `User not found`;
//           	console.error(message);
//           	return res.status(500).send(message);
//         }    
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     })
// });


//Server setup
let server;
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl, { useNewUrlParser: true },
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                    .listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                    .on('error', err => {
                        mongoose.disconnect();
                        reject(err);
                    });
            }
        );
    });
}
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
};
module.exports = { app, runServer, closeServer}