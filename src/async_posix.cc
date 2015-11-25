#include <unistd.h> // access()
#include <string.h> // strdup()
#include "async.h"

using namespace Nan;
using v8::Function;
using v8::Value;
using v8::String;
using v8::Local;

#include "async_generic.h"

AsyncWorker* platformAccessAsync(Local<Value> path, unsigned int mode, Callback* callback) {

    // Duplicate the path value to prevent garbage-collection of the original value
    char *pathStr = strdup(*String::Utf8Value(path));

    return new AccessWorker<char>(pathStr, mode, callback);
}
