/**
 * Created by maddoxw on 7/18/16.
 */

require.config({
    baseUrl: '../app',  // development
    // baseUrl: '/',  // production
    // urlArgs: 'bust=' + (new Date()).getTime(),
    // deps: ['main/main'],
    // waitSeconds: 10,
    paths: {
        'serversettings': 'main/settings.dev',  // development
        // serversettings': 'main/settings.prod',  // production
        'jquery': 'bower_components/jquery/dist/jquery',
        'jquery-ui': 'bower_components/jquery-ui/jquery-ui',
        'jsonix': 'bower_components/jsonix/dist/Jsonix-all',
        'WFS_2_0': 'bower_components/ogc-schemas/scripts/lib/WFS_2_0',
        'WFS_1_1_0': 'bower_components/ogc-schemas/scripts/lib/WFS_1_1_0',
        'XLink_1_0': 'bower_components/w3c-schemas/scripts/lib/XLink_1_0',
        'GML_3_1_1': 'bower_components/ogc-schemas/scripts/lib/GML_3_1_1',
        'OWS_1_0_0': 'bower_components/ogc-schemas/scripts/lib/OWS_1_0_0',
        'OWS_1_1_0': 'bower_components/ogc-schemas/scripts/lib/OWS_1_1_0',
        'Filter_2_0': 'bower_components/ogc-schemas/scripts/lib/Filter_2_0',
        'Filter_1_1_0': 'bower_components/ogc-schemas/scripts/lib/Filter_1_1_0',
        'SMIL_2_0': 'bower_components/ogc-schemas/scripts/lib/SMIL_2_0',
        'SMIL_2_0_Language': 'bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language',
        // 'ol': 'js/libs/ol3-3.19.1/ol',
        'ol': 'js/libs/ol3-3.19.1/ol-debug',
        'jsts': 'js/libs/jsts-1.2.1/jsts.min',
        'layerswitcher': 'js/libs/ol3-layerswitcher/ol3-layerswitcher',
        'shp': 'js/libs/gitmodules/shapefile-js/dist/shp',
        'domReady': 'js/libs/domReady',
        'wfs110context': 'main/WFS110Context',
        'wfs200context': 'main/WFS200Context',
        'ispointinpoly': 'main/geometry/ispointinpoly',
        'ispolyvalid': 'main/geometry/ispolyvalid',
        'doespolycoverhole': 'main/geometry/doespolycoverhole',
        'deg2tile': 'main/tools/deg2tile',
        'exists': 'main/utils/exists',
        'defaultsensors': 'main/utils/defaultsensors',
        'layertree': 'main/layertree',
        'toolbar': 'main/toolbar',
        'layerinteractor': 'main/layerinteractor',
        'featureeditor': 'main/featureeditor',
        'cameraeditor': 'main/cameraeditor',
        'ttemplate': 'main/tobjects/template',
        'tstylefunction': 'main/tobjects/stylefunction',
        'stemplate': 'main/sensors/template',
        'sstylefunction': 'main/sensors/stylefunction',
        'bingkey': ['main/bingkey', 'main/bingkey-sample'],
        'main': 'main/main'
        'utils': 'utils/utils',
    },
    shim: {
        'jquery': {
            exports: 'jquery'
        },
        'ol': {
            exports: 'ol'
        },
        'layerswitcher': {
            deps: ['ol'],
            exports: 'layerswitcher'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'jsts': {
            deps: ['ol']
        },
        'layertree': {
            deps: ['jquery-ui', 'ol']
        },
        'toolbar': {
            deps: ['ol']
        },
        // OWS_1_0_0: {
        //     deps: ['XLink_1_0'],
        //     exports: 'OWS_1_0_0'
        // },
        // GML_3_1_1: {
        //     deps: ['XLink_1_0', 'SMIL_2_0_Language'],
        //     exports: 'GML_3_1_1'
        // },
        // Filter_1_1_0: {
        //     deps: ['GML_3_1_1']
        // },
        'WFS_1_1_0': {
            deps: ['OWS_1_0_0', 'Filter_1_1_0', 'GML_3_1_1']
        },
        'WFS_2_0': {
            deps: ['OWS_1_1_0', 'Filter_2_0', 'GML_3_1_1']
        }
    }
});

// require(['main'], function(main) {
//     main.init();
// });

require(['main'], function(main) {});
// require(['domReady!'], function (doc) {
//     //This function is called once the DOM is ready,
//     //notice the value for 'domReady!' is the current
//     //document.
// });
