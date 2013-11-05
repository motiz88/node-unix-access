#include <node.h>
#include "sync.h"
#include "async.h"

using namespace v8;

void Init(Handle<Object> exports, Handle<Object> module) {
    exports->Set(String::NewSymbol("accessSync"),
        FunctionTemplate::New(accessSync)->GetFunction());
    exports->Set(String::NewSymbol("accessAsync"),
        FunctionTemplate::New(accessAsync)->GetFunction());
}

NODE_MODULE(access, Init)
