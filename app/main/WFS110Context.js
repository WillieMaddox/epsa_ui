/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
    'use strict';

    var JsonixModule = require('jsonix'),
        xlink10Module = require('XLink_1_0'),
        filter110Module = require('Filter_1_1_0'),
        ows100Module = require('OWS_1_0_0'),
        wfs110Module = require('WFS_1_1_0'),
        gml311Module = require('GML_3_1_1'),
        smil20lang = require('SMIL_2_0_Language'),
        smil20 = require('SMIL_2_0');

    // require('main');

    var Jsonix = JsonixModule.Jsonix;

    var XLink_1_0 = xlink10Module.XLink_1_0;
    var WFS_1_1_0 = wfs110Module.WFS_1_1_0;
    var Filter_1_1_0 = filter110Module.Filter_1_1_0;
    var OWS_1_0_0 = ows100Module.OWS_1_0_0;
    var SMIL_2_0_Language = smil20lang.SMIL_2_0_Language;
    var SMIL_2_0 = smil20.SMIL_2_0;
    var GML_3_1_1 = gml311Module.GML_3_1_1;
    var mappings = [SMIL_2_0_Language, SMIL_2_0, GML_3_1_1, XLink_1_0, Filter_1_1_0, OWS_1_0_0, WFS_1_1_0];

    return new Jsonix.Context(mappings);
});