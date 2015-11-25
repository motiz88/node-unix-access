#include "async.h"

using namespace Nan;
using v8::Boolean;
using v8::Function;
using v8::Local;
using v8::Value;
using v8::String;

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
    
    wchar_t *path = _wcsdup(reinterpret_cast<const wchar_t*>(*String::Value(info[0]->ToString())));
    int  mode = info[1]->Uint32Value();
    Callback *callback = new Callback(info[2].As<Function>());

    AsyncQueueWorker(platformAccessAsync(info[0]->ToString(), mode, callback));
}
