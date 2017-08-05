/**
 * Created by maddoxw on 12/28/16.
 */

'use strict'

const ol = require('ol'),
  deg2tile = require('deg2tile'),
  OSMFire_Core = require('MainCore')

require('OSMFire_Map')

let callback = function(sandBox) {
  return {
    tileProj: ol.proj.get('EPSG:4326'),
    init: function () {
      try {
        sandBox.contextObj = this
        this.registerForCustomEvents()

        // sandBox.setMousePosition({'target': 'coordinates'});

        this.mousePositionControl = new ol.control.MousePosition({
          coordinateFormat: this.coordinateFormat,
          projection: ol.proj.get(sandBox.getMouseProjection()),
          target: 'coordinates'
        })
        sandBox.addControl(this.mousePositionControl)
        this.mousePositionControl.on('change:projection', function () {
          sandBox.setMousePrecision()
        })

        sandBox.log(1, 'Mouse Coordinates component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'Mouse Coordinates component has NOT been initialized correctly --> ' + e.stack)
      }
    },
    destroy: function (removeComponent) {
      sandBox.unregisterAllCustomEvents()
      if (removeComponent) {
        sandBox.removeComponent('mouse-coordinates-container')
      }
      sandBox.log(1, 'Mouse Coordinates component has been destroyed...', 'blue')
    },
    coordinateFormat: function (coordinates) {
      // let zoom = sandBox.getMap().getView().getZoom();
      let zoom = sandBox.getView().getZoom()
      let lonlatstr = ol.coordinate.createStringXY(sandBox.getMousePrecision())
      let lonlat = 'Lon, Lat: ' + lonlatstr(coordinates)
      let coord0 = ol.proj.transform(coordinates, sandBox.getMouseProjection(), sandBox.contextObj.tileProj)
      let xytile = deg2tile(coord0[0], coord0[1], zoom)
      let xyz = 'X, Y, Z: ' + [xytile[0], xytile[1], zoom].join(',  ')
      return [lonlat, xyz].join('    ')
    },
    registerForCustomEvents: function () {
      sandBox.registerForCustomEvents({
        'mouseprojection-Changed': this.handleMouseProjectionChanged,
      })
    },
    handleMouseProjectionChanged: function (mouseProj) {
      sandBox.contextObj.mousePositionControl.setProjection(ol.proj.get(mouseProj))
    }
  }
}

OSMFire_Core.registerComponent('mouse-coordinates-container', 'coordinates', callback)
