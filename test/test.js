'use strict';

// TODO finalise the unit tests
// TODO test on debian linux

var fs     = require('fs');
var should = require('should');
var access = require('../index');
var pkg    = require('../package.json');

// full paths to testing directory and file
var testDir  = __dirname + '/test-dir';
var testFile = __dirname + '/test-file.txt';
// original permissions so that we can restore them once all unit tests are finalised
var testDirMode;
var testFileMode;

describe(pkg.name, function() {
    before(function() {
        // ids of user and group this process is running under
        var uid = process.getuid();
        var gid = process.getgid();

        // verify that UID and GID of the testing dir/file are the same as of this process
        // because unit tests count on this when setting permissions and verifying result of the access() calls
        var stats = fs.statSync(testDir);
        should.exist(stats);
        stats.isDirectory().should.equal(true);
        var msg = ' of the node.js process must be the same as of the \'' + testDir + '\' directory.';
        stats.uid.should.equal(uid, 'UID' + msg);
        stats.gid.should.equal(gid, 'GID' + msg);
        // save original permissions to get restored later
        testDirMode = stats.mode;

        stats = fs.statSync(testFile);
        should.exist(stats);
        stats.isFile().should.equal(true);
        msg = ' of the node.js process must be the same as of the \'' + testFile + '\' file.';
        stats.uid.should.equal(uid, 'UID' + msg);
        stats.gid.should.equal(gid, 'GID' + msg);
        // save original permissions to get restored later
        testFileMode = stats.mode;
    });

    after(function() {
        // return the permission to the original state prior these unit tests were run
        fs.chmodSync(testDir, testDirMode);
        fs.chmodSync(testFile, testFileMode);
    });

    describe('failing sync and async access()', function() {
        it('should fail to run with an invalid argument', function(done) {
            // invalid argument type will cause an TypeException to get thrown
            // in order to catch it by should, the access() calls myst be wrapped into a closure

            // first path argument must be of String type
            (function() {access.sync(testDir, 12345)}).should.throw();
            (function() {access.async(testDir, 12345, function() {})}).should.throw();
            // second permissions' argument must be of String type
            (function() {access.sync(12345, 'rwx')}).should.throw();
            (function() {access.async(12345, 'rwx', function() {})}).should.throw();
            // third callback argument must be of function type
            (function() {access.async(testDir, 'rwx', false)}).should.throw();

            done();
        });

        it('should fail to run with invalid amount of arguments', function(done) {
            // invalid argument type will cause an TypeException to get thrown
            // in order to catch it by should, the access() calls myst be wrapped into a closure

            // missing one of the two string arguments
            (function() {access.sync(testDir)}).should.throw();
            (function() {access.async(testDir, function() {})}).should.throw();
            // missing third callback argument
            (function() {access.async(testDir, 'rwx')}).should.throw();

            done();
        });
    });

    describe('successful access()', function() {
        it('should exist', function(done) {
            access.sync(testDir, '').should.equal(true);
            // invalid characters get skipped and thus permission string is considered to be empty
            access.sync(testDir, ' abcd ').should.equal(true);
            access.async(testFile, '', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(true);

                // invalid characters get skipped and thus permission string is considered to be empty
                access.async(testFile, 'ab c d ', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(true);

                    done();
                });
            });
        });

        it('should not exist', function(done) {
            access.sync('blahblah.xyz', '').should.equal(false);
            access.async('blahblah.xyz', '', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(false);

                // invalid characters get skipped and thus permission string is considered to be empty
                access.async('blahblah.xyz', ' ab cd', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(false);

                    done();
                });
            });
        });

        it('should have no permissions', function(done) {
            // drop all permissions
            fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            access.sync(testDir, 'r').should.equal(false);
            access.sync(testDir, 'w').should.equal(false);
            access.sync(testDir, 'x').should.equal(false);
            access.sync(testDir, 'rw').should.equal(false);
            access.sync(testDir, 'rx').should.equal(false);
            access.sync(testDir, 'wx').should.equal(false);
            access.sync(testDir, 'rwx').should.equal(false);

            access.async(testDir, 'r', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(false);

                access.async(testDir, 'w', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(false);

                    access.async(testDir, 'x', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.equal(false);

                        done();
                    });
                });
            });
        });

        it.skip('should have R permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have W permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have X permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have RW permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have RX permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have WX permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });

        it.skip('should have RWX permissions', function(done) {
            //fs.chmodSync(testDir, '000');

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            done();
        });
    });
});
