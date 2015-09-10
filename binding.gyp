{
    "targets": [
        {
            "target_name": "access",
            "sources": [
                "src/access.cc",
                "src/sync.cc",
                "src/async.cc"
            ],
            "include_dirs" : [ "<!(node -e \"require('nan')\")" ]
        }
    ]
}