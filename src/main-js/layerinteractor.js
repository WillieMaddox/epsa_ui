/**
 * Created by maddoxw on 9/6/16.
 */

'use strict'

import $ from 'jquery'
import ol from 'openlayers'
import map from 'map'
import exists from 'exists'
import toolbar from 'toolbar'
import layertree from 'layertree'
import isPolyValid from 'ispolyvalid'

// addFormRow = function (labels) {
//   var $formRow = $("<div class='form-row'>")
//   for (let label of labels) {
//     $formRow.append(this.formElements[label])
//   }
//   return $formRow
// }
// createDrawPolygonNodes = function () {}
// createDrawLinestringNodes = function () {}
// createDrawPointNodes = function () {}

let highlight = null
let highlightTextStyleCache = {}
let highlightGeomStyleCache = {}
let textStyleKey = 'name'
let geomStyleKey = 'type'

const result = {
  init: function () {

    const _this = this

    // this.highlight = null;
    // this.highlightTextStyleCache = {};
    // this.highlightGeomStyleCache = {};
    // this.textStyleKey = 'name';
    // this.geomStyleKey = 'type';

    this.autoselect = false
    this.featureOverlay = this.createFeatureOverlay()
    // map.addLayer(this.featureOverlay);
    this.hoverDisplay = function (evt) {
      if (evt.dragging) {
        return
      }
      _this.getFeatureAtPixel(evt)
      // TODO: delete these 3 lines.
      // var feature = _this.getFeatureAtPixel(evt);
      // _this.setMouseCursor(feature);
      // _this.displayFeatureInfo(feature);
    }
    this.addInteractions()

    map.addInteraction(this.select)
    this.select.setActive(true)

    map.on('pointermove', this.hoverDisplay)
    map.addInteraction(this.modify)
    this.modify.setActive(false)

    $('#map').on('mouseleave', function () {
      if (highlight) {
        _this.featureOverlay.getSource().clear()
        highlight = null
      }
    })

    layertree.deselectEventEmitter.on('change', function () {
      if (layertree.selectedLayer) {
        console.log('layerinteractor: deselected layer YES')
      } else {
        console.log('layerinteractor: deselected layer NO')
      }
      const selectedFeatures = this.select.getFeatures()
      if (selectedFeatures.getLength() === 1) {
        this.layer.getSource().getSource().addFeature(selectedFeatures.getArray()[0])
        selectedFeatures.clear()
      }
      this.editor.$form = $('.layereditor > form').detach()
      layertree.layerEditors[this.layer.get('type')] = this.editor
      this.editor = null
    }, this)

    layertree.selectEventEmitter.on('change', function () {
      this.layer = layertree.getLayerById(layertree.selectedLayer.id)
      textStyleKey = this.layer.get('textstyle')
      geomStyleKey = this.layer.get('geomstyle')
      this.layer.on('propertychange', function (evt) {
        if (evt.key === 'textstyle') {
          textStyleKey = this.get('textstyle')
          highlightTextStyleCache = {}
        }
        if (evt.key === 'geomstyle') {
          geomStyleKey = this.get('geomstyle')
          highlightGeomStyleCache = {}
        }
        if (evt.key === 'headers') {
          highlightTextStyleCache = {}
          highlightGeomStyleCache = {}
        }
      })
      $('.colorbutton').click(function () {
        highlightGeomStyleCache = {}
      })
      $('.resetbutton').click(function () {
        highlightGeomStyleCache = {}
      })
      // if (this.layer.get('type') === 'feature') {
      //     this.editor = featureeditor
      // }
      this.editor = layertree.layerEditors[this.layer.get('type')]
      this.editor.$form.appendTo($('.layereditor'))
      if (!(this.editor.isStyled)) {
        this.editor.styleForm()
      }
      this.editor.deactivateForm()
    }, this)
  },
  textStyle: function (text) {
    return new ol.style.Style({
      text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        text: text,
        offsetY: -20,
        stroke: new ol.style.Stroke({
          color: [255, 255, 255],
          width: 5
        }),
        fill: new ol.style.Fill({
          color: [0, 0, 0]
        })
      })
    })
  },
  createFeatureOverlay: function () {
    const _this = this
    const overlayStyleFunction = (function () {
      return function (feature) {
        let retval
        const textkey = feature.get(textStyleKey) ? feature.get(textStyleKey).toString() : ''
        const geomkey = feature.get(geomStyleKey)

        if (!highlightTextStyleCache[textkey]) {
          highlightTextStyleCache[textkey] = _this.textStyle(textkey)
        }
        if ($('#' + _this.layer.get('id') + '-hovervisible').is(':checked')) {
          retval = [highlightGeomStyleCache[geomkey], highlightTextStyleCache[textkey]]
        } else {
          retval = [highlightGeomStyleCache[geomkey]]
        }
        return retval
      }
    })()
    return new ol.layer.Vector({
      source: new ol.source.Vector(),
      // Should probably attach the map to the overlay here so that the map doesn't manage the overlay.
      // Need to test this.
      map: map,
      type: 'overlay',
      style: overlayStyleFunction,
      zIndex: 9900
    })
  },
  getFeatureAtPixel: function (evt) {
    let feature
    let smallestArea = 5.1e14 // approximate surface area of the earth
    let smallestFeature = null
    let smallestFeatureLayer = null
    const pixel = map.getEventPixel(evt.originalEvent)
    let featureAndLayer = map.forEachFeatureAtPixel(pixel, (function (feat, layer) {
      const geom = feat.getGeometry()
      if (geom.getType().endsWith('Point')) {
        return {feature: feat, layer: layer}
      }
      if (geom.getType().endsWith('LineString')) {
        return {feature: feat, layer: layer}
      }
      if (geom.getType().endsWith('Polygon')) {
        if (feat.get('type') === 'aor') {
          const coord = map.getCoordinateFromPixel(pixel)
          const point = geom.getClosestPoint(coord)
          const pixel1 = map.getPixelFromCoordinate(point)
          if (Math.abs(pixel[0] - pixel1[0]) < 8 && Math.abs(pixel[1] - pixel1[1]) < 8) {
            return {feature: feat, layer: layer}
          }
        } else {
          const area = geom.getArea()
          if (area < smallestArea) {
            smallestArea = area
            smallestFeature = feat
            smallestFeatureLayer = layer
          }
        }
      }
    }).bind(this), {
      layerFilter: (function (layer) {
        if (this.layer) {
          return layer === this.layer
        }
      }).bind(this)
    })
    if (!(exists(featureAndLayer))) {
      featureAndLayer = {}
      featureAndLayer.feature = smallestFeature
      featureAndLayer.layer = smallestFeatureLayer
    }
    if (exists(featureAndLayer.feature)) {
      feature = featureAndLayer.feature
      const text = feature.get(geomStyleKey)
      if (!highlightGeomStyleCache[text]) {
        const sf = featureAndLayer.layer.getSource().getStyleFunction()
        const styles = sf(feature)
        const style = styles[styles.length - 1].clone()
        if (text === 'camera') {
          highlightGeomStyleCache[text] = this.setSensorStyle(style)
        } else {
          highlightGeomStyleCache[text] = this.setFeatureStyle(style)
        }
      }
    } else {
      feature = null
    }
    // return feature;
    this.setMouseCursor(feature)
    this.displayFeatureInfo(feature)
  },
  setSensorStyle: function (style) {
    if (style) {
      const image = style.getImage()
      if (exists(image)) {
        image.setOpacity(1)
        image.setScale(0.3)
        if (image.getImage().tagName === 'IMG') {
          image.setOpacity(0.5)
        }
      }
    }
    return style
  },
  setFeatureStyle: function (style) {
    if (style) {
      let image
      let fill
      let radius
      let stroke
      let width
      let color

      image = style.getImage()
      if (exists(image)) {
        fill = image.getFill()
        if (exists(fill)) {
          color = fill.getColor()
          color[3] = 0.1
          fill.setColor(color)
        }
        stroke = image.getStroke()
        if (exists(stroke)) {
          width = stroke.getWidth()
          width = width + 1
          stroke.setWidth(width)
        }
        radius = image.getRadius()
        if (exists(radius)) {
          radius = radius + 2
        }
        image.setRadius(radius)
      }
      fill = style.getFill()
      if (exists(fill)) {
        color = fill.getColor()
        color[3] = 0.4
        fill.setColor(color)
      }
      stroke = style.getStroke()
      if (exists(stroke)) {
        width = stroke.getWidth()
        width = width + 1
        stroke.setWidth(width)
      }
    }
    return style
  },
  setMouseCursor: function (feature) {
    if (feature) {
      map.getTarget().style.cursor = 'pointer'
    } else {
      map.getTarget().style.cursor = ''
    }
  },
  displayFeatureInfo: function (feature) {
    if (feature !== highlight) {
      if (highlight) {
        this.featureOverlay.getSource().removeFeature(highlight)
      }
      if (feature) {
        this.featureOverlay.getSource().addFeature(feature)
      }
      highlight = feature
    }
  },
  addInteractions: function () {
    const _this = this

    this.select = new ol.interaction.Select({
      layers: [this.featureOverlay],
      style: function (feature) {
        if (feature.get('type') === 'camera') {
          return [new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              color: [0, 153, 255],
              opacity: 0.5,
              scale: 0.05,
              snapToPixel: false,
              src: './img/camera-normal.png'
            }))
          })]
        } else {
          return _this.featureOverlay.getStyleFunction()(feature)
        }
      },
      toggleCondition: ol.events.condition.never,
      condition: function (evt) {
        if (ol.events.condition.singleClick(evt) || ol.events.condition.doubleClick(evt)) {
          if (toolbar.addedFeature || _this.autoselect) {
            toolbar.addedFeature = null
            _this.autoselect = false
            return false
          }
          return true
        }
      }
    })
    this.select.on('select', function (evt) {
      let feature
      // Handle the deselect first so we can move the feature back to the selected layer.
      if (evt.deselected.length === 1) {
        feature = evt.deselected[0]
        _this.modify.setActive(false)
        // translate.setActive(false);
        console.log('manual deselect:', feature.get('name'), feature.getRevision())
        _this.editor.loadFeature(feature)
        _this.editor.deactivateForm()
        _this.layer.getSource().getSource().addFeature(feature)
        // _this.activeFeatures.push(feature);

        // transactWFS('insert', evt.feature);
        // source.once('addfeature', function (evt) {
        //     var parser = new ol.format.GeoJSON();
        //     var features = source.getFeatures();
        //     var featuresGeoJSON = parser.writeFeatures(features, {
        //         featureProjection: 'EPSG:3857',
        //     });
        //     console.log(featuresGeoJSON)
        //     $.ajax({
        //         url: 'test_project/features.geojson', // what about aor?
        //         type: 'POST',
        //         data: featuresGeoJSON
        //     }).then(function (response) {
        //         console.log(response);
        //     });
        // });
      }
      if (evt.selected.length === 1) {
        feature = evt.selected[0]
        _this.modify.setActive(true)
        //translate.setActive(true);
        console.log('manual select:  ', feature.get('name'), feature.getRevision())
        _this.editor.activateForm(feature)
        _this.layer.getSource().getSource().removeFeature(feature)
        // _this.activeFeatures.push(feature);
        _this.hoverDisplay(evt.mapBrowserEvent)
      }
    })

    let origGeom
    this.modify = new ol.interaction.Modify({
      features: this.select.getFeatures()
    })
    this.modify.on('modifystart', function (evt) {
      origGeom = evt.features.getArray()[0].getGeometry().clone()
    })
    this.modify.on('modifyend', function (evt) {
      if (!(isPolyValid(evt.features.getArray()[0].getGeometry()))) {
        evt.features.getArray()[0].getGeometry().setCoordinates(origGeom.getCoordinates())
      }
    })

    // When the translate interaction is active, it
    // causes the mouse cursor to turn into a
    // pointer when hovering over the interior
    // of the AOR. Need to find out why.
    // Disable until solution is found.
    //
    // var translate = new ol.interaction.Translate({
    //     features: select.getFeatures()
    // });
    // map.addInteraction(translate);
    // translate.setActive(false);

    const remove = function (evt) {
      // console.log(evt.keyCode);
      if (exists(highlight) && evt.keyCode === 46) { //delete key pressed
        _this.layer.getSource().getSource().removeFeature(highlight)
        _this.featureOverlay.getSource().clear()
        highlight = null
      }
    }
    $(document).on('keydown', remove)

    toolbar.drawEventEmitter.on('change', function () {
      let selectedFeatures = _this.select.getFeatures()
      let selectedFeature
      if (toolbar.active === true) {
        map.un('pointermove', _this.hoverDisplay)

        if (selectedFeatures.getArray().length === 1) {
          selectedFeature = selectedFeatures.getArray()[0]
          _this.editor.loadFeature(selectedFeature)
          _this.editor.deactivateForm()
          console.log('auto deselect:', selectedFeature.get('name'), selectedFeature.getRevision())

          // var selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
          // selectedLayer.getSource().getSource().addFeature(feature);
          // _this.activeFeatures.push(feature);

          // selectedFeatures.clear()
        } else {
          console.log('ERROR: selectedFeatures.getArray().length = ', selectedFeatures.getArray().length)
        }

        // translate.setActive(false);
        _this.modify.setActive(false)
        _this.select.setActive(false)
      } else {
        _this.select.setActive(true)
        _this.modify.setActive(true)
        // translate.setActive(true);

        if (toolbar.addedFeature) {
          selectedFeatures.push(toolbar.addedFeature)
          selectedFeature = toolbar.addedFeature

          _this.editor.activateForm(selectedFeature)
          console.log('auto select:  ', selectedFeature.get('name'), selectedFeature.getRevision())
        } else {
          console.log('HHHHHHHERREE!!!')
        }

        map.on('pointermove', _this.hoverDisplay)
        console.log(selectedFeature)
      }
    })
  }
}

export default result
