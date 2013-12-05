var crun = require('../lib/crun');
var expect = require('expect.js');
var exec = require('child_process').exec;

describe('crun', function () {

	var testCmds = {
		ls: 'ls -al',
		bad: 'which asdf',
		cp: 'cp -Rf #{src} #{dst}'
	};

	describe('generate', function(){
		it('should create commands map in new named command group', function() {
			crun.generate('test', testCmds);
			expect(crun.test).to.be.an('object');
			expect(crun.test.ls).to.be.a('function');
			expect(crun.test.cp).to.be.a('function');
		});
	});

	describe('run', function () {

		describe('with callback', function () {
			it('should return stdout results in callback', function (done) {
				crun.test.ls(function (error, result) {
					exec(testCmds.ls, function (error, stdout, stderr) {
						expect(result.stdout).to.eql(stdout);
						done();
					});
				});
			});

			it('should return stderr results in callback', function (done) {
				crun.test.cp('badFile1', 'dest', function (error, result) {
					expect(result.stderr).to.eql('cp: badFile1: No such file or directory\n');
					exec('cp -Rf badFile1 dest', function (error, stdout, stderr) {
						expect(stderr).to.eql(result.stderr);
						done();
					});
				});
			});

			it('should return trimmed stderr results in callback', function (done) {
				crun.test.cp('badFile1', 'dest', function (error, result) {
					expect(result.stderrt).to.eql('cp: badFile1: No such file or directory');
					exec('cp -Rf badFile1 dest', function (error, stdout, stderr) {
						expect(stderr.trim()).to.eql(result.stderrt);
						done();
					});
				});
			});

			it('should return trimmed stdout results in callback', function (done) {
				crun.test.ls(function (error, result) {
					exec(testCmds.ls, function (error, stdout, stderr) {
						expect(result.stdoutt).to.eql(stdout.trim());
						done();
					});
				});
			});

			it('should return null error under normal cases in callback', function (done) {
				crun.test.ls(function (error, result) {
					expect(error).to.be(null);
					done();
				});
			});

			it('should return error in callback', function (done) {
				crun.test.bad(function (crunError, result) {
					exec(testCmds.bad, function (execError, stdout, stderr) {
						expect(crunError).to.eql(execError);
						done();
					});
				});
			});

			it('should return correct command string in results', function (done) {
				crun.test.cp('sourceFile', 'destFile', function (error, result) {
					expect(result.command).to.be('cp -Rf sourceFile destFile');
					done();
				});
			});

			it('should throw exception if passed the wrong number of parameters', function () {
				var fn = function() {
					crun.test.ls('bad', function (){});
				};
				expect(fn).to.throwException(/Invalid number of arguments/);
			});
		});

		describe('without callback', function () {
			it('should return ChildProcess object', function () {
				var object = crun.test.ls();
				expect(object).to.be.ok();
				expect(object).to.be.a('object');
				expect(object.stdin).to.be.a('object');
				expect(object.stdout).to.be.a('object');
				expect(object.stderr).to.be.a('object');
				expect(object.pid).to.be.a('number');
			});
		});
	});
});
