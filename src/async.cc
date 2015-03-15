// The code below was inspired by https://github.com/rvagg/node-addon-examples/blob/master/9_async_work/async.cc which worked for Node.js 0.10.x
// For Node.js 0.12.x there were quite some changes needed, especially to make the async callback Persistent so garbage collector does not discard it

#include <uv.h>
#include <node.h>
#include <unistd.h>
#include <string.h>
#include "async.h"

using namespace v8;

// libuv allows us to pass around a pointer to an arbitrary object when running asynchronous functions.
// We create a data structure to hold the data we need during and after the async work.
typedef struct AsyncData {
    char *path;
    int amode;
    Persistent<Function> callback;
    int result;
} AsyncData;

// Function to execute inside the worker-thread.
// It is not safe to access V8, or V8 data structures here, so everything we need for input and output should go on our req->data object.
void AsyncWork(uv_work_t *req) {
    // Fetch our data structure
    AsyncData *asyncData = (AsyncData *) req->data;

    // Run access() and assign the result to our data structure
    asyncData->result = access(asyncData->path, asyncData->amode);
}

// Function to execute when the async work is complete. This function will be run inside the main event loop so it is safe to use V8 again
void AsyncAfter(uv_work_t *req) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    // Fetch our data structure
    AsyncData *asyncData = (AsyncData *) req->data;
    // Create an arguments array for the callback
    Handle<Value> cbArgs[] = {
        // No error
        Null(isolate),
        // Calling access() returns 0 in case the access to the path is granted
        Boolean::New(isolate, asyncData->result == 0)
    };

    // Surround in a try/catch for safety
    TryCatch try_catch;
    // Execute the callback function
    Local<Function>::New(isolate, asyncData->callback)->Call(isolate->GetCurrentContext()->Global(), 2, cbArgs);
    if (try_catch.HasCaught())
        node::FatalException(try_catch);

    // Dispose the persistent handle so that it can be garbage-collected
    asyncData->callback.Reset();
    // Clean up any memory we allocated
    delete asyncData->path;
    delete asyncData;
    delete req;
}

// Asynchronous access to the `access()` function
void accessAsync(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    // Check of argument count and their types
    if (args.Length() != 3) {
        isolate->ThrowException(Exception::TypeError(String::String::NewFromUtf8(isolate, "Three arguments are required - String, Number, and a callback")));
        return;
    }
    if (!args[0]->IsString()) {
        isolate->ThrowException(Exception::TypeError(String::String::NewFromUtf8(isolate, "First argument must be of String type")));
        return;
    }
    if (!args[1]->IsNumber()) {
        isolate->ThrowException(Exception::TypeError(String::String::NewFromUtf8(isolate, "Second argument must be of Number type")));
        return;
    }
    if (!args[2]->IsFunction()) {
        isolate->ThrowException(Exception::TypeError(String::String::NewFromUtf8(isolate, "Third argument must be of Function type")));
        return;
    }

    // Create our data structure that will be passed around
    AsyncData *asyncData = new AsyncData;
    // Duplicate the path value to prevent garbage-collection of the original value
    asyncData->path = strdup(*String::Utf8Value(args[0]->ToString()));
    asyncData->amode = args[1]->Uint32Value();
    // Create a persistent reference to callback function so it will not get garbage-collected
    asyncData->callback.Reset(isolate, args[2].As<Function>());

    // Create an async work token and assign our data structure to it
    uv_work_t *req = new uv_work_t;
    req->data = asyncData;

    // Pass the work token to libuv to be run when a worker-thread is available to
    uv_queue_work(
        uv_default_loop(),
        req,                           // Work token
        AsyncWork,                     // Work function
        (uv_after_work_cb) AsyncAfter  // Function to run when complete
    );
}
