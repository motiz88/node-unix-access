#include <unistd.h>
#include "async.h"

using namespace Nan;
using v8::Boolean;
using v8::Function;
using v8::Local;
using v8::Value;
using v8::String;

class AccessWorker : public AsyncWorker {
private:
    char *path;
    int  amode;
    bool hasAccess;

public:
    AccessWorker(char *path, int amode, Callback *callback) : AsyncWorker(callback), path(path), amode(amode) {}
    ~AccessWorker() {}

    // Executed inside the worker-thread
    // It is not safe to access V8, or V8 data structures here, so everything we need for input and output should go on `this`
    void Execute () {
        // Calling access() returns 0 in case the access to the path is granted
        hasAccess = access(path, amode) == 0;
    }

    // Executed when the async work is complete
    // This function will be run inside the main event loop so it is safe to use V8 again
    void HandleOKCallback () {
        HandleScope scope;

        Local<Value> argv[] = {
            Null(),
            New<Boolean>(hasAccess)
        };

        callback->Call(2, argv);
    }
};

// Asynchronous access to the `access()` function
NAN_METHOD(accessAsync) {
    // Check of argument count and their types
    if (info.Length() != 3) {
        ThrowTypeError("Three arguments are required - String, Number, and a callback");
        return;
    }
    if (!info[0]->IsString()) {
        ThrowTypeError("First argument must be of String type");
        return;
    }
    if (!info[1]->IsNumber()) {
        ThrowTypeError("Second argument must be of Number type");
        return;
    }
    if (!info[2]->IsFunction()) {
        ThrowTypeError("Third argument must be of Function type");
        return;
    }

    // Duplicate the path value to prevent garbage-collection of the original value
    char *path = strdup(*String::Utf8Value(info[0]->ToString()));
    int  amode = info[1]->Uint32Value();
    Callback *callback = new Callback(info[2].As<Function>());

    AsyncQueueWorker(new AccessWorker(path, amode, callback));
}
