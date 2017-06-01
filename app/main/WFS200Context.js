/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
    'use strict';

    var JsonixModule = require('jsonix'),
        xlink10Module = require('XLink_1_0'),
        filter20Module = require('Filter_2_0'),
        ows110Module = require('OWS_1_1_0'),
        wfs20Module = require('WFS_2_0');

    var Jsonix = JsonixModule.Jsonix;

    var XLink_1_0 = xlink10Module.XLink_1_0;
    var WFS_2_0 = wfs20Module.WFS_2_0;
    var Filter_2_0 = filter20Module.Filter_2_0;
    var OWS_1_1_0 = ows110Module.OWS_1_1_0;
    var mappings = [OWS_1_1_0, XLink_1_0, Filter_2_0, WFS_2_0];

    return new Jsonix.Context(mappings);
});