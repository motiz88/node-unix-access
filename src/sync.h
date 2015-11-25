#include <nan.h>

NAN_METHOD(accessSync);
int platformAccessSync(v8::Local<v8::Value> path, unsigned int mode);
