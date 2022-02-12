const express = require('express');
const bodyParser = require('body-parser');
const {
  SubmissionController
} = require('../../controllers/Submission.controller');
const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/', jsonParser, SubmissionController.postSubmission);

module.exports = { router };
