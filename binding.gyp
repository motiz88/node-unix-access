{
    "targets": [
        {
            "target_name": "access",
            "sources": [
                "src/access.cc",
                "src/sync.cc",
                "src/sync_posix.cc",
                "src/sync_win.cc",
                "src/async.cc",
                "src/async_posix.cc",
                "src/async_win.cc"
            ],
            "include_dirs" : [ "<!(node -e \"require('nan')\")" ],
            "conditions": [
                ['OS!="linux"', {'sources/': [['exclude', '_linux\\.cc$']]}],
                ['OS!="mac"', {'sources/': [['exclude', '_mac\\.cc|mm?$']]}],
                ['OS!="win"', {'sources/': [['exclude', '_win\\.cc$']]}],
                ['OS=="win"', {'sources/': [['exclude', '_posix\\.cc$']]}]
            ]
        }
    ]
}