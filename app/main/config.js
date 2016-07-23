/**
 * Created by maddoxw on 7/18/16.
 */

require.config({
    baseUrl: "../app",
    // urlArgs: "bust=" + (new Date()).getTime(),
    // deps: ['main/main'],
    // waitSeconds: 10,
    paths: {
        jquery: 'bower_components/jquery/dist/jquery.min',
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
        nouislider: "gitmodules/noUiSlider/distribute/nouislider",
        shp: "gitmodules/shapefile-js/dist/shp",
        ol: "js/ol3-3.16.0/ol-debug",
        // jsts: "js/jsts-0.17.0/jsts.min",
        // jstsutil: "js/jsts-0.17.0/javascript.util.min",
        layerswitcher: "js/ol3-layerswitcher/ol3-layerswitcher",
        domReady: "js/domReady",
        wfs110context: "main/WFS110Context",
        wfs200context: "main/WFS200Context",
        deg2tile: "main/tools/deg2tile",
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