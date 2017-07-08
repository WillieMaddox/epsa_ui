/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

import {Jsonix} from 'jsonix'
import {XLink_1_0} from 'w3c-schemas'
import {OWS_1_0_0, Filter_1_1_0, SMIL_2_0, SMIL_2_0_Language, GML_3_1_1, WFS_1_1_0} from 'ogc-schemas'

const mappings = [SMIL_2_0_Language, SMIL_2_0, GML_3_1_1, XLink_1_0, Filter_1_1_0, OWS_1_0_0, WFS_1_1_0]
const result = new Jsonix.Context(mappings)

export default result
