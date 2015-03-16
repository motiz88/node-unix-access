'use strict';

/**
 * Unit tests check owner dir/file permissions only because it is not possible to run chmod when not being dir/file owner.
 * In order to test group/other permissions, this test would need to change owner to some other user, and would need to know rootUser password to run 'sudo chmod'. This is desirable.
 *
 * Recalling UNIX permissions:
 *   R = dec 4 (bin 100)
 *   W = dec 2 (bin 010)
 *   X = dec 1 (bin 001)
 */

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
// true if the test is run by root user
var rootUser = false;

describe(pkg.name, function() {
    before(function() {
        // id of user this process is running under
        var uid = process.getuid();
        // are we running under rootUser? if so, tests must take this into account because rootUser has access everywhere even when the permissions are 000
        rootUser = uid === 0;

        // verify that UID of the testing dir/file are the same as of this process because only dir/file owner can call chmod command
        // chmod command is essential to allow unit tests to change dir/file permissions and verify results of the access() calls
        var stats = fs.statSync(testDir);
        should.exist(stats);
        stats.isDirectory().should.equal(true);
        if (!rootUser)
            uid.should.equal(stats.uid, 'You run the tests under a different user than the one, who has installed this module. As a consequence, UID of the node.js process (UID=' + uid + ') differs from the owner of \'' + testDir + '\' (UID=' + stats.uid + ') which prevents permission manipulation via chmod command and thus prevents the unit tests to work.');
        // save original permissions to get restored later
        testDirMode = stats.mode;

        stats = fs.statSync(testFile);
        should.exist(stats);
        stats.isFile().should.equal(true);
        if (!rootUser)
            uid.should.equal(stats.uid, 'You run the tests under a different user than the one, who has installed this module. As a consequence, UID of the node.js process (UID=' + uid + ') differs from the owner of \'' + testFile + '\' (UID=' + stats.uid + ') which prevents permission manipulation via chmod command and thus prevents the unit tests to work.');
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
            access.sync(testFile, ' abcd ').should.equal(true);
            access.async(testDir, '', function(err, result) {
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
            fs.chmodSync(testFile, '000');

            // if the test is run by a root user, we must expect true values where there are false values for other users (root user has access everywhere even when permissions are 000)
            access.sync(testDir, 'r').should.equal(rootUser);
            access.sync(testDir, 'w').should.equal(rootUser);
            access.sync(testDir, 'x').should.equal(rootUser);
            access.sync(testDir, 'rw').should.equal(rootUser);
            access.sync(testDir, 'rx').should.equal(rootUser);
            access.sync(testDir, 'wx').should.equal(rootUser);
            access.sync(testDir, 'rwx').should.equal(rootUser);

            access.async(testFile, 'r', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(rootUser);

                access.async(testFile, 'w', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(rootUser);

                    access.async(testFile, 'x', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        // will be false even for root user - executable permission on a file is is granted to super user only, if at least one of owner/group/others has executable permission
                        result.should.equal(false);

                        done();
                    });
                });
            });
        });

        it('should be case-insensitive and ignore invalid permission characters', function(done) {
            fs.chmodSync(testDir, '312');  // WX permissions for the owner
            fs.chmodSync(testFile, '501'); // RX permissions for the owner

            // tests include case-insensitivity of permission characters as well as ignoring invalid characters
            // if the test is run by a root user, we must expect true values where there are false values for other users (root user has access everywhere even when permissions are 000)
            access.sync(testDir, 'blah W   x oops').should.equal(true);
            access.sync(testDir, ' R w X blah ').should.equal(rootUser);
            access.sync(testFile, ' R oops x').should.equal(true);
            access.sync(testFile, 'wr oops X').should.equal(rootUser);

            access.async(testDir, 'x W kooky', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(true);

                access.async(testDir, 'Xsan', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(true);

                    access.async(testFile, 'does have x but not peRmissions', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.equal(true);

                        access.async(testFile, 'does not have write permissions ', function(err, result) {
                            should.not.exist(err);
                            should.exist(result);
                            result.should.equal(rootUser);

                            done();
                        });
                    });
                });
            });
        });

        it('should have R permissions only', function(done) {
            fs.chmodSync(testDir, '410');  // R permissions for the owner
            fs.chmodSync(testFile, '406'); // R permissions for the owner

            // if the test is run by a root user, we must expect true values where there are false values for other users (root user has access everywhere even when permissions are 000)
            access.sync(testDir, 'r').should.equal(true);
            access.sync(testDir, 'rw').should.equal(rootUser);
            access.sync(testDir, 'rx').should.equal(rootUser);
            access.sync(testDir, 'rwx').should.equal(rootUser);
            access.sync(testDir, 'w').should.equal(rootUser);
            access.sync(testDir, 'x').should.equal(rootUser);

            access.async(testFile, 'r', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(true);

                access.async(testFile, 'rx', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    // will be false even for root user - executable permission on a file is is granted to super user only, if at least one of owner/group/others has executable permission
                    result.should.equal(false);

                    access.async(testFile, 'rw', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.equal(rootUser);

                        access.async(testFile, 'rws', function(err, result) {
                            should.not.exist(err);
                            should.exist(result);
                            result.should.equal(rootUser);

                            access.async(testFile, 'w', function(err, result) {
                                should.not.exist(err);
                                should.exist(result);
                                result.should.equal(rootUser);

                                access.async(testFile, 'x', function(err, result) {
                                    should.not.exist(err);
                                    should.exist(result);
                                    // will be false even for root user - executable permission on a file is is granted to super user only, if at least one of owner/group/others has executable permission
                                    result.should.equal(false);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should have WX permissions', function(done) {
            fs.chmodSync(testDir, '340');  // WX permissions for the owner
            fs.chmodSync(testFile, '361'); // WX permissions for the owner

            // if the test is run by a root user, we must expect true values where there are false values for other users (root user has access everywhere even when permissions are 000)
            access.sync(testFile, 'w').should.equal(true);
            access.sync(testFile, 'x').should.equal(true);
            access.sync(testFile, 'wx').should.equal(true);
            access.sync(testFile, 'r').should.equal(rootUser);
            access.sync(testFile, 'rw').should.equal(rootUser);
            access.sync(testFile, 'rx').should.equal(rootUser);
            access.sync(testFile, 'rwx').should.equal(rootUser);

            access.async(testDir, 'w', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(true);

                access.async(testDir, 'x', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(true);

                    access.async(testDir, 'wx', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.equal(true);

                        access.async(testDir, 'r', function(err, result) {
                            should.not.exist(err);
                            should.exist(result);
                            result.should.equal(rootUser);

                            access.async(testDir, 'rw', function(err, result) {
                                should.not.exist(err);
                                should.exist(result);
                                result.should.equal(rootUser);

                                access.async(testDir, 'rx', function(err, result) {
                                    should.not.exist(err);
                                    should.exist(result);
                                    result.should.equal(rootUser);

                                    access.async(testDir, 'rwx', function(err, result) {
                                        should.not.exist(err);
                                        should.exist(result);
                                        result.should.equal(rootUser);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should have RWX permissions', function(done) {
            fs.chmodSync(testDir, '724');  // RWX permissions for the owner
            fs.chmodSync(testFile, '751'); // RWX permissions for the owner

            access.sync(testDir, 'r').should.equal(true);
            access.sync(testDir, 'w').should.equal(true);
            access.sync(testDir, 'x').should.equal(true);
            access.sync(testDir, 'rw').should.equal(true);
            access.sync(testDir, 'rx').should.equal(true);
            access.sync(testDir, 'wx').should.equal(true);
            access.sync(testDir, 'rwx').should.equal(true);

            access.async(testFile, 'r', function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.equal(true);

                access.async(testFile, 'r', function(err, result) {
                    should.not.exist(err);
                    should.exist(result);
                    result.should.equal(true);

                    access.async(testFile, 'w', function(err, result) {
                        should.not.exist(err);
                        should.exist(result);
                        result.should.equal(true);

                        access.async(testFile, 'x', function(err, result) {
                            should.not.exist(err);
                            should.exist(result);
                            result.should.equal(true);

                            access.async(testFile, 'rw', function(err, result) {
                                should.not.exist(err);
                                should.exist(result);
                                result.should.equal(true);

                                access.async(testFile, 'rx', function(err, result) {
                                    should.not.exist(err);
                                    should.exist(result);
                                    result.should.equal(true);

                                    access.async(testFile, 'wx', function(err, result) {
                                        should.not.exist(err);
                                        should.exist(result);
                                        result.should.equal(true);

                                        access.async(testFile, 'rwx', function(err, result) {
                                            should.not.exist(err);
                                            should.exist(result);
                                            result.should.equal(true);

                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
