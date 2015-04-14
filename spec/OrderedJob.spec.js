var expect = require("chai").expect;
var OrderedJob = require("../OrderedJob.js");


describe("OrderedJob", function () {
       
    describe("#generate", function () {
        
        var orderedJob;
        
        beforeEach(function () {
            orderedJob = new OrderedJob();
        });
        
        it("should return empty sequence with empty string given", function () {
            expect(orderedJob.generate("")).to.eql(""); 
        });

        [
            {
                it: "should return a sequence of one job with single job given",
                argument: "a =>",
                expect: ["a"]
            },
            {
                it: "should return a sequence of jobs with multiple jobs given",
                argument: "a =>\nb =>\nc =>",
                expect: ["a", "b", "c"]
            }
        ]
        .forEach(function (testCase) {
            it(testCase.it, function () {
                testCase.expect.forEach(function (expectValue) {
                   expect(orderedJob.generate(testCase.argument)).to.include(expectValue); 
                });
                expect(orderedJob.generate(testCase.argument)).to.have.length(testCase.expect.length);
            });
        });

        [
            {
                it: "should return a sequence of jobs with multiple jobs given and single dependency",
                argument: "a =>\nb => c\nc =>",
                expect: ["a", "b", "c"],
                expectPattern: /ca*b/
            }
        ]
        .forEach(function (testCase) {
            it(testCase.it, function () {
                testCase.expect.forEach(function (expectValue) {
                   expect(orderedJob.generate(testCase.argument)).to.include(expectValue); 
                });
                expect(orderedJob.generate(testCase.argument)).to.have.length(testCase.expect.length);
                expect(orderedJob.generate(testCase.argument)).to.match(testCase.expectPattern);
            });
        });

    });
});