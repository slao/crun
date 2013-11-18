var child_process = require('child_process');
var logger = console;

exports.setLogger = function (inLogger) {
	logger = inLogger;
};

exports.generate = function (exportObj, cmdMap) {
	var key, newObj;

	if (exportObj && exportObj.length > 0) {
		newObj = exports[exportObj] = {};
	} else {
		newObj = exports;
	}
	for (key in cmdMap) {
		if (cmdMap.hasOwnProperty(key)) {
			newObj[key] = createFunction(key, cmdMap);
		}
	}
};

// ------------------

function createFunction(commandName, cmdMap) {
	var command, params, sortedParams, numParams, i;
	command = cmdMap[commandName];

	// extract parameters from command string
	params = command.match(/#\{[^\}]*\}/g);
	if (params && params.length > 0) {
		sortedParams = params.slice(0);
		sortedParams.sort();
		numParams = sortedParams.length;
		for (i = 1; i < numParams; ++i) {
			if (sortedParams[i] === sortedParams[i - 1]) {
				sortedParams.splice(i--, 1);
				params.splice(params.lastIndexOf(sortedParams[i]), 1);
			}
		}
		numParams = params.length;
	} else {
		numParams = 0;
	}

	/*
	 * function has the following parameters, in the following order
	 * zero or more params mapping directly to unique tags #{...} in command string
	 * optional options object
	 * optional callback - if callback not specified, a spawned proc is returned
	 */
	return function () {
		var finalCommand, i, numArgs, callback, callbackStr, arg, param, splitCmd, options, extraArgs, re;

		// verify arguments (order of arguments should follow order that parameters appear in command)
		numArgs = arguments.length;
		if (numArgs > 0) {
			if (typeof arguments[numArgs - 1] === 'function') {
				callback = arguments[numArgs - 1];
				options = typeof arguments[numArgs - 2] === 'object' ? arguments[numArgs - 2] : null;
			} else if (typeof arguments[numArgs - 1] === 'object') {
				options = arguments[numArgs - 1];
			}
			extraArgs = callback ? 1 : 0;
			if (options) {
				extraArgs += 1;
			}
			if (numParams !== numArgs - extraArgs) {
				callbackStr = callback ? 'with' : 'without';
				throw new Error('Invalid number of arguments (' + numArgs + ', ' + callbackStr + ' callback) to command: ' + command);
			}
		} else if (numParams > 0) {
			throw new Error('No arguments passed to command: ' + command);
		}
		if (!options) {
			options = {};
		}

		// substitute parameters with arguments
		finalCommand = command;
		for (i = 0; i < numParams; ++i) {
			param = params[i];
			arg = arguments[i];
			if (!arg) {
				throw new Error('Invalid value "' + arg + '" found for ' + param + ' parameter in command: ' + command);
			}
			re = new RegExp(param, "g");
			finalCommand = finalCommand.replace(re, arg);
		}

		// If callback specified, run exec, otherwise return a spawned process
		if (callback) {
			if (!options.silent) {
				logger.log('cmd execute: ' + finalCommand);
			}
			child_process.exec(finalCommand, options, function (err, stdout, stderr) {
				if (err) {
					err.command = finalCommand;
				}
				var result = {
					command: finalCommand,
					stdout: stdout,
					stderr: stderr
				};
				callback(err, result);
			});
		} else {
			if (!options.silent) {
				logger.log('cmd spawn: ' + finalCommand);
			}
			splitCmd = finalCommand.split(' ');
			return child_process.spawn(splitCmd[0], splitCmd.slice(1), options);
		}
	};
}

// ------------------

/*
// EXAMPLE: some commands
var main = {
	symlink: 'ln -s #{source} #{target}',
	rm: 'rm -rf #{folder}',
	copy: 'cp -Rf #{src} #{dst}',
	move: 'mv #{src} #{dst}',
	open: 'open #{target}'
};

exports.generate('main', main);
*/
