# unix-access

Node.js module wrapping `access()` UNIX C function, which is currently missing in both V8 and Node's fs API.
Both `sync` and `async` implementations are available. This module works on `OS X` and `Linux`.

# Introduction

This Node.js module allows you to find out whether your app has specific permissions to a path.
You can check a path for `read`, `write` and `execute/search` permissions on both files and directories.

For more information about `access()` function, see `access` manual page.

# Usage

After requiring the module by `require('unix-access')`, you can run two functions available: `sync` and `async`.

`sync` function accepts two arguments of `String` type: path and permissions. Return value is of `Boolean` type.
Permissions may contain case-insensitive combination of `r`, `w`, and `x` characters. Any other characters will be stripped out.
`True` return value indicates you do have the permissions you were testing the path for, `False` means you do not.

`async` function works the same way as `sync` except one additional argument: callback.
Two arguments will be passed over the callback: error message, and operation result of `Boolean` type.

### Node.js examples

```js
    var access = require('unix-access');

    // synchronous check for existence of the file
    console.log(access.sync('/var/log/your_app.log', ''));
    // synchronous check if our app has both read and write permissions
    console.log(access.sync('/var/log/your_app.log', 'rw'));
    // synchronous check if we have full control over the directory (read, write, and search)
    console.log(access.sync('/var/log/your_app_dir/', 'rwx'));

    // asynchronous check for read and executable permissions
    access.async('/bin/tar', 'rx', function(err, result) {
        console.log(result);
    });

```

# Supported platforms and requirements
### OS X
Tested on OS X Mavericks 10.9.
Requires:
* Either `Command Line Tools for Xcode` or `Xcode` with manual installation of Command Line Tools
* Python 2.7 (present in the OS by default)
### Linux
Tested on Debian Wheezy 7.0. Requires:
* make
* Python 2.7

# Technical details


# Installation

`npm install unix-access`

# Dependencies

The module does not depend on any other code. For developers of this tool, `mocha` and `should` are the only dependencies for running unit tests.

# Development

In order to develop this plugin, these steps are required:
* Clone the git repo by running `git clone URL`
* Go to the newly created directory in Terminal
* Run `npm install` to download dependencies
* Run unit tests by `npm test`
