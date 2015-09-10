#include "sync.h"
#include "async.h"

using namespace Nan;
using v8::FunctionTemplate;
using v8::String;

// registers sync and async as functions of a module
NAN_MODULE_INIT(Init) {
    Set(target, New<String>("accessSync").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(accessSync)).ToLocalChecked());

    Set(target, New<String>("accessAsync").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(accessAsync)).ToLocalChecked());
}

// invokes functions' registration
NODE_MODULE(access, Init)
