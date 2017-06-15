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
    'serversettings': 'main-js/settings.dev',  // development
    // serversettings': './settings.prod',  // production
    'jquery': '../bower_components/jquery/dist/jquery',
    'jquery-ui': '../bower_components/jquery-ui/jquery-ui',
    'jsonix': '../bower_components/jsonix/dist/Jsonix-min',
    // 'jsonix': '../../../jsonix/dist/Jsonix-min',
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
    'ol': 'libs/ol3-3.19.1/ol-debug',
    'jsts': 'libs/jsts-1.2.1/jsts.min',
    'shp': 'libs/gitmodules/shapefile-js/dist/shp',
    'layerswitcher': 'libs/ol3-layerswitcher/ol3-layerswitcher',
    'domReady': 'libs/domReady',
    'wfs110context': 'main-js/WFS110Context',
    'wfs200context': 'main-js/WFS200Context',
    'ispointinpoly': 'main-js/geometry/ispointinpoly',
    'ispolyvalid': 'main-js/geometry/ispolyvalid',
    'doespolycoverhole': 'main-js/geometry/doespolycoverhole',
    'deg2tile': 'main-js/tools/deg2tile',
    'exists': 'main-js/utils/exists',
    'defaultsensors': 'main-js/utils/defaultsensors',
    'mouseprojection': 'main-js/utils/mouseprojection',
    'mouseunits': 'main-js/utils/mouseunits',
    'utilities': 'main-js/utils/utils',
    'map': 'main-js/map',
    'messagebar': 'main-js/messagebar',
    'layertree': 'main-js/layertree',
    'layertoolbar': 'main-js/layertoolbar',
    'toolbar': 'main-js/toolbar',
    'layerinteractor': 'main-js/layerinteractor',
    'featureeditor': 'main-js/featureeditor',
    'cameraeditor': 'main-js/cameraeditor',
    'ttemplate': 'main-js/tobjects/template',
    'tstylefunction': 'main-js/tobjects/stylefunction',
    'stemplate': 'main-js/sensors/template',
    'sstylefunction': 'main-js/sensors/stylefunction',
    // 'bingKey': ['bingkey', 'bingkey-sample'],
    'bingKey': 'main-js/bingkey'
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
