#include "sync.h"

using namespace Nan;
using v8::String;

NAN_METHOD(accessSync) {
    if (info.Length() != 2) {
        ThrowTypeError("Two arguments are required - String and Number");
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

    int ret = platformAccessSync(info[0]->ToString(), info[1]->Uint32Value());

    // access returns 0 in case the access to the path is granted
    info.GetReturnValue().Set(ret == 0);
}
