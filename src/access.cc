#include <node.h>
#include "sync.h"
#include "async.h"

using namespace v8;

// registers sync and async as functions of a module
void Init(Handle<Object> exports) {
    NODE_SET_METHOD(exports, "accessSync", accessSync);
    NODE_SET_METHOD(exports, "accessAsync", accessAsync);
}

// invokes functions' registration
NODE_MODULE(access, Init)
