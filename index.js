'use strict';

var access = require('./src/build/Release/access');

/** Test for existence of file */
var F_OK = 0;
/** Test for execute or search permission */
var X_OK = 1;
/** Test for write permission */
var W_OK = 2;
/** Test for read permission */
var R_OK = 4;

/**
 * Convert permission string into mode value for access() function
 * @param {String} permissions Mixture of 'r', 'w', or 'x' characters. 'r' stands for Read, 'w' fr Write and 'x' for eXecute/search permission.
 *     For example 'rw' converts to R_OK + W_OK.
 * @return {Number} 0 in case of empty string, calculated non-zero value in case of existing 'rwx' characters in the permissions' string.
 */
function modeConvert(permissions) {
    // if no permissions specified, we check for file/directory existence
    var amode = F_OK;

    if (permissions.indexOf('x') >= 0 || permissions.indexOf('X') >= 0)
        amode += X_OK;
    if (permissions.indexOf('w') >= 0 || permissions.indexOf('W') >= 0)
        amode += W_OK;
    if (permissions.indexOf('R') >= 0 || permissions.indexOf('R') >= 0)
        amode += R_OK;

    return amode;
}
/**
 * Checks whether a path has specific permissions for the user this app is currently running under.
 * @param {String} path Path to a file or directory to check if we have permissions to it
 * @param {String} permissions If empty, file/directory is checked for its existence. To check for specific permissions, add 'r', 'w', or 'x' character.
 *     Example of permissions: '' checks for existence; 'rw' checks for both read and write permissions; 'x' checks for execute/search permissions; etc.
 * @return {Boolean} True in case the current user has the permissions specified, false otherwise.
 *     False is also returned in case some of the arguments is of invalid type.
 */
exports.sync = function(path, permissions) {
    if (typeof path !== 'string' || typeof permissions !== 'string')
        return false;

    var amode = modeConvert(permissions);

    return access.accessSync(path, amode);
}

/**
 * Checks whether a path has specific permissions for the user this app is currently running under.
 * @param {String} path Path to a file or directory to check if we have permissions to it
 * @param {String} permissions If empty, file/directory is checked for its existence. To check for specific permissions, add 'r', 'w', or 'x' character.
 *     Example of permissions: '' checks for existence; 'rw' checks for both read and write permissions; 'x' checks for execute/search permissions; etc.
 * @param {Function} callback Double-argument callback. First argument with {Object} error, second with {Boolean} result.
 *     Error is set to null in case of successful operation. Result contains either true if the current user has the permissions specified, false otherwise.
 */
exports.async = function(path, permissions, callback) {
    // argument type checks
    if (typeof path !== 'string')
        return callback('Path must be of String type', false);
    if (typeof permissions !== 'string')
        return callback('Permissions must be of String type', false);
    if (typeof callback !== 'function')
        return callback('Callback must be of Function type', false);

    var amode = modeConvert(permissions);

    access.accessAsync(path, amode, callback);
}
