require.config({
  deps: ['main'],
  paths: {
    'serversettings': '../main-js/settings.dev',  // development
    // serversettings': 'main/settings.prod',  // production
    'jquery': '../bower_components/jquery/dist/jquery',
    'jquery-ui': '../bower_components/jquery-ui/jquery-ui',
    'jsonix': '../bower_components/jsonix/dist/Jsonix-all',
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
    'layerswitcher': 'libs/ol3-layerswitcher/ol3-layerswitcher',
    'shp': 'libs/gitmodules/shapefile-js/dist/shp',
    'domReady': 'libs/domReady',
    'wfs110context': '../main-js/WFS110Context',
    'wfs200context': '../main-js/WFS200Context',
    'ispointinpoly': '../main-js/geometry/ispointinpoly',
    'ispolyvalid': '../main-js/geometry/ispolyvalid',
    'doespolycoverhole': '../main-js/geometry/doespolycoverhole',
    'deg2tile': '../main-js/tools/deg2tile',
    'utils': '../main-js/utils/utils',
    'exists': '../main-js/utils/exists',
    // 'featureid': '../main/utils/featureid',
    'defaultsensors': '../main-js/utils/defaultsensors',
    'messagebar': '../main-js/messagebar',
    'layertoolbar': '../main-js/layertoolbar',
    'layertree': '../main-js/layertree',
    'toolbar': '../main-js/toolbar',
    'layerinteractor': '../main-js/layerinteractor',
    'featureeditor': '../main-js/featureeditor',
    'cameraeditor': '../main-js/cameraeditor',
    'ttemplate': '../main-js/tobjects/template',
    'tstylefunction': '../main-js/tobjects/stylefunction',
    'stemplate': '../main-js/sensors/template',
    'sstylefunction': '../main-js/sensors/stylefunction',
    'bingKey': ['../main/bingkey', '../main/bingkey-sample'],
    'MainCore': 'Modules/Core/MainCore',
    'Logger': 'Modules/Core/Logger',
    'AjaxEngine': 'Modules/Core/AjaxEngine',
    'CookieHandler': 'Modules/Core/CookieHandler',
    'NotificationHandler': 'Modules/Core/NotificationHandler',
    'StorageHandler': 'Modules/Core/StorageHandler',
    'Utilities': 'Modules/Core/Utilities',
    'OL': 'Modules/Core/OL',
    'SandBox': 'Modules/SandBox/SandBox',
    'OSMFire_MouseUnits': 'Components/OSMFire_MouseUnits',
    'OSMFire_MouseProjection': 'Components/OSMFire_MouseProjection',
    'OSMFire_Map': 'Components/OSMFire_Map',
    'OSMFire_MousePosition': 'Components/OSMFire_MousePosition',
    'OSMFire_LayerToolbar': 'Components/OSMFire_LayerToolbar',
    'OSMFire_LayerTree': 'Components/OSMFire_LayerTree',
    // 'OSMFire_MessageBar': 'Components/OSMFire_MessageBar',
    'NewVectorDialogWidget': 'Widgets/NewVectorDialogWidget',
    'AppTester': 'Modules/AppTester/AppTester',
    'CookieHandlerTester': 'Modules/AppTester/CookieHandlerTester',
    'StorageHandlerTester': 'Modules/AppTester/StorageHandlerTester',
    'Base': 'Modules/Base/Base',
    'GlobalData_Sub': 'Modules/GlobalData/GlobalData_Sub',
    'GlobalData': 'Modules/GlobalData/GlobalData'
  },
  shim: {
    'jquery': {
      exports: 'jquery'
    },
    'layerswitcher': {
      deps: ['ol'],
      exports: 'layerswitcher'
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
    },
    'Base': {
      exports: 'Base'
    },
    'SandBox': {
      exports: 'SandBox'
    },
    'GlobalData_Sub': {
      exports: 'GlobalData_Sub'
    },
    'GlobalData': {
      exports: 'GlobalData'
    },
    'MainCore': {
      deps: ['SandBox', 'jquery', 'GlobalData_Sub', 'GlobalData'],
      exports: 'OSMFire_Core' // use this alias in the global scope and pass it to modules as dependency
    },
    // 'OSMFire_Map': {
    //     deps: ['MainCore', 'OSMFire_MouseUnits', 'OSMFire_MouseProjection'],
    //     exports: "OSMFire_Map"
    // },
    // 'OSMFire_MapUnits': {
    //     deps: ['MainCore'],
    //     exports: "OSMFire_MapUnits"
    // },
    // 'OSMFire_MapProjection': {
    //     deps: ['MainCore'],
    //     exports: "OSMFire_MapProjection"
    // },
    'AppTester': {
      deps: ['MainCore']
    },
    'CookieHandlerTester': {
      deps: ['AppTester', 'CookieHandler']
    },
    'StorageHandlerTester': {
      deps: ['AppTester', 'StorageHandler']
    }
  }
})