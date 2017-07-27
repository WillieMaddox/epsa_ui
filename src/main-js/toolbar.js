/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

import ol from 'openlayers'
import map from 'map'
import utils from 'utils'
import exists from 'exists'
import layertree from 'layertree'
import isPolyValid from 'ispolyvalid'
import isPointInPoly from 'ispointinpoly'
import layerinteractor from 'layerinteractor'
import doesPolyCoverHole from 'doespolycoverhole'
// import featureStyleFunction from 'fstylefunction'
// import cameraIcon from '../img/camera-normal.png'

// import Collection from 'openlayers/src/ol/collection'

let bitA = 0
let bitB = 0
let activeControl = null
let drawControls = new ol.Collection()

const result = {
  init: function () {
    this.toolbar = document.getElementById('toolbar')
    this.controls = new ol.Collection()
    // this.activeControl = null;
    this.active = false
    this.drawEventEmitter = new ol.Observable()
    this.addedFeature = null
    this.addDrawToolBar().addHoleControls()
  },
  addControl: function (control) {
    if (!(control instanceof ol.control.Control)) {
      throw new Error('Only controls can be added to the toolbar.')
    }
    if (control.get('button_type') === 'radio') {
      control.on('change:active', function () {
        if (!(bitA | bitB)) {
          activeControl = control
          this.active = true
          this.drawEventEmitter.changed()
        }
        bitA ^= 1
        if (control.get('active')) {
          this.controls.forEach(function (controlToDisable) {
            if (controlToDisable.get('button_type') === 'radio' && controlToDisable !== control) {
              controlToDisable.set('active', false)
            }
          })
        }
        bitB ^= 1
        if (!(bitA | bitB)) {
          activeControl = null
          this.active = false
          this.drawEventEmitter.changed()
        }
      }, this)
    }
    control.setTarget(this.toolbar)
    this.controls.push(control)
    map.addControl(control)
    return this
  },
  removeControl: function (control) {
    this.controls.remove(control)
    map.removeControl(control)
    return this
  },
  addDrawToolBar: function () {

    let drawPoint = new ol.control.Interaction({
      label: ' ',
      feature_type: 'point',
      geometry_type: 'Point',
      className: 'ol-addpoint ol-unselectable ol-control',
      interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'point')
    }).setDisabled(true)
    drawControls.push(drawPoint)
    let drawLineString = new ol.control.Interaction({
      label: ' ',
      feature_type: 'linestring',
      geometry_type: 'LineString',
      className: 'ol-addline ol-unselectable ol-control',
      interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'linestring')
    }).setDisabled(true)
    drawControls.push(drawLineString)
    let drawPolygon = new ol.control.Interaction({
      label: ' ',
      feature_type: 'polygon',
      geometry_type: 'Polygon',
      className: 'ol-addpolygon ol-unselectable ol-control',
      interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true)
    drawControls.push(drawPolygon)

    // let boxInteraction = new ol.interaction.DragBox();
    // let selectMulti = new ol.control.Interaction({
    //   label: ' ',
    //   tipLabel: 'Select features with a box',
    //   className: 'ol-multiselect ol-unselectable ol-control',
    //   interaction: boxInteraction
    // });
    // boxInteraction.on('boxend', function (evt) {
    //   selectInteraction.getFeatures().clear();
    //   let extent = boxInteraction.getGeometry().getExtent();
    //   if (this.layertree.selectedLayer) {
    //     let source = layertree.getLayerById(layertree.selectedLayer.id).getSource();
    //     if (source instanceof ol.source.Vector) {
    //       source.forEachFeatureIntersectingExtent(extent, function (feature) {
    //         selectInteraction.getFeatures().push(feature);
    //       });
    //     }
    //   }
    // }, this);

    // let snapFeature = new ol.control.Interaction({
    //   label: ' ',
    //   tipLabel: 'Snap to paths, and vertices',
    //   className: 'ol-snap ol-unselectable ol-control',
    //   interaction: new ol.interaction.Snap({
    //     features: this.activeFeatures
    //   })
    // }).setDisabled(true);
    // snapFeature.unset('type');
    // drawControls.push(snapFeature);

    // let drawAOR = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'aor',
    //   geometry_type: 'Polygon',
    //   className: 'ol-addaor ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'aor')
    // }).setDisabled(true)
    // drawControls.push(drawAOR)
    // let drawBuilding = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'building',
    //   geometry_type: 'Polygon',
    //   className: 'ol-addbuilding ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'building')
    // }).setDisabled(true)
    // drawControls.push(drawBuilding)
    // let drawHerbage = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'herbage',
    //   geometry_type: 'Polygon',
    //   className: 'ol-addherbage ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'herbage')
    // }).setDisabled(true)
    // drawControls.push(drawHerbage)
    // let drawWater = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'water',
    //   geometry_type: 'Polygon',
    //   className: 'ol-addwater ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'water')
    // }).setDisabled(true)
    // drawControls.push(drawWater)
    // let drawWall = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'wall',
    //   geometry_type: 'LineString',
    //   className: 'ol-addwall ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'wall')
    // }).setDisabled(true)
    // drawControls.push(drawWall)
    // let drawRoad = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'road',
    //   geometry_type: 'LineString',
    //   className: 'ol-addroad ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'road')
    // }).setDisabled(true)
    // drawControls.push(drawRoad)

    // let drawCamera = new ol.control.Interaction({
    //   label: ' ',
    //   feature_type: 'camera',
    //   geometry_type: 'Point',
    //   className: 'ol-addcamera ol-unselectable ol-control',
    //   interaction: this.handleEvents(new ol.interaction.Draw({
    //     type: 'Point',
    //     style: new ol.style.Style({
    //       image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    //         anchor: [0.5, 0.5],
    //         anchorXUnits: 'fraction',
    //         anchorYUnits: 'fraction',
    //         // size: [20, 20],
    //         color: [255, 0, 0],
    //         scale: 0.05,
    //         src: cameraIcon
    //       }))
    //     })
    //   }), 'camera')
    // }).setDisabled(true)
    // drawControls.push(drawCamera)

    // this.activeFeatures = new ol.Collection();

    layertree.deselectEventEmitter.on('change', function () {
      drawControls.forEach(function (control) {
        control.set('active', false)
        control.setDisabled(true)
      })
      // this.activeFeatures.clear();
    }, this)

    layertree.selectEventEmitter.on('change', function () {

      let layer = layertree.getLayerById(layertree.selectedLayer.id)

      if (layer instanceof ol.layer.Image) { // feature layer.

        drawPoint.setDisabled(false)
        // drawCamera.setDisabled(false)
        drawLineString.setDisabled(false)
        // drawWall.setDisabled(false)
        // drawRoad.setDisabled(false)
        drawPolygon.setDisabled(false)
        // drawAOR.setDisabled(false)
        // drawWater.setDisabled(false)
        // drawHerbage.setDisabled(false)
        // drawBuilding.setDisabled(false)

        // let layerGeomType = layer.get('geomtype')
        // let layerType = layer.get('type')
        // if (layerType === 'sensor') {
        //   drawCamera.setDisabled(false)
        // } else if (layerType === 'feature') {
        //   if (layerGeomType === 'geomcollection' || layerGeomType === 'point') {
        //     drawPoint.setDisabled(false)
        //   }
        //   if (layerGeomType === 'geomcollection' || layerGeomType === 'line') {
        //     drawLineString.setDisabled(false)
        //     drawWall.setDisabled(false)
        //     drawRoad.setDisabled(false)
        //   }
        //   if (layerGeomType === 'geomcollection' || layerGeomType === 'polygon') {
        //     drawPolygon.setDisabled(false)
        //     drawAOR.setDisabled(false)
        //     drawWater.setDisabled(false)
        //     drawHerbage.setDisabled(false)
        //     drawBuilding.setDisabled(false)
        //   }
        // }
        // let _this = this;
        // setTimeout(function () {
        //     _this.activeFeatures.extend(layer.getSource().getFeatures());
        // }, 0);
      }
    }, this)

    drawControls.forEach(function (control) {
      this.addControl(control)
    }, this)

    return this
  },
  drawHole: function () {
    const holeStyle = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [3, 9],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0)'
        })
      }),
      new ol.style.Style({
        image: new ol.style.RegularShape({
          fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.5)'
          }),
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 1
          }),
          points: 4,
          radius: 6,
          angle: Math.PI / 4
        })
      })
    ]

    let currFeat = layerinteractor.select.getFeatures().getArray()[0]
    const geomTypeSelected = currFeat.getGeometry().getType()
    const isMultiPolygon = geomTypeSelected === 'MultiPolygon'
    if (!(geomTypeSelected.endsWith('Polygon'))) {
      alert('Only Polygon and MultiPolygon geometries can have holes. Not ' + geomTypeSelected)
      return
    }
    // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
    const origGeom = currFeat.getGeometry().clone()
    let currGeom
    let polyindex = 0
    let refGeom
    let pickPoly
    if (isMultiPolygon) {
      pickPoly = function (feature) {
        const points = feature.getGeometry().getCoordinates(false)[0]
        const polygons = origGeom.getPolygons()
        const nPolygons = polygons.length
        for (let i = 0; i < nPolygons; i++) {
          if (isPointInPoly(polygons[i], points[0])) {
            polyindex = i
          }
        }
      }
    }

    let vertsCouter = 0 //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)

    //create a hole draw interaction
    const source = new ol.source.Vector()
    const holeDraw = new ol.interaction.Draw({
      source: source,
      type: 'Polygon',
      style: holeStyle,
      condition: function (evt) {
        if (evt.type === 'pointerdown' || ol.events.condition.singleClick(evt)) {
          if (exists(refGeom)) {
            return (isPointInPoly(refGeom, evt.coordinate))
          } else {
            return (isPointInPoly(origGeom, evt.coordinate))
          }
        }
      }
    })

    $('#draw-hole').button('disable')
    $('#delete-hole').button('disable')
    map.un('pointermove', layerinteractor.hoverDisplay)
    layerinteractor.select.setActive(false)
    layerinteractor.modify.setActive(false)
    // this.translate.setActive(true);
    map.addInteraction(holeDraw)

    const getPolyHoles = function (poly) {
      let skip = true
      const holes = []
      poly.getLinearRings().forEach(function (ring) {
        if (skip) { // assume the first ring is the exterior ring.
          skip = false
        } else {
          holes.push(new ol.Feature(new ol.geom.Polygon([ring.getCoordinates()])))
        }
      })
      return holes
    }

    const getHoles = function (currGeom) {
      const holefeats = new ol.Collection()
      let polyholes
      if (currGeom.getType() === 'MultiPolygon') {
        currGeom.getPolygons().forEach(function (poly) {
          polyholes = getPolyHoles(poly)
          holefeats.extend(polyholes)
        })
      } else {
        polyholes = getPolyHoles(currGeom)
        holefeats.extend(polyholes)
      }
      return holefeats
    }

    const finishHole = function () {
      map.removeInteraction(holeDraw)
      layerinteractor.modify.setActive(true)
      layerinteractor.select.setActive(true)
      // _this.translate.setActive(true);
      map.on('pointermove', layerinteractor.hoverDisplay)
      $('#draw-hole').button('enable')
      // $('#delete-hole').button('enable');
      const holeFeats = getHoles(currGeom)
      $('#delete-hole').button('option', 'disabled', holeFeats.getArray().length === 0)
      $(document).off('keyup')
    }

    $(document).on('keyup', function (evt) {
      if (evt.keyCode === 189 || evt.keyCode === 109) {
        if (vertsCouter === 1) {
          currGeom.setCoordinates(origGeom.getCoordinates())
          finishHole()
        } else {
          holeDraw.removeLastPoint()
        }
      } else if (evt.keyCode === 27) {
        currGeom.setCoordinates(origGeom.getCoordinates())
        finishHole()
      }
    })

    holeDraw.on('drawstart', function (evt) {
      const feature = evt.feature // the hole feature
      let ringAdded = false //init boolean var to clarify whether drawn hole has already been added or not
      let setCoords
      let polyCoords

      currGeom = currFeat.getGeometry()
      if (isMultiPolygon) {
        pickPoly(feature)
        refGeom = currGeom.getPolygon(polyindex)
      } else {
        refGeom = currFeat.getGeometry().clone()
      }

      //set the change feature listener so we get the hole like visual effect
      feature.on('change', function () {
        //get draw hole feature geometry
        const currCoords = feature.getGeometry().getCoordinates(false)[0]
        vertsCouter = currCoords.length

        if (isMultiPolygon) {
          if (currCoords.length >= 3 && ringAdded === false) {
            polyCoords = currGeom.getCoordinates()[polyindex]
            polyCoords.push(currCoords)
            setCoords = currGeom.getCoordinates()
            setCoords.splice(polyindex, 1, polyCoords)
            currGeom.setCoordinates(setCoords)
            ringAdded = true
          } else if (currCoords.length >= 3 && ringAdded === true) {
            polyCoords = currGeom.getCoordinates()[polyindex]
            polyCoords.pop()
            polyCoords.push(currCoords)
            setCoords = currGeom.getCoordinates()
            setCoords.splice(polyindex, 1, polyCoords)
            currGeom.setCoordinates(setCoords)
          } else if (currCoords.length === 2 && ringAdded === true) {
            polyCoords = currGeom.getCoordinates()[polyindex]
            polyCoords.pop()
            setCoords = currGeom.getCoordinates()
            setCoords.splice(polyindex, 1, polyCoords)
            currGeom.setCoordinates(setCoords)
            ringAdded = false
          } else if (currCoords.length === 2 && !(exists(polyindex))) {
            pickPoly(feature)
            refGeom = currGeom.getPolygon(polyindex)
          } else if (currCoords.length === 1 && exists(polyindex)) {
            currFeat = null
            refGeom = null
            polyindex = null
          }
        } else {
          //if hole has 3 or more coordinate pairs, add the interior ring to feature
          if (currCoords.length >= 3 && ringAdded === false) {
            currGeom.appendLinearRing(new ol.geom.LinearRing(currCoords))
            ringAdded = true
          } else if (currCoords.length >= 3 && ringAdded === true) { //if interior ring has already been added we need to remove it and add back the updated one
            setCoords = currGeom.getCoordinates()
            setCoords.pop() //pop the dirty hole
            setCoords.push(currCoords) //push the updated hole
            currGeom.setCoordinates(setCoords) //update currGeom with new coordinates
          } else if (currCoords.length === 2 && ringAdded === true) {
            setCoords = currGeom.getCoordinates()
            setCoords.pop()
            currGeom.setCoordinates(setCoords)
            ringAdded = false
          }
        }
      })
    })

    // Check if the hole is valid and remove the hole interaction
    holeDraw.on('drawend', function () {

      let holecoords,
        rings

      if (isMultiPolygon) {
        rings = currGeom.getCoordinates()[polyindex]
        holecoords = rings.pop()
      } else {
        rings = currGeom.getCoordinates()
        holecoords = rings.pop()
      }

      const isValid = isPolyValid(new ol.geom.Polygon([holecoords]))
      const isInside = doesPolyCoverHole(origGeom, holecoords)
      if (isValid && isInside) {
        source.once('addfeature', function () {
          const featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
            [currFeat], {featureProjection: 'EPSG:3857'}
          )
          console.log(featuresGeoJSON)
        })
      } else {
        currGeom.setCoordinates(origGeom.getCoordinates())
      }

      layerinteractor.autoselect = true
      $('#delete-hole').button('enable')
      finishHole()
    }, this)
  },
  deleteHole: function () {

    let feature = null
    const holeStyle = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [10, 10],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 1.0)'
        })
      })
    ]

    const getPolyHoles = function (poly) {
      let skip = true
      const holes = []
      poly.getLinearRings().forEach(function (ring) {
        if (skip) { // assume the first ring is the exterior ring.
          skip = false
        } else {
          feature = new ol.Feature(new ol.geom.Polygon([ring.getCoordinates()]))
          holes.push(feature)
        }
      })
      return holes
    }

    const getHoles = function (currGeom) {
      const holefeats = new ol.Collection()
      let polyholes
      if (currGeom.getType() === 'MultiPolygon') {
        currGeom.getPolygons().forEach(function (poly) {
          polyholes = getPolyHoles(poly)
          holefeats.extend(polyholes)
        })
      } else {
        polyholes = getPolyHoles(currGeom)
        holefeats.extend(polyholes)
      }
      return holefeats
    }

    const testCoords = function (poly, coord) {
      let newPoly = null
      let skip = true
      let found = false
      poly.getLinearRings().forEach(function (ring) {
        if (skip) { // assume the first ring is the exterior ring.
          newPoly = new ol.geom.Polygon([ring.getCoordinates()])
          skip = false
        } else {
          const rcoord = ring.getFirstCoordinate()
          if (rcoord[0] !== coord[0] || rcoord[1] !== coord[1]) {
            newPoly.appendLinearRing(ring)
          } else {
            found = true
          }
        }
      })
      return found ? newPoly : poly
    }

    $('#draw-hole').button('disable')
    $('#delete-hole').button('disable')
    map.un('pointermove', layerinteractor.hoverDisplay)
    layerinteractor.select.setActive(false)
    layerinteractor.modify.setActive(false)

    const currFeat = layerinteractor.select.getFeatures().getArray()[0]
    let currGeom = currFeat.getGeometry()
    let holeFeats = getHoles(currGeom)

    const source = new ol.source.Vector({
      features: holeFeats
    })
    let holeOverlay = new ol.layer.Vector({
      source: source,
      type: 'overlay',
      style: holeStyle,
      zIndex: 9999
    })
    // holeOverlay.getSource().addFeatures(holeFeats);
    map.addLayer(holeOverlay)

    const removeHole = function (feature) {
      const geom = feature.getGeometry()
      let newGeom = new ol.geom.MultiPolygon(null)
      if (currGeom.getType() === 'MultiPolygon') {
        currGeom.getPolygons().forEach(function (poly) {
          const newPoly = testCoords(poly, geom.getFirstCoordinate())
          newGeom.appendPolygon(newPoly)
        })
      } else {
        newGeom = testCoords(currGeom, geom.getFirstCoordinate())
      }
      currGeom.setCoordinates(newGeom.getCoordinates())
    }

    let chooseHole = new ol.interaction.ChooseHole({
      holes: holeFeats
    })
    map.addInteraction(chooseHole)

    const finishHole = function () {
      layerinteractor.autoselect = true
      map.removeInteraction(chooseHole)
      map.removeLayer(holeOverlay)
      layerinteractor.modify.setActive(true)
      layerinteractor.select.setActive(true)
      // layerinteractor.translate.setActive(true);
      map.on('pointermove', layerinteractor.hoverDisplay)
      $('#draw-hole').button('enable')
      if (holeFeats.getArray().length > 0) {
        $('#delete-hole').button('enable')
      }
      $(document).off('keyup')
    }

    chooseHole.emitter.on('change', function () {
      feature = chooseHole.get('hole')
      if (feature !== null) {
        removeHole(feature)
      }
      finishHole()
    })

    $(document).on('keyup', function (evt) {
      if (evt.keyCode === 27) {
        finishHole()
      }
    })
  },

  addHoleControls: function () {
    // let addHoleDiv = this.createHoleButton('add', 'Draw a hole in the selected feature')
    // let RemoveHoleDiv = this.createHoleButton('remove', 'Delete a hole from the selected feature')
    // $formValue.append($('<button id="add-hole" class="ol-addhole ol-unselectable ol-control hole-buttons" title="Draw a hole in the selected feature">Draw</button>'));
    // $formValue.append($('<button id="remove-hole" class="ol-removehole ol-unselectable ol-control hole-buttons" title="Delete a hole from the selected feature">Delete</button>'));
    // let addHoleControl = new ol.control.Control({
    //   element: addHoleDiv
    // })
    // let RemoveHoleControl = new ol.control.Control({
    //   element: RemoveHoleDiv
    // })
    this.addControl(this.addAddHoleControl())
    this.addControl(this.addRemoveHoleControl())
    return this
  },
  addAddHoleControl: function () {
    let controlDiv = document.createElement('div')
    controlDiv.className = 'ol-addhole ol-unselectable ol-control'
    let controlButton = document.createElement('button')
    controlButton.textContent = ' '
    controlButton.title = 'Draw a hole in the selected feature'
    controlButton.addEventListener('click', function () {
      this.drawHole()
    })

    controlDiv.appendChild(controlButton)
    return new ol.control.Control({
      element: controlDiv
    })
  },

  addRemoveHoleControl: function () {
    let controlDiv = document.createElement('div')
    controlDiv.className = 'ol-removehole ol-unselectable ol-control'
    let controlButton = document.createElement('button')
    controlButton.textContent = ' '
    controlButton.title = 'Delete a hole from the selected feature'
    controlButton.addEventListener('click', function () {
      this.deleteHole()
    })

    controlDiv.appendChild(controlButton)
    return new ol.control.Control({
      element: controlDiv
    })
  },

  handleEvents: function (interaction, feature_type) {

    interaction.on('drawend', function (evt) {
      let geom = evt.feature.getGeometry()
      if (geom.getType().endsWith('Polygon') && !(isPolyValid(geom))) {
        return
      }
      let id = utils.FID.gen()

      evt.feature.setId(id)
      evt.feature.set('type', feature_type)
      evt.feature.set('name', utils.capitalizeFirstLetter(feature_type) + '-' + id)

      //TODO: The feature shouldn't be added to the layer yet.
      //TODO: Only after deselect should the layer be updated.
      //TODO: Need to Check.
      // let selectedLayer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
      // selectedLayer.getSource().addFeature(evt.feature);
      // this.activeFeatures.push(evt.feature);

      this.addedFeature = evt.feature
      activeControl.set('active', false)
      console.log('toolbar interaction drawend')
    }, this)
    return interaction
  }
}

export default result

if (module.hot) {
  module.hot.accept()
}
