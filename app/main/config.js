/**
 * Created by maddoxw on 7/18/16.
 */

require.config({
    baseUrl: "../app",  // development
    // baseUrl: "/",  // production
    // urlArgs: "bust=" + (new Date()).getTime(),
    // deps: ['main/main'],
    // waitSeconds: 10,
    paths: {
        serversettings: "main/settings.dev",  // development
        // serversettings: "main/settings.prod",  // production
        jquery: 'bower_components/jquery/dist/jquery',
        "jquery-ui": 'bower_components/jquery-ui/jquery-ui',
        jsonix: 'bower_components/jsonix/dist/Jsonix-all',
        WFS_2_0: "bower_components/ogc-schemas/scripts/lib/WFS_2_0",
        WFS_1_1_0: "bower_components/ogc-schemas/scripts/lib/WFS_1_1_0",
        XLink_1_0: 'bower_components/w3c-schemas/scripts/lib/XLink_1_0',
        GML_3_1_1: "bower_components/ogc-schemas/scripts/lib/GML_3_1_1",
        OWS_1_0_0: "bower_components/ogc-schemas/scripts/lib/OWS_1_0_0",
        OWS_1_1_0: "bower_components/ogc-schemas/scripts/lib/OWS_1_1_0",
        Filter_2_0: "bower_components/ogc-schemas/scripts/lib/Filter_2_0",
        Filter_1_1_0: "bower_components/ogc-schemas/scripts/lib/Filter_1_1_0",
        SMIL_2_0: "bower_components/ogc-schemas/scripts/lib/SMIL_2_0",
        SMIL_2_0_Language: "bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language",
        shp: "gitmodules/shapefile-js/dist/shp",
        // ol: "js/ol3-3.16.0/ol",
        ol: "js/ol3-3.19.0/ol-debug",
        exists: "main/utils/exists",
        layerswitcher: "js/ol3-layerswitcher/ol3-layerswitcher",
        domReady: "js/domReady",
        wfs110context: "main/WFS110Context",
        wfs200context: "main/WFS200Context",
        deg2tile: "main/tools/deg2tile",
        layertree: "main/layertree",
        toolbar: "main/toolbar",
        featureid: "main/utils/featureid",
        featureeditor: "main/featureeditor",
        layerinteractor: "main/layerinteractor",
        ttemplate: "main/tobjects/template",
        tfillopacity: "main/tobjects/fillopacity",
        tcolor: "main/tobjects/color",
        tstyle: "main/tobjects/style",
        tstylefunction: "main/tobjects/stylefunction",
        getjstsgeom: "main/geometry/getjstsgeom",
        ispointinpoly: "main/geometry/ispointinpoly",
        ispolyvalid: "main/geometry/ispolyvalid",
        doespolycoverhole: "main/geometry/doespolycoverhole",
        bingkey: ["main/bingkey", "main/bingkey-sample"],
        main: "main/main"
    },
    shim: {
        // jsts: {
        //     deps: ['jstsutil', 'ol']
        // },
        layerswitcher: ['ol'],

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
        WFS_1_1_0: {
            deps: ['OWS_1_0_0', 'Filter_1_1_0', 'GML_3_1_1']
        },
        WFS_2_0: {
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
