#include <node.h>
#include <unistd.h>
#include "sync.h"

using namespace v8;

void accessSync(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    if (args.Length() != 2) {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Two arguments are required - String and Number")));
        return;
    }

    if (!args[0]->IsString()) {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "First argument must be of String type")));
        return;
    }

    if (!args[1]->IsNumber()) {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Second argument must be of Number type")));
        return;
    }

    int ret = access(*String::Utf8Value(args[0]->ToString()), args[1]->NumberValue());

    // access returns 0 in case the access to the path is granted
    args.GetReturnValue().Set(ret == 0);
}
