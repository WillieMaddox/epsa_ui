/**
 * Created by maddoxw on 7/23/16.
 */

define([
    'jsonix',
    'XLink_1_0',
    'Filter_1_1_0',
    'OWS_1_0_0',
    'WFS_1_1_0',
    'GML_3_1_1',
    'SMIL_2_0_Language',
    'SMIL_2_0',
    'main'], function(
    JsonixModule, xlink10Module, filter110Module, ows100Module, wfs110Module, gml311Module, smil20lang, smil20) {

    "use strict";

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