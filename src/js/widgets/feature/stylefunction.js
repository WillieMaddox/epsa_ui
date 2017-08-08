/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'
import ol from 'openlayers'

import linestring_templates from './linestringtemplates'
import polygon_templates from './polygontemplates'
import point_templates from './pointtemplates'

import cameraIcon from '../../../img/camera-normal.png'
import radioIcon from '../../../img/radio-normal.png'

// import cameraIcon from './src/js/img/camera-normal.png',
// import radioIcon from './src/js/img/radio-normal.png'

const result = (function () {

  // TODO: Move png's into an assets folder so we can lazy load.
  // const icons = {
  //   'camera': './src/img/camera-normal.png',
  //   'radio': './src/img/radio-normal.png'
  // }

  const feature_styles = {
    'camera': iconStyle(cameraIcon),
    'radio': iconStyle(radioIcon)
  }

  const feature_templates = {
    'Polygon': null,
    'LineString': null,
    'Point': null
  }

  function geometryStyle (geom, color = [255, 0, 0], opacity = 0.5) {
    const geometry_styles = {
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color.concat(1),
          width: 3
        }),
        fill: new ol.style.Fill({
          color: color.concat(opacity)
        })
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color.concat(1),
          width: 3
        })
      }),
      'Point': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: color.concat(1),
            width: 2
          }),
          fill: new ol.style.Fill({
            color: color.concat(0.5)
          })
        })
      })
    }

    return geometry_styles[geom]
  }

  function iconStyle (src) {
    return new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        // anchor: [0.5, 0.5],
        // anchorXUnits: 'fraction',
        // anchorYUnits: 'fraction',
        color: [0, 0, 0],
        opacity: 1,
        scale: 0.05,
        snapToPixel: false,
        src: src
      }))
    })
  }

  let setStyle = function (geom, type) {
    // let color, opacity
    let style

    let template = feature_templates[geom][type]

    // TODO: see if removeing this exists() breaks anything.
    // if (exists(type) && featureTemplates[geom].hasOwnProperty(type)) {
    //   color = template.color
    //   opacity = template.fillopacity
    // } else {
    //   color = [255, 0, 0]
    //   opacity = 0.5
    // }

    if (feature_styles.hasOwnProperty(type)) {
      style = feature_styles[type]
    } else {
      style = geometryStyle(geom, template.color, template.opacity)
    }

    return [style]
  }
  return function (feature) {
    let geom = feature.getGeometry().getType().replace(/Multi/, '')
    let type = feature.get('type') || geom.toLowerCase()

    if (geom === 'Polygon') {
      if (feature_templates['Polygon'] === null) {
        feature_templates['Polygon'] = polygon_templates
      }
    }
    if (geom === 'LineString') {
      if (feature_templates['LineString'] === null) {
        feature_templates['LineString'] = linestring_templates
      }
    }
    if (geom === 'Point') {
      if (feature_templates['Point'] === null) {
        feature_templates['Point'] = point_templates
      }
    }
    return setStyle(geom, type)
  }
})()

export default result
