/**
 * Created by maddoxw on 1/3/17.
 */

'use strict'

import $ from 'jquery'
import utils from 'utils'

let $selectNode = $('<select id="mouse-projection" title="Units of the cursor coordinates.">')
$selectNode.append(utils.createMenuOption('EPSG:4326'))
$selectNode.append(utils.createMenuOption('EPSG:3857'))
$selectNode.append(utils.createMenuOption('EPSG:31467'))
export default $selectNode
