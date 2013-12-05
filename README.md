# Crun.js

Crun is a Node.js module which provides methods to map system commands to JavaScript functions, to allow better reusability of system command calls. Function parameters represent argument strings which are interpolated via #{…} symbols with arbitrary names.

A ChildProcess object is returned when calling commands without providing a callback function. If a callback function is provided, there is no return value and the results are processed through the callback.

## Install

Install the module with: `npm install crun`

## Example

```javascript
var crun = require('crun');

// generate commands
var commands = {
	ls: 'ls -al',
	cp: 'cp -Rf #{src} #{dst}',
	tail: 'tail -f #{log}'
};
crun.generate('test', commands);

// run commands child_process.exec
crun.test.ls(function(error, result) {
	console.log('ls output: ' + result.stdout);
});

crun.test.cp('file1', 'file2', function (error, result) {
	console.log('cp output: ' + result.stdout);
});

//run commands child_process.spawn
var tail = crun.test.tail('logfile');
tail.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

tail.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

tail.on('close', function (code) {
  console.log('child process exited with code ' + code);
});
```

## Generated Functions

A function generated by `crun.generate` needs to be passed the same number of parameters as the number of #{…} symbols in the command string. For example, the `cp` command in the example accepts two parameters, src and dst. the final parameter is the callback function for the command.

The callback function consists of two parameters: the error object and the result object. The result object has the following properties:

- command: the command with the #{} placeholders replaced with passed in values
- stdout: contents of the standard output stream of the command
- stderr: contents of the standard error stream of the command

