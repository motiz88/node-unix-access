#include <io.h> // _waccess()
#include <wchar.h>
#include "sync.h"

using namespace Nan;
using v8::String;
using v8::Value;
using v8::Local;

int platformAccessSync(Local<Value> path, unsigned int mode) {
    return _waccess(reinterpret_cast<const wchar_t*>(*String::Value(path)), mode);
}
