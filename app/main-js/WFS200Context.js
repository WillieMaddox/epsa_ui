/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const JsonixModule = require('jsonix'),
  xlink10Module = require('XLink_1_0'),
  filter20Module = require('Filter_2_0'),
  ows110Module = require('OWS_1_1_0'),
  wfs20Module = require('WFS_2_0')

const Jsonix = JsonixModule.Jsonix

const XLink_1_0 = xlink10Module.XLink_1_0
const WFS_2_0 = wfs20Module.WFS_2_0
const Filter_2_0 = filter20Module.Filter_2_0
const OWS_1_1_0 = ows110Module.OWS_1_1_0
const mappings = [OWS_1_1_0, XLink_1_0, Filter_2_0, WFS_2_0]

module.exports = new Jsonix.Context(mappings)
