"use strict";

var Job = (function () {

    function _Job (name, index) {
        this.name       = name;
        this.dependency = null;
        this.index      = index;
    }

    _Job.prototype = {
        isSelfReferencing: function () {
            if (!this.hasDependency()) return false;
            return this.name === this.dependency.name;
        },
        hasDependency: function () {
            return this.dependency !== null;
        },
        setDependency: function (job) {
            this.dependency = job;
        }
    };

    return _Job;
    
})();

var JobDependencyRuleConverter = (function () {

    function _JobDependencyRuleConverter(jobDependencyRules) {
        this.jobDependencyRules = jobDependencyRules.split("\n");
        this.jobs               = this._generateJobsFromJobDependencyRules();
        this._generateDependenciesFromJobDependencyRules();
    }

    _JobDependencyRuleConverter.prototype = {
        toJobs: function () {
            return this.jobs;
        },
        _generateDependenciesFromJobDependencyRules: function () {
            this.jobDependencyRules.forEach((function (jobDependencyRule, index) {
                var jobDependencyName = this._getJobDependencyNameFromJobDependencyRule(jobDependencyRule);
                if (jobDependencyName !== "")
                    this.jobs[index].setDependency(this._getJobFromJobName(jobDependencyName));
            }).bind(this));            
        },
        _generateJobsFromJobDependencyRules: function () {
            return this.jobDependencyRules.map((function (jobDependencyRule, index) {
                return new Job(this._getJobNameFromJobDependencyRule(jobDependencyRule), index);
            }).bind(this));
        },
        _getJobNameFromJobDependencyRule: function (jobDependencyRule) {
            return jobDependencyRule.charAt(0);
        },
        _getJobDependencyNameFromJobDependencyRule: function (jobDependencyRule) {
            var dependency = jobDependencyRule.charAt(jobDependencyRule.length - 1);
            if (this._isValidDependencyName(dependency)) return dependency;
            else return "";
        },
        _isValidDependencyName: function (dependency) {
            return dependency.match(/[a-z]/) !== null;
        },
        _getJobFromJobName: function (jobName) {
            for (var i = 0; i < this.jobs.length; ++i)
                if (this.jobs[i].name === jobName)
                    return this.jobs[i];
            return null;
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
        getJobs: function () {
            return this.jobs;
        },
        checkDependencyChainConflicts: function (job) {
            this._isSelfReferencing(job);
            this._isCircularDependencyChain(job);
        },
        _isSelfReferencing: function (job) {
            if (job.isSelfReferencing())
                throw new Error("Self Referencing!");
        },
        _isCircularDependencyChain: function (job) {
            var temporaryJob = job;
            while (temporaryJob.hasDependency()) {
                temporaryJob = this.jobs[temporaryJob.dependency.index];
                if (temporaryJob.name === job.name)
                    throw new Error("Circular Dependency Chain!");
            }
        }
    };

    return _Jobs;

})();

var OrderedJobs = (function () {

    function _OrderedJobs () {
        this.jobs = null;
        this.orderedJobNames = [];
    }
    
    _OrderedJobs.prototype = {
        generate: function (jobDependencyRules) {
            if (this._isEmpty(jobDependencyRules)) return "";
            this.jobs = Jobs.fromJobDependencyRules(jobDependencyRules);
            return this._orderByDependency().join("");
        },
        _isEmpty: function(jobDependencyRules) {
            return jobDependencyRules === "";
        },
        _orderByDependency: function() {
            this.jobs.getJobs().forEach(this.jobs.checkDependencyChainConflicts.bind(this.jobs));
            this._generateOrderedJobNames();
            return this.orderedJobNames;
        },
        _generateOrderedJobNames: function (job) {
            this.jobs.getJobs().forEach((function (job, index, jobs) {
                if (!job.hasDependency()) this._AddJobNameToOrderedJobNames(job.name);
                else this._AddDependencyChainToOrderedJobNames(job);
            }).bind(this));
        },
        _AddJobNameToOrderedJobNames: function (jobName) {
            if (this._isNotInOrderedJobNames(jobName))
                this.orderedJobNames.push(jobName);
        },
        _AddDependencyChainToOrderedJobNames: function (job) {
            var reverseDependencyChain = [];
            var temporaryJob = job;
            if (this._isNotInOrderedJobNames(temporaryJob.name)) {
                reverseDependencyChain.push(temporaryJob.name);
                while (temporaryJob.hasDependency()) {
                    temporaryJob = this.jobs.getJobs()[temporaryJob.dependency.index];
                    if (this._isNotInOrderedJobNames(temporaryJob.name))
                        reverseDependencyChain.push(temporaryJob.name);
                }
                this.orderedJobNames = this.orderedJobNames.concat(reverseDependencyChain.reverse());
            }
        },
        _isNotInOrderedJobNames: function (jobName) {
            return this.orderedJobNames.indexOf(jobName) === -1;
        }
    };
    
    return _OrderedJobs;

})();

module.exports = OrderedJobs;
