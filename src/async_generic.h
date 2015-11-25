#include <stdlib.h> // free()

using namespace Nan;
using v8::Boolean;
using v8::Function;
using v8::Local;
using v8::Value;
using v8::String;

template <typename path_char>
class AccessWorker : public AsyncWorker {
private:
    path_char *path;
    int  amode;
    bool hasAccess;

public:
    AccessWorker(path_char *path, int amode, Callback *callback) : AsyncWorker(callback), path(path), amode(amode) {}
    ~AccessWorker() {
        free(path);
    }

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