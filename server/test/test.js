'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

describe('GET endpoint', function() {
    it('should return 200', function() {
        let res;
        return chai.request(app)
        .get('/')
        .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
        });
    });
});
