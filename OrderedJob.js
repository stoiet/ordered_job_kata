"use strict";

var Job = (function () {
    
    function _Job (name, dependency) {
        this.name = name;
        this.dependency = dependency;
    }
    
    _Job.prototype = {
        asString: function () {}
    };
    
    return _Job;
})();

var Jobs = (function () {
    
    function _Jobs () {
        this.jobList = [];
    }
    
    return _Jobs;
})();

var SequenceOfJobs = (function () {
    
    function _SequenceOfJobs (sequenceOfJobsDependency) {
        this.sequenceOfJobsDependency = sequenceOfJobsDependency;
    }
    
    _SequenceOfJobs.fromJobDependencies = function (jobDependencies) {
        return new _SequenceOfJobs(jobDependencies.split("\n"));
    };
    
    _SequenceOfJobs.prototype = {
        asString: function() {
            return this._asArray().join("");
        },
        _asArray: function () {
            return this.sequenceOfJobsDependency.map(function (currentValue) {
                return this._getFirstCharacter(currentValue);
            }.bind(this));
        },
        _getFirstCharacter: function(listOfJobs) {
            return listOfJobs.charAt(0);
        }
    };
    
    return _SequenceOfJobs;
})();

var OrderedJob = (function () {
    
    function _OrderedJob () {}
    
    _OrderedJob.prototype = {
        generate: function (jobDependencies) {
            if (this._isEmpty(jobDependencies)) return "";
            var sequenceOfJobs = SequenceOfJobs.fromJobDependencies(jobDependencies);
            return sequenceOfJobs.asString();
        },
        _isEmpty: function(listOfJobs) {
            return listOfJobs === "";
        }
    };
    
    return _OrderedJob;
})();

module.exports = OrderedJob;