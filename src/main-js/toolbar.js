/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

import ol from 'openlayers'
import map from 'map'
import utils from 'utils'
import layertree from 'layertree'
import isPolyValid from 'ispolyvalid'
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
    this.addDrawToolBar()
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
