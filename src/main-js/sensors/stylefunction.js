/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'
import ol from 'openlayers'
import sensorTemplates from './template'

export default (function () {

  const icons = {
    'camera': './img/camera-normal.png',
    'radio': './img/radio-normal.png'
  }
  let setStyle = function (icon_src) {
    let style = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        // anchor: [0.5, 0.5],
        // anchorXUnits: 'fraction',
        // anchorYUnits: 'fraction',
        color: [0, 0, 0],
        opacity: 1,
        scale: 0.05,
        snapToPixel: false,
        src: icon_src
      }))
    })
    return [style]
  }
  return function (feature) {
    let icon_src
    if (feature.get('type') && sensorTemplates.hasOwnProperty(feature.get('type'))) {
      icon_src = icons[feature.get('type')]
    } else {
      icon_src = 'https://openlayers.org/en/v3.19.1/examples/data/icon.png'
    }
    return setStyle(icon_src)
  }
})()
