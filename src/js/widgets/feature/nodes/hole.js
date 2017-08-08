import $ from 'jquery'
import ol from 'openlayers'
import map from 'map'
import utils from 'utils'
import exists from 'exists'
import isPolyValid from 'ispolyvalid'
import isPointInPoly from 'ispointinpoly'
import layerinteractor from 'layerinteractor'
import doesPolyCoverHole from 'doespolycoverhole'

'use strict'

const result = (function () {

  class Hole {
    constructor () {
      // console.log('hole constructor() called')
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    drawHole () {
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
    }
    deleteHole () {

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
    }
    createHoleButton (label, title) {
      const $buttonElem = $('<button id="' + label + '-hole">')
      $buttonElem.addClass('ol-unselectable ol-control hole-buttons')
      $buttonElem.val(utils.capitalizeFirstLetter(label))
      $buttonElem.attr('title', title)
      return $buttonElem
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formElem.append($("<div id='hole-label' class='form-label'>Hole</div>"))
      $formValue.append(this.createHoleButton('draw', 'Draw a hole in the selected feature'))
      $formValue.append(this.createHoleButton('delete', 'Delete a hole from the selected feature'))
      // $formValue.append($('<button id="draw-hole" class="ol-unselectable ol-control hole-buttons" title="Draw a hole in the selected feature">Draw</button>'))
      // $formValue.append($('<button id="delete-hole" class="ol-unselectable ol-control hole-buttons" title="Delete a hole from the selected feature">Delete</button>'))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {
      //TODO: Make sure event listeners are being removed properly.  May need to create a new function that is bound.
      //See https://stackoverflow.com/questions/30446622/es6-access-to-this-with-addeventlistener-applied-on-method
      $('#draw-hole').button({
        label: 'Draw'
      }).on('click', this.drawHole)
      $('#delete-hole').button({
        label: 'Delete'
      }).on('click', this.deleteHole)
    }
    loadFeature (feature) {
      const $deleteHole = $('#delete-hole')
      $deleteHole.button('disable')
      if (feature.getGeometry().getType().endsWith('Polygon')) {
        // $('#hole-label').removeClass('disabled')
        // $('#draw-hole').button('enable')
        if (feature.getGeometry().getType() === 'MultiPolygon') {
          const nPolygons = feature.getGeometry().getPolygons().length
          for (let i = 0; i < nPolygons; i++) {
            if (feature.getGeometry().getPolygon(i).getLinearRingCount() > 1) {
              $deleteHole.button('enable')
            }
          }
        } else if (feature.getGeometry().getLinearRingCount() > 1) {
          $deleteHole.button('enable')
        }
      }
    }
    saveFeature (feature) {}
    // deactivateNode () {
    //   $('.ol-addhole').button('disable')
    //   $('.ol-removehole').button('disable')
    // }
    // registerForEvents () {
    //   sandBox.addEventHandlerToElement('draw-hole', 'click', this.handleDrawHoleClicked)
    //   sandBox.addEventHandlerToElement('delete-hole', 'click', this.handleDeleteHoleClicked)
    // }
    // unregisterFromEvents () {
    //   sandBox.removeEventHandlerFromElement('draw-hole', 'click', this.handleDrawHoleClicked)
    //   sandBox.removeEventHandlerFromElement('delete-hole', 'click', this.handleDeleteHoleClicked)
    // }
    // handleDrawHoleClicked (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'drawhole-clicked',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
    // handleDeleteHoleClicked (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'deletehole-clicked',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
  }
  return Hole
})()

export default result
