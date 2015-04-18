"use strict";

var Job = (function () {

    function _Job (name, dependency) {
        this.name = name;
        this.dependency = dependency;
    }

    _Job.prototype = {
        hasDependency: function () {
            return this.dependency !== "";
        },
        isSelfReferencing: function () {
            return this.name === this.dependency;
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
        getJobs: function () {
            return this.jobs;
        },
        nextJob: function(dependencyChain) {
            return this.jobs[this._nextJobIndex(dependencyChain[dependencyChain.length - 1].dependency)];
        },
        _nextJobIndex: function (dependency) {
            for (var i = 0; i < this.jobs.length; ++i)
                if (this.jobs[i].name === dependency)
                    break;
            return i;
        }
    };

    return _Jobs;
})();

var OrderedJobs = (function () {

    function _OrderedJobs () {
        this.jobs = null;
        this.orderedJobs = [];
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
            this.jobs.getJobs().forEach(this._generateOrderedJobs.bind(this));
            return this.orderedJobs;
        },
        _generateOrderedJobs: function (job) {
            this._validateDependencies();
            this._addNewJob(job);
            this._addNewDependency(job);
        },
        _addNewJob: function (job) {
            if (!this._isAlreadyAdded(job.name))
                this.orderedJobs.push(job.name);
        },
        _addNewDependency: function (job) {
            if (this._isDependencyAddable(job))
                this.orderedJobs.unshift(job.dependency);
        },
        _isDependencyAddable: function (job) {
            return job.hasDependency() && !this._isAlreadyAdded(job.dependency);
        },
        _isAlreadyAdded: function (dependency) {
            return this.orderedJobs.indexOf(dependency) !== -1;
        },
        _validateDependencies: function () {
            var dependencyChain = [];
            for (var i = 0; i < this.jobs.getJobs().length; ++i) {
                if (this.jobs.getJobs()[i].isSelfReferencing()) continue;
                dependencyChain = []; dependencyChain.push(this.jobs.getJobs()[i]);
                this._isCircularDependencyChainGiven(dependencyChain);
            }
        },
        _isCircularDependencyChainGiven: function (dependencyChain) {
            while (dependencyChain[dependencyChain.length - 1].dependency) {
                if (this._isCircularDependencyChain(dependencyChain))
                    throw new Error("Circular dependency chain!");
                dependencyChain.push(this.jobs.nextJob(dependencyChain));
            }
        },
        _isCircularDependencyChain: function (dependencyChain) {
            return dependencyChain[dependencyChain.length - 1].dependency === dependencyChain[0].name;
        }
    };
    
    return _OrderedJobs;
})();

module.exports = OrderedJobs;
