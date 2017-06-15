/**
 * Created by maddoxw on 7/18/16.
 */

require.config({
  // appDir: '../app',
  // baseUrl: 'main',  // development
  // baseUrl: '/',  // production
  // deps: ['main'],
  // nodeRequire: require,
  // urlArgs: 'bust=' + (new Date()).getTime(),
  // waitSeconds: 10,
  paths: {
    'serversettings': './settings.dev',  // development
    // serversettings': './settings.prod',  // production
    'jquery': '../bower_components/jquery/dist/jquery',
    'jquery-ui': '../bower_components/jquery-ui/jquery-ui',
    // 'jsonix': '../bower_components/jsonix/dist/Jsonix-min',
    'jsonix': '../../../jsonix/dist/Jsonix-min',
    'WFS_2_0': '../bower_components/ogc-schemas/scripts/lib/WFS_2_0',
    'WFS_1_1_0': '../bower_components/ogc-schemas/scripts/lib/WFS_1_1_0',
    'XLink_1_0': '../bower_components/w3c-schemas/scripts/lib/XLink_1_0',
    'GML_3_1_1': '../bower_components/ogc-schemas/scripts/lib/GML_3_1_1',
    'OWS_1_0_0': '../bower_components/ogc-schemas/scripts/lib/OWS_1_0_0',
    'OWS_1_1_0': '../bower_components/ogc-schemas/scripts/lib/OWS_1_1_0',
    'Filter_2_0': '../bower_components/ogc-schemas/scripts/lib/Filter_2_0',
    'Filter_1_1_0': '../bower_components/ogc-schemas/scripts/lib/Filter_1_1_0',
    'SMIL_2_0': '../bower_components/ogc-schemas/scripts/lib/SMIL_2_0',
    'SMIL_2_0_Language': '../bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language',
    'ol': '../js/libs/ol3-3.19.1/ol-debug',
    'jsts': '../js/libs/jsts-1.2.1/jsts.min',
    'shp': '../js/libs/gitmodules/shapefile-js/dist/shp',
    'layerswitcher': '../js/libs/ol3-layerswitcher/ol3-layerswitcher',
    'domReady': '../js/libs/domReady',
    'wfs110context': './WFS110Context',
    'wfs200context': './WFS200Context',
    'ispointinpoly': './geometry/ispointinpoly',
    'ispolyvalid': './geometry/ispolyvalid',
    'doespolycoverhole': './geometry/doespolycoverhole',
    'deg2tile': './tools/deg2tile',
    'exists': './utils/exists',
    'defaultsensors': './utils/defaultsensors',
    'mouseprojection': './utils/mouseprojection',
    'mouseunits': './utils/mouseunits',
    'utilities': './utils/utils',
    'map': './map',
    'messagebar': './messagebar',
    'layertree': './layertree',
    'layertoolbar': './layertoolbar',
    'toolbar': './toolbar',
    'layerinteractor': './layerinteractor',
    'featureeditor': './featureeditor',
    'cameraeditor': './cameraeditor',
    'ttemplate': './tobjects/template',
    'tstylefunction': './tobjects/stylefunction',
    'stemplate': './sensors/template',
    'sstylefunction': './sensors/stylefunction',
    // 'bingKey': ['bingkey', 'bingkey-sample'],
    'bingKey': './bingkey'
  },
  shim: {
    'layerswitcher': {
      deps: ['ol'],
      exports: 'layerswitcher'
    },
    'WFS_1_1_0': {
      deps: ['OWS_1_0_0', 'Filter_1_1_0', 'GML_3_1_1']
    },
    'WFS_2_0': {
      deps: ['OWS_1_1_0', 'Filter_2_0', 'GML_3_1_1']
    }
  }
})

// require(['main'], function(main) {});
// require(['main'], function(main) {
//     main.init();
// });
// require(['domReady!'], function (doc) {
//     //This function is called once the DOM is ready,
//     //notice the value for 'domReady!' is the current
//     //document.
// });
