
import $ from 'jquery'
import ol from 'openlayers'
import map from 'map'
import utils from 'utils'

'use strict'

const wgs84Sphere = new ol.Sphere(6378137)

const result = (function () {

  // TODO: implement these conversions:
  // inch (2.54 cm)
  // foot (12 inches, 0.3048 m)
  // yard (3 ft, 0.9144 m)
  // 1 square inch = 6.4516 square centimetres
  // 1 square foot = 0.09290304 square metres
  // 1 square yard = 0.83612736 square metres
  // 1 square mile = 2.589988110336 square kilometres
  // 1 acre = 4,840 square yards = 43,560 square feet.

  function formatLength (geom, sourceProj) {
    const getLineStringLength = function (line) {
      let length = 0
      if ($('#geodesic').is(':checked')) {
        const coordinates = line.clone().transform(sourceProj, 'EPSG:4326').getCoordinates()
        const nCoords = coordinates.length
        for (let i = 0; i < nCoords - 1; i++) {
          length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1])
        }
      } else {
        length = line.getLength()
      }
      return length
    }
    let length = 0
    if (geom.getType() === 'MultiLineString') {
      geom.getLineStrings().forEach(function (line) {
        length += getLineStringLength(line)
      })
    } else {
      length = getLineStringLength(geom)
    }
    let output
    if (length > 1000) {
      output = (Math.round(length / 1000 * 100) / 100) + ' km'
    } else {
      output = (Math.round(length * 100) / 100) + ' m'
    }
    $('#measure').html(output)
    // return output
  }

  function formatArea (geom, sourceProj) {
    const getPolygonArea = function (polygon) {
      let area = 0
      let isExterior = true
      if ($('#geodesic').is(':checked')) {
        const poly = polygon.clone().transform(sourceProj, 'EPSG:4326')
        poly.getLinearRings().forEach(function (ring) {
          if (isExterior) { // assume the first ring is the exterior ring.
            area += Math.abs(wgs84Sphere.geodesicArea(ring.getCoordinates()))
            isExterior = false
          } else {
            area -= Math.abs(wgs84Sphere.geodesicArea(ring.getCoordinates()))
          }
        })
      } else {
        area = polygon.getArea()
      }
      return area
    }
    let area = 0
    if (geom.getType() === 'MultiPolygon') {
      geom.getPolygons().forEach(function (poly) {
        area += getPolygonArea(poly)
      })
    } else {
      area = getPolygonArea(geom)
    }
    let output
    const squared = '2'
    if (area > 100000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' km' + squared.sup()
    } else {
      output = (Math.round(area * 100) / 100) + ' m' + squared.sup()
    }
    $('#measure').html(output)
    // return output
  }

  const measure_func_formats = {
    'Polygon': formatArea,
    'LineString': formatLength
  }
  const menu_options = {
    'Polygon': {
      'metric': ['sq-meter', 'sq-kilometer'],
      'english': ['sq-feet', 'sq-mile', 'acre']
    },
    'LineString': {
      'metric': ['meter', 'kilometer'],
      'english': ['feet', 'mile']
    }
  }
  const labels = {
    'Polygon': 'Area',
    'LineString': 'Length'
  }

  class Measure {
    constructor (geom_type) {
      console.log('measure constructor() called')
      this.measureFunc = measure_func_formats[geom_type]
      this.geom_options = menu_options[geom_type]
      this.label = labels[geom_type]
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formElem.append($('<div id="measure-label" class="form-label">' + this.label + '</div>'))
      $formValue.append($("<div id='measure' readonly>"))
      const $selectNode = $("<select id='measure-units'>")
      for (let key in this.geom_options) {
        $selectNode.append(utils.createMenuOption(key))
      }
      $formValue.append($selectNode)
      $formValue.append($("<label for='geodesic' class='visible' title='Use geodesic measures'>"))
      $formValue.append($("<input type='checkbox' id='geodesic' checked>"))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {
      $('#measure-units').selectmenu({
        classes: {
          'ui-selectmenu-button': 'menuselect'
        }
      })
      $('#geodesic').checkboxradio()
    }
    loadFeature (feature) {

      const _this = this
      const $measureLabel = $('#measure-label')
      const $measureUnits = $('#measure-units')
      const $geodesic = $('#geodesic')

      $measureLabel.removeClass('disabled')
      $geodesic.checkboxradio('enable')
      $measureUnits.selectmenu('enable')
      this.measureFunc(feature.getGeometry(), map.getView().getProjection())
      //TODO: Can I use arrow functions here instead of _this?
      this.geometrylistener = feature.getGeometry().on('change', function (evt) {
        _this.measureFunc(evt.target, map.getView().getProjection())
      })
      $geodesic.on('change', function () {
        // For some reason this checkbox doesn't auto reset on change, so we force a refresh here.
        $(this).checkboxradio('refresh')
        _this.measureFunc(_this.geometrylistener.target, map.getView().getProjection())
      })
    }
    saveFeature (feature) {}
    deactivateNode () {
      const $geodesic = $('#geodesic')
      $geodesic.off('change')
      ol.Observable.unByKey(this.geometrylistener)
      this.geometrylistener = null
      $geodesic.checkboxradio('disable')
      $('#measure').html(null)
      $('#measure-units').selectmenu('disable')
      $('#measure-units-button').find('.ui-selectmenu-text').html('&nbsp;')
      // },
      // registerForEvents: function () {
      //   sandBox.addEventHandlerToElement('measure-units', 'change', this.handleMeasureUnitsChanged)
      // },
      // unregisterFromEvents: function () {
      //   sandBox.removeEventHandlerFromElement('measure-units', 'change', this.handleMeasureUnitsChanged)
      // },
      // handleMeasureUnitsChanged: function (e) {
      //   sandBox.publishCustomEvent({
      //     type: 'measureunits-Changed',
      //     data: this.value
      //   })
      //   e.preventDefault()
      //   e.stopPropagation()
    }
  }
  return Measure
})()

export default result
