/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const $ = require('jquery')
const utils = require('utils')
const OSMFire_Core = require('MainCore')

require('jquery-ui')

let callback = function(sandBox) {

  let $dialog,
    $form,
    $fieldset,
    config

  return {
    init: function (cfg) {
      try {
        config = cfg
        sandBox.contextObj = this
        sandBox.log(1, 'Add WMS Dialog Widget component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'Add WMS Dialog Widget has NOT been initialized correctly --> ' + e.message)
      }
    },
    render: function() {
      $dialog = this.createAddWmsDialog()
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
      sandBox.log(1, 'Add WMS Dialog Widget has been destroyed...', 'blue')
    },

    checkWmsLayer: function ($button) {

      let $form = $button.form()
      $button.button('disable')
      $form.find('.layername').empty()
      $form.find('.format').empty()
      let serverUrl = $form.find('.url').val()
      serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl
      $form.find('.url').val(serverUrl)
      serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?'
      let query = 'SERVICE=WMS&REQUEST=GetCapabilities'
      let url = settings.proxyUrl + serverUrl + query
      console.log(url)

      $.ajax({
        type: 'GET',
        url: url
      }).done(function (response) {
        // let parser = new ol.format.WMSCapabilities();
        let currentProj = sandBox.getView().getProjection().getCode()
        let parser = sandBox.getFormat('wmscapabilities')
        let capabilities = parser.read(response)
        let crs, i
        let messageText = 'Layers read successfully.'
        if (capabilities.version === '1.3.0') {
          crs = capabilities.Capability.Layer.CRS
        } else {
          crs = [currentProj]
          messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').'
        }
        let layers = capabilities.Capability.Layer.Layer
        if (layers.length > 0 && crs.indexOf(currentProj) > -1) {
          let nLayers = layers.length
          for (i = 0; i < nLayers; i += 1) {
            $form.find('.layername').append(utils.createMenuOption(layers[i].Name))
          }
          let formats = capabilities.Capability.Request.GetMap.Format
          let nFormats = formats.length
          for (i = 0; i < nFormats; i += 1) {
            $form.find('.format').append(utils.createMenuOption(formats[i]))
          }
          sandBox.message(messageText)
        }
      }).fail(function (error) {
        sandBox.message('Some unexpected error occurred in checkWmsLayer: (' + error.message + ').')
      }).always(function () {
        $form.find('.layername').selectmenu('refresh')
        $form.find('.format').selectmenu('refresh')
        $button.button('enable')
      })
    },
    addWmsLayer: function ($form) {
      let sourceParams = {
        url: $form.find('.url').val(),
        params: {
          layers: $form.find('.layername').val(),
          format: $form.find('.format').val()
        }
      }
      let source
      let layer
      if ($form.find('.tiled').is(':checked')) {
        source = sandBox.getSource('TileWMS', sourceParams)
        layer = sandBox.getLayer('Tile', {
          source: source,
          name: $form.find('.displayname').val(),
          opacity: 0.7
        })
      } else {
        source = sandBox.getSource('ImageWMS', sourceParams)
        layer = sandBox.getLayer('Image', {
          source: source,
          name: $form.find('.displayname').val(),
          opacity: 0.7
        })
      }

      // if ($form.find(".tiled").is(":checked")) {
      //     layer = new ol.layer.Tile({
      //         source: new ol.source.TileWMS(params),
      //         name: $form.find(".displayname").val(),
      //         opacity: 0.7
      //     });
      // } else {
      //     layer = new ol.layer.Image({
      //         source: new ol.source.ImageWMS(params),
      //         name: $form.find(".displayname").val(),
      //         opacity: 0.7
      //     });
      // }

      map.addLayer(layer)
      sandBox.message('WMS layer added successfully.')
      return this
    },

    createAddWmsDialog: function () {
      $dialog = $('<div>', {id: config.moduleId})
      $form = $('<form>', {id: 'addwmsform', class: 'addlayer'})
      $fieldset = $('<fieldset>')
      this.createDisplayNameNodes($fieldset)
      this.createServerUrlNodes($fieldset)
      this.createLayerNameNodes($fieldset)
      this.createFormatNodes($fieldset)
      this.createTiledNodes($fieldset)
      $fieldset.append($('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>'))
      $form.append($fieldset)
      $dialog.append($form)
      return $dialog
    },
    createDisplayNameNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-displayname">Display Name</label>'))
      $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'))
    },
    createServerUrlNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-url">Server URL</label>'))
      $fieldset.append($('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/wms">'))
      $fieldset.append($('<input type="button" id="open-check" name="check" value="Check for layers">'))
    },
    createLayerNameNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-layername">Layer Name</label>'))
      $fieldset.append($('<select id="open-layername" name="layername" class="layername ui-selectmenu">'))
    },
    createFormatNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-format">Format</label>'))
      $fieldset.append($('<select id="open-format" name="format" class="format ui-selectmenu">'))
    },
    createTiledNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-tiled">Tiled</label>'))
      $fieldset.append($('<input type="checkbox" id="open-tiled" name="tiled" class="tiled">'))
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
        }
      })
      $dialog.dialog( 'option', 'buttons', {
        'Add Layer': function () {
          // sandBox.contextObj.addWmsLayer($(this).children());
          sandBox.publishCustomEvent({
            type: 'addWmsLayer-Submitted',
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
        // sandBox.contextObj.addWmsLayer($(this));
        sandBox.publishCustomEvent({
          type: 'addWmsLayer-Submitted',
          data: $(this)
        })
        $(this).parent().dialog('close')
      })

      $('#open-url').on('change', function () {
        let $layername = $(this).parent().find('.layername')
        $layername.empty()
        $layername.selectmenu('refresh')
        $(this).parent().find('.displayname').val('')
        let $format = $(this).parent().find('.format')
        $format.empty()
        $format.selectmenu('refresh')
      })
      $('#open-check').button().on('click', function () {
        // _this.checkWmsLayer($(this));
        sandBox.publishCustomEvent({
          type: 'checkWmsLayer-Clicked',
          data: $(this)
        })
      })
      $('#open-tiled').checkboxradio()
      $('#open-layername').selectmenu().on('selectmenuchange', function () {
        $(this).parent().find('.displayname').val($(this).val())
      })
      $('.addlayer select').each(function () {
        $(this).selectmenu().selectmenu('menuWidget').addClass('overflow')
      })
    }
  }
}

OSMFire_Core.registerComponent('app-container', 'addWmsWidget', callback)
