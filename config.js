"use strict";

exports.DATABASE_URL =
	process.env.DATABASE_URL || "mongodb://asiede:patssuck1@ds117545.mlab.com:17545/superbets";

exports.TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL || 
	"mongodb://asiede:SashaB00ne@ds035177.mlab.com:35177/test-ourtinerary-app";


exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';