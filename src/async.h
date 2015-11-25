#include <nan.h>

NAN_METHOD(accessAsync);
Nan::AsyncWorker* platformAccessAsync(v8::Local<v8::Value> path, unsigned int mode, Nan::Callback* callback);
