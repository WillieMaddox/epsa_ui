/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

import {Jsonix} from 'jsonix'

import {XLink_1_0} from 'w3c-schemas/lib/XLink_1_0'
import {WFS_1_1_0} from 'ogc-schemas/lib/WFS_1_1_0'
import {OWS_1_0_0} from 'ogc-schemas/lib/OWS_1_0_0'
import {GML_3_1_1} from 'ogc-schemas/lib/GML_3_1_1'
import {Filter_1_1_0} from 'ogc-schemas/lib/Filter_1_1_0'
import {SMIL_2_0} from 'ogc-schemas/lib/SMIL_2_0'
import {SMIL_2_0_Language} from 'ogc-schemas/lib/SMIL_2_0_Language'

const mappings = [SMIL_2_0_Language, SMIL_2_0, GML_3_1_1, XLink_1_0, Filter_1_1_0, OWS_1_0_0, WFS_1_1_0]
const result = new Jsonix.Context(mappings)

export default result
