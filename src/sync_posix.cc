#include <unistd.h> // access()
#include "sync.h"

using namespace Nan;
using v8::String;
using v8::Value;
using v8::Local;

int platformAccessSync(Local<Value> path, unsigned int mode) {
    return access(*String::Utf8Value(path), mode);
}
