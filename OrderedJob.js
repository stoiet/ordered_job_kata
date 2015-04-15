"use strict";

var Job = (function () {
    
    function _Job (name, dependency) {
        this.name = name;
        this.dependency = dependency;
    }
    
    _Job.prototype = {
        getName: function () {
            return this.name;
        },
        hasDependency: function () {
            return this.dependency !== "";
        }
    };
    
    return _Job;
})();

var JobConverter = (function () {

    function _JobConverter(sequenceOfJobDependency) {
        this.sequenceOfJobDependency = sequenceOfJobDependency;
    }

    _JobConverter.prototype = {
        toJobs: function () {
            return this.sequenceOfJobDependency.map((function (jobDependency) {
                return new Job(this._getJobName(jobDependency), this._getJobDependency(jobDependency));
            }).bind(this));
        },
        _getJobName: function (jobDependency) {
            return jobDependency.charAt(0);
        },
        _getJobDependency: function (jobDependency) {
            var dependency = jobDependency.charAt(jobDependency.length - 1);
            if (this._isValidDependency(dependency)) return dependency;
            else return "";
        },
        _isValidDependency: function (dependency) {
            return dependency.match(/[a-z]/) !== null;
        }
    };

    return _JobConverter;
})();

var Jobs = (function () {
    
    function _Jobs (jobs) {
        this.jobList = jobs;
    }

    _Jobs.fromSequenceOfJobDependency = function (sequenceOfJobDependency) {
        var jobConverter = new JobConverter(sequenceOfJobDependency);
        return new _Jobs(jobConverter.toJobs());
    };

    _Jobs.prototype = {
        asArray: function () {
            return this._filterJobNameDuplicates();
        },
        _filterJobNameDuplicates: function () {
            return this._getAllJobNames().filter((function (jobName, index) {
                return this._getAllJobNames().indexOf(jobName) == index;
            }).bind(this));
        },
        _getAllJobNames: function() {
            return this._getValidJobDependencyNames()
                .concat(this.jobList.map(function (job) { return job.getName(); }));
        },
        _getValidJobDependencyNames: function () {
            return this._getAllJobDependencyNames().filter(function (dependency) {
                return dependency !== "";
            });
        },
        _getAllJobDependencyNames: function () {
            return this.jobList.map(function (job) {
                return job.dependency;
            });
        }
    };
    
    return _Jobs;
})();

var SequenceOfJobNames = (function () {
    
    function _SequenceOfJobNames (sequenceOfJobDependency) {
        this.jobs = Jobs.fromSequenceOfJobDependency(sequenceOfJobDependency);
    }
    
    _SequenceOfJobNames.fromJobDependencies = function (jobDependencies) {
        return new _SequenceOfJobNames(jobDependencies.split("\n"));
    };
    
    _SequenceOfJobNames.prototype = {
        asString: function() {
            return this.jobs.asArray().join("");
        }
    };
    
    return _SequenceOfJobNames;
})();

var OrderedJob = (function () {
    
    function _OrderedJob () {}
    
    _OrderedJob.prototype = {
        generate: function (jobDependencies) {
            if (this._isEmpty(jobDependencies)) return "";
            var sequenceOfJobNames = SequenceOfJobNames.fromJobDependencies(jobDependencies);
            return sequenceOfJobNames.asString();
        },
        _isEmpty: function(listOfJobs) {
            return listOfJobs === "";
        }
    };
    
    return _OrderedJob;
})();

module.exports = OrderedJob;
