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
        this.orderedJobNames = [];
    }

    _Jobs.fromJobDependencyRules = function (jobDependencyRules) {
        return new _Jobs((new JobDependencyRuleConverter(jobDependencyRules)).toJobs());
    };

    _Jobs.prototype = {
        orderByDependency: function() {
            this.jobs.forEach(this._generateOrderedJobNames.bind(this));
            return this.orderedJobNames;
        },
        _generateOrderedJobNames: function (job, index) {
            if (!this._isInOrderedJobNames(job.name)) this.orderedJobNames.push(job.name);
            if (job.hasDependency() && !this._isInOrderedJobNames(job.dependency))
                this.orderedJobNames.unshift(job.dependency);
        },
        _isInOrderedJobNames: function (dependency) {
            return this.orderedJobNames.indexOf(dependency) !== -1;
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
