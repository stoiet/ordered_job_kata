"use strict";

var Job = (function () {

    function _Job (name, dependency) {
        this.name = name;
        this.dependency = dependency;
    }

    _Job.prototype = {
        hasDependency: function () {
            return this.dependency !== "";
        }
    };

    return _Job;
})();

var JobDependencyRuleConverter = (function () {

    function _JobDependencyRuleConverter(jobDependencyRules) {
        this.jobDependencyRules = jobDependencyRules.split("\n");
    }

    _JobDependencyRuleConverter.prototype = {
        toJobs: function () {
            return this.jobDependencyRules.map((function (jobDependencyRule) {
                return new Job(this._getJobName(jobDependencyRule), this._getJobDependency(jobDependencyRule));
            }).bind(this));
        },
        _getJobName: function (jobDependencyRule) {
            return jobDependencyRule.charAt(0);
        },
        _getJobDependency: function (jobDependencyRule) {
            var dependency = jobDependencyRule.charAt(jobDependencyRule.length - 1);
            if (this._isValidDependency(dependency)) return dependency;
            else return "";
        },
        _isValidDependency: function (dependency) {
            return dependency.match(/[a-z]/) !== null;
        }
    };

    return _JobDependencyRuleConverter;
})();

var Jobs = (function () {

    function _Jobs(jobs) {
        this.jobs = jobs;
    }

    _Jobs.fromJobDependencyRules = function (jobDependencyRules) {
        return new _Jobs((new JobDependencyRuleConverter(jobDependencyRules)).toJobs());
    };

    _Jobs.prototype = {
        orderByDependency: function() {
            var jobNames = this._generateJobNames();
            this.jobs.forEach(function (job, index) {
                if (job.hasDependency()) {
                    jobNames[jobNames.indexOf(job.dependency)] = job.name;
                    jobNames[index] = job.dependency;
                }
            });
            return jobNames;
        },
        _generateJobNames: function () {
            return this.jobs.map(function (job) {
                return job.name;
            });
        }
    };

    return _Jobs;
})();

var OrderedJobs = (function () {

    function _OrderedJobs () {}
    
    _OrderedJobs.prototype = {
        generate: function (jobDependencyRules) {
            if (this._isEmpty(jobDependencyRules)) return "";
            var orderedJobs = Jobs.fromJobDependencyRules(jobDependencyRules).orderByDependency();
            return orderedJobs.join("");
        },
        _isEmpty: function(jobDependencyRules) {
            return jobDependencyRules === "";
        }
    };
    
    return _OrderedJobs;
})();

module.exports = OrderedJobs;
