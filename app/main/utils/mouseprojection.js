/**
 * Created by maddoxw on 1/3/17.
 */

define(function (require) {
    'use strict';

    const utils = require('utils');

    let $selectNode = $('<select id="mouse-projection" title="Units of the cursor coordinates.">');
    $selectNode.append(utils.createMenuOption("EPSG:4326"));
    $selectNode.append(utils.createMenuOption("EPSG:3857"));
    $selectNode.append(utils.createMenuOption("EPSG:31467"));
    return $selectNode
});
