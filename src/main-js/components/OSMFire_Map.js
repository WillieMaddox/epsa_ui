/**
 * Created by maddoxw on 12/28/16.
 */


'use strict'

const $ = require('jquery')
const ol = require('ol')
const bingKey = require('bingKey')
const OSMFire_Core = require('MainCore')

require('OSMFire_MouseUnits')
require('OSMFire_MouseProjection')
require('layerswitcher')

let callback = function(sandBox) {
  let innerHTMLStr = '<div id="map" class="map"></div>'

  return {
    layerSwitcher: new ol.control.LayerSwitcher(),
    scaleLineControl: new ol.control.ScaleLine(),
    init: function () {
      try {
        sandBox.updateElement('map-container', innerHTMLStr)
        sandBox.contextObj = this
        this.registerForCustomEvents()

        let thunderforestAttributions = [
          new ol.Attribution({
            html: 'Tiles &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
          }),
          ol.source.OSM.ATTRIBUTION
        ]
        let defaultLayers = [
          new ol.layer.Group({
            title: 'Bing',
            layers: [
              new ol.layer.Tile({
                title: 'Labels',
                type: 'base',
                visible: false,
                source: new ol.source.BingMaps({
                  key: bingKey,
                  imagerySet: 'Road'
                })
              }),
              new ol.layer.Tile({
                title: 'Aerial',
                type: 'base',
                visible: false,
                source: new ol.source.BingMaps({
                  key: bingKey,
                  imagerySet: 'Aerial'
                })
              }),
              new ol.layer.Tile({
                title: 'Aerial + Labels',
                type: 'base',
                visible: false,
                source: new ol.source.BingMaps({
                  key: bingKey,
                  imagerySet: 'AerialWithLabels'
                })
              })
            ]
          }),
          new ol.layer.Group({
            title: 'Thunderforest',
            layers: [
              new ol.layer.Tile({
                title: 'OpenCycleMap',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({
                  url: 'http://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
                  attributions: thunderforestAttributions
                })
              }),
              new ol.layer.Tile({
                title: 'Outdoors',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({
                  url: 'http://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
                  attributions: thunderforestAttributions
                })
              }),
              new ol.layer.Tile({
                title: 'Landscape',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({
                  url: 'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
                  attributions: thunderforestAttributions
                })
              }),
              new ol.layer.Tile({
                title: 'Transport',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({
                  url: 'http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
                  attributions: thunderforestAttributions
                })
              }),
              new ol.layer.Tile({
                title: 'Transport Dark',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({
                  url: 'http://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
                  attributions: thunderforestAttributions
                })
              })
            ]
          }),
          new ol.layer.Group({
            title: 'OpenStreetMap',
            layers: [
              new ol.layer.Tile({
                title: 'OpenStreetMap',
                type: 'base',
                visible: true,
                source: new ol.source.OSM()
              })
            ]
          }),
          new ol.layer.Group({
            title: 'Localhost',
            layers: [
              new ol.layer.Tile({
                title: 'OpenStreetMap',
                type: 'base',
                visible: false,
                source: new ol.source.OSM({url: 'http://localhost/osm_tiles/{z}/{x}/{y}.png'})
              })
            ]
          })
        ]
        let map = sandBox.getMap()
        let view = sandBox.getView()
        view.setCenter(ol.proj.transform(
          // [-86.711, 34.636],
          // [-86.677945, 34.723185],
          [-86.8043, 33.5170],
          // [-78.87532, 42.884600],
          // [-73.9812, 40.6957],
          // [-105.539, 39.771],
          // [-105.0, 39.75],
          // [-79.049, 43.146],
          'EPSG:4326', 'EPSG:3857'))
        view.setZoom(14)
        map.setTarget(document.getElementById('map'))
        map.setView(view)
        // map.addInteraction(ol.interaction.defaults({doubleClickZoom: false}));
        map.addControl(new ol.control.Attribution())
        map.addControl(new ol.control.Zoom())
        for (let layer of defaultLayers) {
          map.addLayer(layer)
        }

        // let view = new ol.View({
        //     center: ol.proj.transform(
        //         // [-86.711, 34.636],
        //         // [-86.677945, 34.723185],
        //         // [-78.87532, 42.884600],
        //         // [-73.9812, 40.6957],
        //         [-105.539, 39.771],
        //         // [-105.0, 39.75],
        //         // [-79.049, 43.146],
        //         'EPSG:4326', 'EPSG:3857'),
        //     // center: [-8238000, 4970700],
        //     // center: [0, 0],
        //     zoom: 15
        // });
        // let map = new ol.Map({
        //     interactions: ol.interaction.defaults({doubleClickZoom: false}),
        //     target: document.getElementById('map'),
        //     view: view,
        //     // logo: {
        //     //     src: 'img/saic-logo2.png',
        //     //     href: 'http://www.saic.com'
        //     // },
        //     controls: [new ol.control.Attribution(), new ol.control.Zoom()],
        //     layers: [
        //         new ol.layer.Group({
        //             title: 'Bing',
        //             layers: [
        //                 new ol.layer.Tile({
        //                     title: 'Labels',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.BingMaps({
        //                         key: bingKey,
        //                         imagerySet: 'Road'
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Aerial',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.BingMaps({
        //                         key: bingKey,
        //                         imagerySet: 'Aerial'
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Aerial + Labels',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.BingMaps({
        //                         key: bingKey,
        //                         imagerySet: 'AerialWithLabels'
        //                     })
        //                 })
        //             ]
        //         }),
        //         new ol.layer.Group({
        //             title: 'Thunderforest',
        //             layers: [
        //                 new ol.layer.Tile({
        //                     title: 'OpenCycleMap',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({
        //                         url: 'http://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
        //                         attributions: thunderforestAttributions
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Outdoors',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({
        //                         url: 'http://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
        //                         attributions: thunderforestAttributions
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Landscape',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({
        //                         url: 'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
        //                         attributions: thunderforestAttributions
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Transport',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({
        //                         url: 'http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
        //                         attributions: thunderforestAttributions
        //                     })
        //                 }),
        //                 new ol.layer.Tile({
        //                     title: 'Transport Dark',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({
        //                         url: 'http://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
        //                         attributions: thunderforestAttributions
        //                     })
        //                 })
        //             ]
        //         }),
        //         new ol.layer.Group({
        //             title: 'OpenStreetMap',
        //             layers: [
        //                 new ol.layer.Tile({
        //                     title: 'OpenStreetMap',
        //                     type: 'base',
        //                     visible: true,
        //                     source: new ol.source.OSM()
        //                 })
        //             ]
        //         }),
        //         new ol.layer.Group({
        //             title: 'Localhost',
        //             layers: [
        //                 new ol.layer.Tile({
        //                     title: 'OpenStreetMap',
        //                     type: 'base',
        //                     visible: false,
        //                     source: new ol.source.OSM({url: 'http://localhost/osm_tiles/{z}/{x}/{y}.png'})
        //                 })
        //             ]
        //         })
        //     ],
        //     loadTilesWhileInteracting: true,
        //     loadTilesWhileAnimating: true
        // });
        // sandBox.setMap(map);

        map.addControl(this.layerSwitcher)
        map.addControl(this.scaleLineControl)

        view.on('change:resolution', function () {
          sandBox.setMousePrecision()
        })

        $('#mouse-units').val(this.scaleLineControl.getUnits())

        sandBox.setMousePrecision()

        sandBox.log(1, 'Map component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'Map component has NOT been initialized correctly --> ' + e.stack)
      }
    },
    destroy: function (removeComponent) {
      sandBox.contextObj.unregisterFromEvents()
      sandBox.unregisterAllCustomEvents()
      if (removeComponent) {
        sandBox.removeComponent('map-container')
      }
      sandBox.log(1, 'Map component has been destroyed...', 'blue')
    },
    registerForCustomEvents: function () {
      sandBox.registerForCustomEvents({
        'mouseunits-Changed': this.handleMouseUnitsChanged,
        'newVectorLayer-Submitted': this.handleNewVectorLayerSubmitted,
        'addVectorLayer-Submitted': this.handleAddVectorLayerSubmitted,
        'addWfsLayer-Submitted': this.handleAddWfsLayerSubmitted,
        'addWmsLayer-Submitted': this.handleAddWmsLayerSubmitted,
        'checkWfsLayer-Clicked': this.handleCheckWfsLayerClicked,
        'checkWmsLayer-Clicked': this.handleCheckWmsLayerClicked
      })
    },
    handleMouseUnitsChanged: function (mouseUnits) {
      sandBox.contextObj.scaleLineControl.setUnits(mouseUnits)
    },
    handleNewVectorLayerSubmitted: function (form) {
      console.log('newVectorLayer-Submitted')
    },
    handleAddVectorLayerSubmitted: function (form) {
      console.log('addVectorLayer-Submitted')
    },
    handleAddWfsLayerSubmitted: function (form) {
      console.log('addWfsLayer-Submitted')
    },
    handleAddWmsLayerSubmitted: function (form) {
      console.log('addWmsLayer-Submitted')
    },
    handleCheckWmsLayerClicked: function (form) {
      console.log('checkWmsLayer-Clicked')
    },
    handleCheckWfsLayerClicked: function (form) {
      console.log('checkWfsLayer-Clicked')
    }
  }
}

OSMFire_Core.registerComponent('map-container', 'map', callback)
