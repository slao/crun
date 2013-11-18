# Crun.js

Crun is a Node.js module which provides methods to map system commands to JavaScript functions, to allow better reusability of system command calls. Function parameters represent argument strings which are interpolated via #{…} symbols with arbitrary names.

ChildProcess object is returned when calling commands without providing a callback function. If a callback function is provided, there is no return value and the results are processed through the callback.

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
