/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'
import JsonixModule from 'jsonix'
import xlink10Module from 'XLink_1_0'
import wfs110Module from 'WFS_1_1_0'
import filter110Module from 'Filter_1_1_0'
import ows100Module from 'OWS_1_0_0'
import smil20 from 'SMIL_2_0'
import smil20lang from 'SMIL_2_0_Language'
import gml311Module from 'GML_3_1_1'

const Jsonix = JsonixModule.Jsonix

const XLink_1_0 = xlink10Module.XLink_1_0
const WFS_1_1_0 = wfs110Module.WFS_1_1_0
const Filter_1_1_0 = filter110Module.Filter_1_1_0
const OWS_1_0_0 = ows100Module.OWS_1_0_0
const SMIL_2_0_Language = smil20lang.SMIL_2_0_Language
const SMIL_2_0 = smil20.SMIL_2_0
const GML_3_1_1 = gml311Module.GML_3_1_1
const mappings = [SMIL_2_0_Language, SMIL_2_0, GML_3_1_1, XLink_1_0, Filter_1_1_0, OWS_1_0_0, WFS_1_1_0]

const result = new Jsonix.Context(mappings)

export default result
