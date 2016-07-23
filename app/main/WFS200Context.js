/**
 * Created by maddoxw on 7/23/16.
 */

define(['jsonix', 'XLink_1_0', 'Filter_2_0', 'OWS_1_1_0', 'WFS_2_0'], function(
    JsonixModule, xlink10Module, filter20Module, ows110Module, wfs20Module) {

    "use strict";

    var Jsonix = JsonixModule.Jsonix;

    var XLink_1_0 = xlink10Module.XLink_1_0;
    var WFS_2_0 = wfs20Module.WFS_2_0;
    var Filter_2_0 = filter20Module.Filter_2_0;
    var OWS_1_1_0 = ows110Module.OWS_1_1_0;
    var mappings = [OWS_1_1_0, XLink_1_0, Filter_2_0, WFS_2_0];

    return new Jsonix.Context(mappings);
});