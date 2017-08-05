/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

import {Jsonix} from 'jsonix'

import {XLink_1_0} from 'w3c-schemas/lib/XLink_1_0'
import {WFS_2_0} from 'ogc-schemas/lib/WFS_2_0'
import {OWS_1_1_0} from 'ogc-schemas/lib/OWS_1_1_0'
import {GML_3_1_1} from 'ogc-schemas/lib/GML_3_1_1'
import {Filter_2_0} from 'ogc-schemas/lib/Filter_2_0'

const mappings = [OWS_1_1_0, XLink_1_0, Filter_2_0, GML_3_1_1, WFS_2_0]
const result = new Jsonix.Context(mappings)

export default result
