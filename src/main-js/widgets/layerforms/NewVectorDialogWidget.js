/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const $ = require('jquery')
const utils = require('src/main-js/tools/utils')
const OSMFire_Core = require('MainCore')

require('bower_components/jquery-ui/jquery-ui')

let callback = function(sandBox) {

  let $dialog,
    $form,
    $fieldset,
    config

  return {
    init: function(cfg) {
      try {
        config = cfg
        sandBox.contextObj = this
        sandBox.log(1, 'New Vector Dialog Widget component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'New Vector Dialog Widget has NOT been initialized correctly --> ' + e.message)
      }
    },
    render: function() {
      $dialog = this.createNewVectorDialog()
      sandBox.setElement('body', $dialog)
      this.styleWidget($dialog)
      // this.registerForEvents();
      $dialog.dialog('open')
    },
    destroy: function(removeComponent) {
      sandBox.contextObj.unregisterFromEvents()
      if (removeComponent) {
        sandBox.removeComponentFromDom('widgetContainer')
      }
      sandBox.log(1, 'New Vector Dialog Widget has been destroyed...', 'blue')
    },
    registerForEvents: function() {
      sandBox.addEventHandlerToElement('notification_visit', 'click', this.handleAddLayerClick)
    },
    unregisterFromEvents: function() {
      sandBox.removeEventHandlerFromElement('notification_visit', 'click', this.handleAddLayerClick)
    },
    handleAddLayerClick: function() {
      sandBox.loadPage(stockSnapURL)
    },

    newVectorLayer: function ($form) {
      let geomType = $form.find('.geomtype').val()
      let layerType = $form.find('.layertype').val()
      let geomTypes = []
      let sourceTypes = {}
      let layerName
      let styleFunction
      if (layerType === 'feature') {
        geomTypes = ['point', 'line', 'polygon', 'geomcollection']
        sourceTypes = Object.keys(tobjectTemplates)
        layerName = geomType
        styleFunction = tobjectStyleFunction
      } else if (layerType === 'sensor') {
        geomTypes = ['point']
        sourceTypes = Object.keys(sensorTemplates)
        layerName = layerType
        styleFunction = sensorStyleFunction
      }
      if (sourceTypes.indexOf(geomType) === -1 && geomTypes.indexOf(geomType) === -1) {
        sandBox.message('Unrecognized layer type.')
        return false
      }

      let source0
      let source
      let layer
      source0 = sandBox.getSource('Vector', {
        wrapX: false
      })
      source0.set('pendingRequests', 0)
      source = sandBox.getSource('ImageVector', {
        source: source0,
        style: styleFunction
      })
      layer = sandBox.getLayer('Image', {
        source: source,
        name: $form.find('.displayname').val() || layerName + ' Layer',
        type: layerType,
        geomtype: geomType,
        opacity: 0.7
      })

      // let source = new ol.source.Vector({
      //     wrapX: false
      // });
      // source.set('pendingRequests', 0);
      // let layer = new ol.layer.Image({
      //     source: new ol.source.ImageVector({
      //         source: source,
      //         style: styleFunction
      //     }),
      //     name: $form.find(".displayname").val() || layerName + ' Layer',
      //     type: layerType,
      //     geomtype: geomType,
      //     opacity: 0.7
      // });

      layertree.addBufferIcon(layer)
      map.addLayer(layer)
      layer.getSource().getSource().changed()
      sandBox.message('New vector layer created successfully.')
      return this
    },

    createNewVectorDialog: function () {
      $dialog = $('<div>', {id: config.moduleId})
      $form = $('<form>', {id: 'newvectorform', class: 'addlayer'})
      $fieldset = $('<fieldset>')
      this.createDisplayNameNodes($fieldset)
      this.createLayerTypeNodes($fieldset)
      this.createGeomTypeNodes($fieldset)
      $fieldset.append($('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>'))
      $form.append($fieldset)
      $dialog.append($form)
      return $dialog
    },
    createDisplayNameNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-displayname">Display Name</label>'))
      $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'))
    },
    createLayerTypeNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-layertype">Layer Type</label>'))
      let $selectNode = $('<select id="open-layertype" name="layertype" class="layertype ui-selectmenu">')
      $selectNode.append(utils.createMenuOption('feature', 'Feature'))
      $selectNode.append(utils.createMenuOption('sensor', 'Sensor'))
      $fieldset.append($selectNode)
    },
    createGeomTypeNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-geomtype">Geometry Type</label>'))
      let $selectNode = $('<select id="open-geomtype" name="geomtype" class="geomtype ui-selectmenu">')
      $selectNode.append(utils.createMenuOption('geomcollection', 'Geometry Collection'))
      $selectNode.append(utils.createMenuOption('polygon', 'Polygon'))
      $selectNode.append(utils.createMenuOption('line', 'Line'))
      $selectNode.append(utils.createMenuOption('point', 'Point'))
      $fieldset.append($selectNode)
    },
    styleWidget: function($dialog) {
      $dialog.dialog({
        title: config.title,
        autoOpen: false,
        modal: true,
        close: function () {
          $(this).find('form')[0].reset()
          $(this).dialog('destroy')
          $(this).remove()
          // $(this).detach();
        }
      })
      $dialog.dialog( 'option', 'buttons', {
        'Add Layer': function () {
          // sandBox.contextObj.newVectorLayer($(this).children());
          sandBox.publishCustomEvent({
            type: 'newVectorLayer-Submitted',
            data: $(this).children()
          })
          $(this).dialog('close')
        },
        Cancel: function () {
          $(this).dialog('close')
        }
      })
      $dialog.find('form').on('submit', function (event) {
        event.preventDefault()
        // sandBox.contextObj.newVectorLayer($(this));
        sandBox.publishCustomEvent({
          type: 'newVectorLayer-Submitted',
          data: $(this)
        })
        $(this).parent().dialog('close')
      })
      $('#open-layertype').selectmenu().on('selectmenuchange', function () {
        let $geomType = $(this).parent().find('.geomtype')
        if ($(this).val() === 'sensor') {
          $geomType.val('point')
          $geomType.selectmenu('refresh')
          $geomType.selectmenu('disable')
        } else if ($(this).val() === 'feature') {
          $geomType.selectmenu('enable')
        }
      })
      $('.addlayer select').each(function () {
        $(this).selectmenu().selectmenu('menuWidget').addClass('overflow')
      })
    }
  }
}

OSMFire_Core.registerComponent('app-container', 'newVectorWidget', callback)
