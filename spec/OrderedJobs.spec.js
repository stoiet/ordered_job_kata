var expect = require("chai").expect;
var OrderedJobs = require("../OrderedJobs.js");

describe("OrderedJob", function () {

    describe("#generate", function () {

        var orderedJobs;

        beforeEach(function () {
            orderedJobs = new OrderedJobs();
        });

        it("should return empty sequence with empty string given", function () {
            expect(orderedJobs.generate("")).to.eql(""); 
        });

        it("should return a sequence of one job with single job given", function () {
            expect(orderedJobs.generate("a =>")).to.include("a"); 
        });

        it("should return a sequence of jobs with multiple jobs given", function () {

            var argument = "a =>\nb =>\nc =>";
            var expectValues = ["a", "b", "c"];

            expectValues.forEach(function (expectValue) {
               expect(orderedJobs.generate(argument)).to.include(expectValue); 
            });

            expect(orderedJobs.generate(argument)).to.have.length(expectValues.length);
        });

        it("should return a sequence of jobs with multiple jobs given and single dependency", function () {

            var argument = "a =>\nb => c\nc =>";
            var expectValues = ["a", "b", "c"];
            var expectPattern = /a*ca*ba*/;

            expectValues.forEach(function (expectValue) {
               expect(orderedJobs.generate(argument)).to.include(expectValue); 
            });

            expect(orderedJobs.generate(argument)).to.have.length(expectValues.length);
            expect(orderedJobs.generate(argument)).to.match(expectPattern);
        });

    });
});