#include <io.h> // _waccess()
#include <string.h> // _wcsdup()
#include <wchar.h>
#include "async.h"

using namespace Nan;
using v8::Function;
using v8::Value;
using v8::String;
using v8::Local;

#define access _waccess

#include "async_generic.h"

// Asynchronous access to the `access()` function
AsyncWorker* platformAccessAsync(Local<Value> path, unsigned int mode, Callback* callback) {

    // Duplicate the path value to prevent garbage-collection of the original value
    const uint16_t* path_u16 = *String::Value(path);
    wchar_t *pathStr = _wcsdup(reinterpret_cast<const wchar_t*>(path_u16));

    return new AccessWorker<wchar_t>(pathStr, mode, callback);
}
