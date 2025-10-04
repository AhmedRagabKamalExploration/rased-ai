```doc
{
    "content": {
        "skipToContent": [
            {
                "eventId": "7a0f73eb-7a88-4b82-ab55-d50fa176e376",
                "eventType": "skipToContent",
                "timestamp": 1759545730894,
                "payload": {
                    "exists": true,
                    "text": "Skip to content",
                    "href": "#start-of-content"
                }
            }
        ],
        "screen": [
            {
                "eventId": "96b2eb11-8645-4bcd-85c2-654d46c9f522",
                "eventType": "screen",
                "timestamp": 1759545730894,
                "payload": {
                    "devicePixelRatio": 2,
                    "availHeight": 883,
                    "availLeft": 0,
                    "availTop": 34,
                    "availWidth": 1512,
                    "colorDepth": 30,
                    "height": 982,
                    "innerHeight": 795,
                    "innerWidth": 749,
                    "left": 0,
                    "pixelDepth": 30,
                    "top": 0,
                    "width": 1512,
                    "timestamp": 1759545730894
                }
            }
        ],
        "network": [
            {
                "eventId": "9a772574-9f56-4bc9-b669-d3cabb9276e8",
                "eventType": "network",
                "timestamp": 1759545730945,
                "payload": {
                    "isOnline": true,
                    "effectiveType": "4g",
                    "roundTripTime": 100,
                    "downlink": 10
                }
            }
        ],
        "timezone-language": [
            {
                "eventId": "f675eba4-12b0-4e23-a4a3-2f96b23fbfb3",
                "eventType": "localization",
                "timestamp": 1759545730947,
                "payload": {
                    "timezone": "Asia/Dubai",
                    "language": "en-US",
                    "languages": [
                        "en-US",
                        "en"
                    ]
                }
            }
        ],
        "perf": [
            {
                "eventId": "eb356c96-d250-49ff-8a36-717c661e2d90",
                "eventType": "perf",
                "timestamp": 1759545731016,
                "payload": {
                    "pageLoadMs": 1324,
                    "navigationTiming": {
                        "navigationStart": 1759545725567,
                        "unloadEventStart": 0,
                        "unloadEventEnd": 0,
                        "redirectStart": 0,
                        "redirectEnd": 0,
                        "fetchStart": 1759545725569,
                        "domainLookupStart": 1759545725591,
                        "domainLookupEnd": 1759545725591,
                        "connectStart": 1759545725591,
                        "connectEnd": 1759545725591,
                        "secureConnectionStart": 0,
                        "requestStart": 1759545725591,
                        "responseStart": 1759545726720,
                        "responseEnd": 1759545726725,
                        "domLoading": 1759545726726,
                        "domInteractive": 1759545726750,
                        "domContentLoadedEventStart": 1759545726750,
                        "domContentLoadedEventEnd": 1759545726750,
                        "domComplete": 1759545726891,
                        "loadEventStart": 1759545726891,
                        "loadEventEnd": 1759545726891
                    },
                    "resourceTiming": {
                        "totalResources": 26,
                        "totalSize": 834922,
                        "averageLoadTime": 142.5769230769589,
                        "slowestResource": {
                            "name": "http://localhost:8000/v1/config",
                            "entryType": "resource",
                            "startTime": 1317.3999999999069,
                            "duration": 2921.4000000003725,
                            "initiatorType": "fetch",
                            "deliveryType": "",
                            "nextHopProtocol": "",
                            "renderBlockingStatus": "non-blocking",
                            "workerStart": 0,
                            "workerRouterEvaluationStart": 0,
                            "workerCacheLookupStart": 0,
                            "workerMatchedSourceType": "",
                            "workerFinalSourceType": "",
                            "redirectStart": 0,
                            "redirectEnd": 0,
                            "fetchStart": 1317.3999999999069,
                            "domainLookupStart": 0,
                            "domainLookupEnd": 0,
                            "connectStart": 0,
                            "secureConnectionStart": 0,
                            "connectEnd": 0,
                            "requestStart": 0,
                            "responseStart": 0,
                            "firstInterimResponseStart": 0,
                            "finalResponseHeadersStart": 0,
                            "responseEnd": 4238.800000000279,
                            "transferSize": 0,
                            "encodedBodySize": 0,
                            "decodedBodySize": 0,
                            "responseStatus": 200,
                            "serverTiming": []
                        },
                        "resourceTypes": {
                            "script": 21,
                            "stylesheet": 1,
                            "image": 0,
                            "font": 3,
                            "document": 1,
                            "other": 0
                        }
                    },
                    "memoryUsage": {
                        "usedJSHeapSize": 25359868,
                        "totalJSHeapSize": 29563460,
                        "jsHeapSizeLimit": 4294705152
                    },
                    "connectionInfo": {
                        "effectiveType": "4g",
                        "downlink": 10,
                        "rtt": 100,
                        "saveData": false
                    },
                    "timestamp": 1759545731016
                }
            },
            {
                "eventId": "9cc5e949-64cf-4c62-bd66-a00f2735297d",
                "eventType": "longTasks",
                "timestamp": 1759545731074,
                "payload": {
                    "tasks": [
                        {
                            "duration": 178,
                            "startTime": 5324.399999999907,
                            "name": "self"
                        }
                    ],
                    "timestamp": 1759545731074
                }
            }
        ],
        "plugins": [
            {
                "eventId": "a0a44573-b77a-4bd1-a2a0-8f7de4241738",
                "eventType": "plugins",
                "timestamp": 1759545731019,
                "payload": {
                    "plugins": [
                        {
                            "name": "PDF Viewer",
                            "description": "Portable Document Format",
                            "filename": "internal-pdf-viewer",
                            "mime": [
                                {
                                    "type": "application/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                },
                                {
                                    "type": "text/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                }
                            ]
                        },
                        {
                            "name": "Chrome PDF Viewer",
                            "description": "Portable Document Format",
                            "filename": "internal-pdf-viewer",
                            "mime": [
                                {
                                    "type": "application/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                },
                                {
                                    "type": "text/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                }
                            ]
                        },
                        {
                            "name": "Chromium PDF Viewer",
                            "description": "Portable Document Format",
                            "filename": "internal-pdf-viewer",
                            "mime": [
                                {
                                    "type": "application/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                },
                                {
                                    "type": "text/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                }
                            ]
                        },
                        {
                            "name": "Microsoft Edge PDF Viewer",
                            "description": "Portable Document Format",
                            "filename": "internal-pdf-viewer",
                            "mime": [
                                {
                                    "type": "application/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                },
                                {
                                    "type": "text/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                }
                            ]
                        },
                        {
                            "name": "WebKit built-in PDF",
                            "description": "Portable Document Format",
                            "filename": "internal-pdf-viewer",
                            "mime": [
                                {
                                    "type": "application/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                },
                                {
                                    "type": "text/pdf",
                                    "description": "Portable Document Format",
                                    "suffixes": "pdf"
                                }
                            ]
                        }
                    ],
                    "timestamp": 1759545731019
                }
            }
        ],
        "timezone": [
            {
                "eventId": "46eb7d59-f7d4-49c7-bd9f-c309821fd69d",
                "eventType": "timezone",
                "timestamp": 1759545731019,
                "payload": {
                    "isDaylightSavingsTime": false,
                    "timezoneOffset": -240,
                    "timestamp": 1759545731019
                }
            }
        ],
        "malware": [
            {
                "eventId": "18873fa4-a753-47ca-88a1-d5ace7963a71",
                "eventType": "malware",
                "timestamp": 1759545731020,
                "payload": {
                    "hostSite": "localhost",
                    "urls": [
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_compiled_react-dom_6983aa28._.js",
                            "length": 90,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_compiled_next-devtools_index_602eb279.js",
                            "length": 98,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_compiled_64f77f07._.js",
                            "length": 80,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_client_8fc53f0d._.js",
                            "length": 78,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_1c3aa617._.js",
                            "length": 71,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/69652_%40swc_helpers_cjs_77b72907._.js",
                            "length": 80,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/apps_web_a0ff3932._.js",
                            "length": 64,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/turbopack-apps_web_58f542e6._.js",
                            "length": 74,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/apps_web_app_layout_tsx_9add485f._.js",
                            "length": 79,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_client_components_builtin_global-error_e487e645.js",
                            "length": 108,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_47731d69._.js",
                            "length": 71,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/apps_web_app_favicon_ico_mjs_90ecd11a._.js",
                            "length": 84,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/3d567_next_dist_build_polyfills_polyfill-nomodule.js",
                            "length": 94,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/_63222e8d._.js",
                            "length": 56,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/node_modules__pnpm_e3ae0c47._.js",
                            "length": 74,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/apps_web_app_page_tsx_e487e645._.js",
                            "length": 77,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/_63222e8d._.js",
                            "length": 56,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/node_modules__pnpm_e3ae0c47._.js",
                            "length": 74,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/apps_web_app_page_tsx_e487e645._.js",
                            "length": 77,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_c8c997ce._.js",
                            "length": 108,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "http://localhost:3000/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_d5deddd7._.js",
                            "length": 108,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": false,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        },
                        {
                            "url": "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
                            "length": 62,
                            "htmlSection": "HEAD",
                            "isSuspiciouslyLong": false,
                            "isCrossDomain": true,
                            "containsIPAddress": false,
                            "isExecutable": true,
                            "isMalicious": false
                        }
                    ],
                    "numberOfInputFields": 2,
                    "inputFields": [
                        {
                            "id": "82244417f956ac7c599f191593f7e441a4fafa20a4158fd52e154f1dc4c8ed92",
                            "label": "969ccbd3cf6300ecd5c880459d81ae9027df7517563184a1b8b15282db230621",
                            "top": 93,
                            "right": 374.5,
                            "bottom": 123,
                            "left": 0
                        },
                        {
                            "id": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                            "label": "e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a",
                            "top": 161.5,
                            "right": 374.5,
                            "bottom": 191.5,
                            "left": 0
                        }
                    ],
                    "hasIFrame": false,
                    "inlineJavaScriptContent": [],
                    "timestamp": 1759545731020
                }
            }
        ],
        "referrerUrl": [
            {
                "eventId": "316be845-24bb-4e88-8d38-2ca15fca95c1",
                "eventType": "referrerUrl",
                "timestamp": 1759545731020,
                "payload": {
                    "referrerUrl": "direct",
                    "timestamp": 1759545731020
                }
            }
        ],
        "browserFeatures": [
            {
                "eventId": "22ca8057-1afd-4a98-8fce-c38d10be3116",
                "eventType": "browserFeatures",
                "timestamp": 1759545731020,
                "payload": {
                    "storage": [
                        1,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0
                    ],
                    "html5": [
                        1,
                        0,
                        1,
                        1,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        0,
                        0
                    ],
                    "es": [
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ],
                    "graphics": [
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ],
                    "network": [
                        1,
                        1,
                        1,
                        1,
                        0,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ],
                    "css": [
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ],
                    "misc": [
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1
                    ],
                    "timestamp": 1759545731020
                }
            }
        ],
        "teamViewerFont": [
            {
                "eventId": "00ab2c4f-d143-4321-82de-ec0ebf02d500",
                "eventType": "teamViewerFont",
                "timestamp": 1759545731020,
                "payload": {
                    "teamViewerFonts": [],
                    "timestamp": 1759545731020
                }
            }
        ],
        "screenOrientation": [
            {
                "eventId": "07df0115-4e78-4644-9151-fcb3c2578548",
                "eventType": "screenOrientation",
                "timestamp": 1759545731021,
                "payload": {
                    "type": "landscape-primary",
                    "angle": 0,
                    "timestamp": 1759545731021
                }
            }
        ],
        "pageMonitoring": [
            {
                "eventId": "1267e6b4-d0f6-463f-95bb-82b3ebf79f38",
                "eventType": "pageMonitoring",
                "timestamp": 1759545731021,
                "payload": {
                    "eventType": "PAGE_LOAD",
                    "pageTime": 1321.8000000002794,
                    "timestamp": 5453.600000000093
                }
            }
        ],
        "visibilityChange": [
            {
                "eventId": "af098d5c-0d6b-4f87-87c9-010d47493a42",
                "eventType": "visibilityChange",
                "timestamp": 1759545731021,
                "payload": {
                    "visibilityState": "visible",
                    "changeCount": 0,
                    "timestamp": 5453.700000000186,
                    "browserSupport": true,
                    "isInitialState": true
                }
            }
        ],
        "canvas": [
            {
                "eventId": "751503ba-c211-4a7a-82f5-69b209fbf1da",
                "eventType": "canvas",
                "timestamp": 1759545731069,
                "payload": {
                    "short": "46276647266723741664b4b364742d81",
                    "long": "2614664742252785814616563744644246276647266723741664b4b364742d81"
                }
            }
        ],
        "automation-detection": [
            {
                "eventId": "6ff39a59-9c2d-4479-94ce-c44c95dc1a1e",
                "eventType": "automation",
                "timestamp": 1759545731069,
                "payload": {
                    "webdriver": false,
                    "selenium": false,
                    "phantomjs": false,
                    "chromeDevTools": false,
                    "additionalTools": false,
                    "behavioralAnalysis": false,
                    "overallAutomation": false
                }
            }
        ],
        "math": [
            {
                "eventId": "554cbe53-9653-4c97-9e3c-8e579797f8b3",
                "eventType": "math",
                "timestamp": 1759545731070,
                "payload": {
                    "hash": "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
                    "timestamp": 1759545731070
                }
            }
        ],
        "device": [
            {
                "eventId": "401bf16e-26e0-49ae-ad7f-69ca00a4721d",
                "eventType": "device",
                "timestamp": 1759545731070,
                "payload": {
                    "hardwareConcurrency": 12,
                    "language": "en-US",
                    "languages": [
                        "en-US",
                        "en"
                    ],
                    "platform": "MacIntel",
                    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                    "gpuVendor": "Google Inc. (Apple)",
                    "gpuModel": "ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)",
                    "colorGamut": "p3",
                    "deviceMemory": 8,
                    "timestamp": 1759545731019
                }
            }
        ],
        "WebGL": [
            {
                "eventId": "f6422feb-7bc4-4f7c-beba-ec1c3e819274",
                "eventType": "webgl",
                "timestamp": 1759545731071,
                "payload": {
                    "supported": true,
                    "renderHash": "data:image/png;base64,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",
                    "paramsHash": "a58547d439166e4f4a9b000a80388e2114f24e12b2795c26330cfd4f3bcc47bb",
                    "parameters": {
                        "vendor": "WebKit",
                        "renderer": "WebKit WebGL",
                        "unmaskedVendor": "Google Inc. (Apple)",
                        "unmaskedRenderer": "ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)",
                        "version": "WebGL 1.0 (OpenGL ES 2.0 Chromium)",
                        "shading_language_version": "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)",
                        "max_texture_size": 16384,
                        "max_viewport_dims": {
                            "0": 16384,
                            "1": 16384
                        },
                        "max_vertex_attribs": 16,
                        "max_vertex_uniform_vectors": 1024,
                        "max_varying_vectors": 30,
                        "max_combined_texture_image_units": 32,
                        "max_vertex_texture_image_units": 16,
                        "max_texture_image_units": 16,
                        "max_renderbuffer_size": 16384,
                        "supportedExtensions": [
                            "ANGLE_instanced_arrays",
                            "EXT_blend_minmax",
                            "EXT_clip_control",
                            "EXT_color_buffer_half_float",
                            "EXT_depth_clamp",
                            "EXT_disjoint_timer_query",
                            "EXT_float_blend",
                            "EXT_frag_depth",
                            "EXT_polygon_offset_clamp",
                            "EXT_shader_texture_lod",
                            "EXT_texture_compression_bptc",
                            "EXT_texture_compression_rgtc",
                            "EXT_texture_filter_anisotropic",
                            "EXT_texture_mirror_clamp_to_edge",
                            "EXT_sRGB",
                            "KHR_parallel_shader_compile",
                            "OES_element_index_uint",
                            "OES_fbo_render_mipmap",
                            "OES_standard_derivatives",
                            "OES_texture_float",
                            "OES_texture_float_linear",
                            "OES_texture_half_float",
                            "OES_texture_half_float_linear",
                            "OES_vertex_array_object",
                            "WEBGL_blend_func_extended",
                            "WEBGL_color_buffer_float",
                            "WEBGL_compressed_texture_astc",
                            "WEBGL_compressed_texture_etc",
                            "WEBGL_compressed_texture_etc1",
                            "WEBGL_compressed_texture_pvrtc",
                            "WEBGL_compressed_texture_s3tc",
                            "WEBGL_compressed_texture_s3tc_srgb",
                            "WEBGL_debug_renderer_info",
                            "WEBGL_debug_shaders",
                            "WEBGL_depth_texture",
                            "WEBGL_draw_buffers",
                            "WEBGL_lose_context",
                            "WEBGL_multi_draw",
                            "WEBGL_polygon_mode"
                        ]
                    }
                }
            }
        ],
        "browser": [
            {
                "eventId": "f851b5d8-13ac-45ca-8730-654474555a30",
                "eventType": "browser",
                "timestamp": 1759545731071,
                "payload": {
                    "fingerprint": "a380d9767ca28b7dc0f06b16481809ce6a815ab0bb16fc2d24c30921f1fa8e4c",
                    "identity": {
                        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                        "vendor": "Google Inc.",
                        "platform": "MacIntel",
                        "language": "en-US",
                        "languages": [
                            "en-US",
                            "en"
                        ]
                    },
                    "plugins": {
                        "count": 5,
                        "names": [
                            "Chrome PDF Viewer",
                            "Chromium PDF Viewer",
                            "Microsoft Edge PDF Viewer",
                            "PDF Viewer",
                            "WebKit built-in PDF"
                        ]
                    },
                    "hardware": {
                        "cpuCores": 12,
                        "deviceMemory": 8,
                        "isCookieEnabled": true
                    },
                    "privacy": {
                        "doNotTrack": null
                    }
                }
            }
        ],
        "browserType": [
            {
                "eventId": "db6ca8cc-ae2d-46cc-86ec-23b79abe8e08",
                "eventType": "browserType",
                "timestamp": 1759545731072,
                "payload": {
                    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                    "browser": {
                        "name": "Chrome",
                        "version": "140.0.0.0",
                        "majorVersion": "140"
                    },
                    "os": {
                        "name": "Macintosh",
                        "version": "unknown"
                    },
                    "deviceType": "DESKTOP",
                    "screen": {
                        "width": 1512,
                        "height": 982
                    },
                    "clientHints": {
                        "brands": [
                            {
                                "brand": "Chromium",
                                "version": "140"
                            },
                            {
                                "brand": "Not=A?Brand",
                                "version": "24"
                            },
                            {
                                "brand": "Google Chrome",
                                "version": "140"
                            }
                        ],
                        "mobile": false,
                        "platform": "macOS",
                        "architecture": "arm",
                        "bitness": "64",
                        "model": "",
                        "platformVersion": "26.0.1",
                        "uaFullVersion": "140.0.7339.214",
                        "wow64": false
                    },
                    "timestamp": 1759545731072
                }
            }
        ],
        "clientHints": [
            {
                "eventId": "fa420151-b19e-4c2a-99a7-bc59ef7f5dee",
                "eventType": "clientHints",
                "timestamp": 1759545731072,
                "payload": {
                    "cpuArch": "arm",
                    "chOsVersion": "26.0.1",
                    "chConnection": "4g",
                    "chBitness": "64",
                    "chOs": "macOS",
                    "chModel": null,
                    "chMobile": false,
                    "chRtt": 100,
                    "chDownlink": 10,
                    "chFullVersionList": "[{\"brand\":\"Chromium\",\"version\":\"140\"},{\"brand\":\"Not=A?Brand\",\"version\":\"24\"},{\"brand\":\"Google Chrome\",\"version\":\"140\"}]",
                    "chWow64": 0,
                    "chMobileNullable": 0,
                    "chSaveData": 0,
                    "timestamp": 1759545731072
                }
            }
        ],
        "browserSpeech": [
            {
                "eventId": "534bf36f-79b3-44a2-8b33-53410e876b63",
                "eventType": "browserSpeech",
                "timestamp": 1759545731073,
                "payload": {
                    "hash": "9bca03b3076c39d443baa91ce1992f1e95cf44ec35a809e1b2835f42c8c065b2",
                    "timestamp": 1759545731073
                }
            }
        ],
        "media": [
            {
                "eventId": "b9b07c41-ef0b-43a8-bc67-7638516b9c92",
                "eventType": "media",
                "timestamp": 1759545731074,
                "payload": {
                    "audioInput": [
                        {
                            "id": "",
                            "kind": "audioinput",
                            "isCustomLabel": false,
                            "label": "Microphone 1"
                        }
                    ],
                    "audioOutput": [
                        {
                            "id": "",
                            "kind": "audiooutput",
                            "isCustomLabel": false,
                            "label": "Speaker 1"
                        }
                    ],
                    "videoInput": [
                        {
                            "id": "",
                            "kind": "videoinput",
                            "isCustomLabel": false,
                            "label": "Camera 1"
                        }
                    ],
                    "hasMicrophone": true,
                    "hasSpeakers": true,
                    "hasWebcam": true,
                    "timestamp": 1759545731074
                }
            }
        ],
        "audio": [
            {
                "eventId": "646e5a4a-4c6e-40fa-a657-40040c91587f",
                "eventType": "audio",
                "timestamp": 1759545731091,
                "payload": {
                    "supported": true,
                    "fingerprint": "40270e195df23e8e6a9d9fb73dd0e1c0bb167ccc30b7ce1f21f25353dc6da929"
                }
            }
        ],
        "adblock": [
            {
                "eventId": "31cb3dc1-9d41-4f35-80bc-d48bd0c6a822",
                "eventType": "adblock",
                "timestamp": 1759545731091,
                "payload": {
                    "hasAdblocker": true,
                    "timestamp": 1759545731091,
                    "detectionMethod": "dom-manipulation-and-resource-check"
                }
            }
        ],
        "font": [
            {
                "eventId": "a51b9f64-dd9b-4010-a6a3-16d5d013588b",
                "eventType": "font",
                "timestamp": 1759545731092,
                "payload": {
                    "supported": true,
                    "fingerprint": "935ba8a571dfe84b0a3e6559d4134eb9365ad97a7392a064e66105e82da3c311",
                    "analysis": {
                        "installedFonts": [
                            "Arial",
                            "Helvetica",
                            "Times New Roman",
                            "Times",
                            "Courier New",
                            "Courier",
                            "Verdana",
                            "Georgia",
                            "Palatino",
                            "Comic Sans MS",
                            "Trebuchet MS",
                            "Arial Black",
                            "Impact",
                            "Tahoma",
                            "Geneva",
                            "Optima",
                            "Helvetica Neue",
                            "Monaco"
                        ],
                        "totalFontsChecked": 34,
                        "detectionMethod": "dimension-measurement",
                        "processingTime": 16
                    },
                    "context": {
                        "baselineDimensions": {
                            "width": 1561,
                            "height": 84
                        },
                        "fallbackFont": "monospace"
                    }
                }
            }
        ],
        "isPrivateBrowser": [
            {
                "eventId": "20b53a83-dcae-415e-a806-bdcb699081b5",
                "eventType": "isPrivateBrowser",
                "timestamp": 1759545731093,
                "payload": {
                    "isPrivateBrowser": false,
                    "detectionMethod": -1,
                    "timestamp": 1759545731093
                }
            }
        ],
        "trueId": [
            {
                "eventId": "55c56b6d-b515-42ae-adf9-2a075d5a17e3",
                "eventType": "trueId",
                "timestamp": 1759545731093,
                "payload": {
                    "trueId": "aedc2da2",
                    "fullHash": "60e05bd1b195af2f94112fa7197a5c88289058840ce7c6df9693756bc6250f55"
                }
            }
        ],
        "device-orientation": [
            {
                "eventId": "a8da0ddc-e5c4-4226-844b-cae64e26b3fe",
                "eventType": "device-motion",
                "timestamp": 1759545731108,
                "payload": {
                    "acceleration": {
                        "x": null,
                        "y": null,
                        "z": null
                    },
                    "accelerationIncludingGravity": {
                        "x": null,
                        "y": null,
                        "z": null
                    },
                    "rotationRate": {
                        "alpha": null,
                        "beta": null,
                        "gamma": null
                    },
                    "interval": 16
                }
            }
        ],
        "binding": [
            {
                "eventId": "923ccdb5-ca95-498d-8daa-9859a2e38f39",
                "eventType": "binding",
                "timestamp": 1759545731138,
                "payload": {
                    "data": [
                        113,
                        199,
                        137,
                        129,
                        29,
                        177,
                        25,
                        225,
                        74,
                        138
                    ],
                    "signature": [
                        7,
                        125,
                        31,
                        244,
                        137,
                        127,
                        175,
                        71,
                        152,
                        235,
                        70,
                        45,
                        90,
                        73,
                        162,
                        222,
                        101,
                        201,
                        34,
                        176,
                        106,
                        130,
                        96,
                        94,
                        252,
                        210,
                        202,
                        244,
                        173,
                        142,
                        2,
                        189,
                        183,
                        65,
                        71,
                        48,
                        194,
                        37,
                        68,
                        121,
                        68,
                        146,
                        10,
                        94,
                        193,
                        86,
                        235,
                        82,
                        160,
                        13,
                        169,
                        1,
                        176,
                        249,
                        162,
                        246,
                        113,
                        201,
                        247,
                        121,
                        142,
                        6,
                        27,
                        60,
                        139,
                        76,
                        107,
                        157,
                        19,
                        94,
                        46,
                        215,
                        86,
                        247,
                        19,
                        248,
                        128,
                        198,
                        76,
                        30,
                        115,
                        174,
                        155,
                        171,
                        165,
                        202,
                        11,
                        209,
                        175,
                        186,
                        152,
                        253,
                        102,
                        185,
                        163,
                        23,
                        210,
                        215,
                        73,
                        216,
                        109,
                        107,
                        130,
                        85,
                        228,
                        131,
                        205,
                        46,
                        78,
                        135,
                        77,
                        178,
                        166,
                        74,
                        201,
                        131,
                        216,
                        200,
                        57,
                        55,
                        65,
                        229,
                        91,
                        216,
                        222,
                        62,
                        120,
                        125,
                        145,
                        103,
                        1,
                        195,
                        218,
                        234,
                        29,
                        61,
                        57,
                        48,
                        155,
                        153,
                        7,
                        103,
                        228,
                        89,
                        160,
                        81,
                        27,
                        145,
                        136,
                        205,
                        177,
                        39,
                        241,
                        220,
                        180,
                        156,
                        161,
                        235,
                        237,
                        88,
                        178,
                        37,
                        247,
                        209,
                        80,
                        22,
                        71,
                        181,
                        121,
                        85,
                        213,
                        148,
                        180,
                        55,
                        245,
                        117,
                        37,
                        61,
                        83,
                        252,
                        94,
                        58,
                        158,
                        22,
                        113,
                        57,
                        114,
                        57,
                        133,
                        223,
                        245,
                        235,
                        149,
                        19,
                        105,
                        238,
                        219,
                        151,
                        26,
                        250,
                        25,
                        134,
                        226,
                        60,
                        190,
                        67,
                        110,
                        41,
                        159,
                        236,
                        101,
                        142,
                        171,
                        31,
                        131,
                        54,
                        118,
                        62,
                        202,
                        69,
                        22,
                        19,
                        29,
                        25,
                        12,
                        239,
                        245,
                        162,
                        154,
                        102,
                        23,
                        72,
                        252,
                        76,
                        205,
                        146,
                        68,
                        14,
                        89,
                        20,
                        169,
                        199,
                        41,
                        99,
                        13,
                        183,
                        186,
                        80,
                        254,
                        173,
                        75,
                        195,
                        90,
                        65,
                        60,
                        134
                    ],
                    "publicKey": {
                        "alg": "RS256",
                        "e": "AQAB",
                        "ext": true,
                        "key_ops": [
                            "verify"
                        ],
                        "kty": "RSA",
                        "n": "ktrXujAHRT-kGZKeaoRxHuPpHzNxuXLZ8kOEYq-WLCrZb00nTUr2pzugpw6V-B5kC8dje0UqcDWgjU6rWJ9fBfYI4T6CazYaVcQ-DLmar7Za4TwczH80RzcsITUO-kxeT-tZxO1TSIpjB1DbyS6QwBVlUdVH-gNANQ5JR6uJnJ2u2SQHZ2ysm3bfuA2KYC56jXOUaDZfa8JbudoqeYv8eBFvRqTZnaHIo0suZpJ5eHFD8cGf2NAJMvaThRZZsQ6hOTmRhI0tO8gQ3RLfGIBVUMKb8IGbyMEeb8M7Rj_Gh6__VZwrOdeZ1zPcOZyyAQCcCK6s3M2bhyLiKd21PMKLDQ"
                    },
                    "webInstanceId": "79412c1199f8824fd1a36fb87b76cb9e5ca78dc97aeeec29c99c91f7a16366fd",
                    "timestamp": 1759545731137
                }
            }
        ],
        "WebRTCIPModule": [
            {
                "eventId": "cdf188a7-b66d-465b-8003-3f1452e5ce1f",
                "eventType": "webrtc",
                "timestamp": 1759545731223,
                "payload": {
                    "supported": true,
                    "timedOut": false,
                    "candidates": {
                        "publicIPs": {
                            "ipv4": [
                                "217.164.46.79"
                            ],
                            "ipv6": [
                                "2001:8f8:1163:42f1:1958:d813:eade:e6a8"
                            ]
                        },
                        "localIPs": []
                    },
                    "rawCandidates": [
                        "candidate:691828962 1 udp 2113937151 8908aff5-db95-48f5-8d26-2e715b39860f.local 61962 typ host generation 0 ufrag KNAi network-cost 999",
                        "candidate:500808235 1 udp 2113939711 4899b30e-c641-442c-9b18-c4002471775a.local 51432 typ host generation 0 ufrag KNAi network-cost 999",
                        "candidate:1068412987 1 udp 1677729535 217.164.46.79 61962 typ srflx raddr 0.0.0.0 rport 0 generation 0 ufrag KNAi network-cost 999",
                        "candidate:459800929 1 udp 1677732095 2001:8f8:1163:42f1:1958:d813:eade:e6a8 51432 typ srflx raddr :: rport 0 generation 0 ufrag KNAi network-cost 999"
                    ]
                }
            }
        ]
    },
    "metadata": {
        "messageType": "BATCH",
        "collectionEventId": "2be383c7-fd44-48dc-8763-8b6153392b93",
        "organizationId": "org-demo-12345678-abcd-efgh-ijkl-mnopqrstuvwx",
        "transactionId": "txn-24c5d82c-c0e7-4512-8004-485e892af096",
        "sessionId": "ssn-747bac14-9815-4ab6-abf6-8c3aa7396b53",
        "deviceSessionType": "INITIATING",
        "deviceSessionId": "8f4b3b68be3023f9879ec4f9058e5aa4c00825d48f13315cc9a85fc8846261f1",
        "messageId": 0,
        "transactionEventPageId": null,
        "sdkVersion": "0.1.0",
        "origin": "http://localhost:3000",
        "channels": "WEB",
        "pageType": [
            "WEB_STANDARD"
        ]
    }
}

```
