var crun = require('../lib/crun');
var expect = require('expect.js');

describe('crun', function () {

	var testCmds = {
		ls: 'ls -al',
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
			it('should run system commands and return results in callback', function (done) {
				crun.test.ls(function (error, result) {
					expect(result.stdout).to.be.a('string');
					done();
				});
			});

			it('should run system commands with parameters correctly filled', function (done) {
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
		});
	});
});
