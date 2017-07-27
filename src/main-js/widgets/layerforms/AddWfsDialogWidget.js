/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const $ = require('jquery')
const utils = require('src/main-js/tools/utils')
const WFSContext = require('src/main-js/WFS110Context')
const settings = require('serversettings')
const OSMFire_Core = require('MainCore')

require('bower_components/jquery-ui/jquery-ui')

let callback = function(sandBox) {

  let wfsProjections = null
  let $dialog,
    $form,
    $fieldset,
    config

  return {
    init: function (cfg) {
      try {
        config = cfg
        sandBox.contextObj = this
        sandBox.log(1, 'Add WFS Dialog Widget component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'Add WFS Dialog Widget has NOT been initialized correctly --> ' + e.message)
      }
    },
    render: function() {
      $dialog = this.createAddWfsDialog()
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
      sandBox.log(1, 'Add WFS Dialog Widget has been destroyed...', 'blue')
    },

    checkWfsLayer: function ($button) {

      let $form = $button.form()
      $button.button('disable')
      $form.find('.layername').empty()
      wfsProjections = {}
      let serverUrl = $form.find('.url').val()
      serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl
      $form.find('.url').val(serverUrl)
      serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?'
      let query = 'SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities'
      let url = settings.proxyUrl + serverUrl + query

      $.ajax({
        type: 'GET',
        url: url
      }).done(function (response) {
        let unmarshaller = WFSContext.createUnmarshaller()
        let capabilities = unmarshaller.unmarshalDocument(response).value
        let messageText = 'Layers read successfully.'
        if (capabilities.version !== '1.1.0') {
          messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').'
        }
        let layers = capabilities.featureTypeList.featureType
        let nLayers = layers.length
        if (nLayers > 0) {
          let re = /}(.*)/
          for (let i = 0; i < nLayers; i += 1) {
            let name = re.exec(layers[i].name)[1]
            $form.find('.layername').append(utils.createMenuOption(name))
            wfsProjections[name] = layers[i].defaultSRS
          }
          sandBox.message(messageText)
        }
      }).fail(function (error) {
        sandBox.message('Some unexpected error occurred in checkWfsLayer: (' + error.message + ').')
      }).always(function () {
        $form.find('.layername').selectmenu('refresh')
        $button.button('enable')
      })
    },
    addWfsLayer: function ($form) {

      let buildQueryString = function (options) {
        let queryArray = []
        queryArray.push('SERVICE=WFS')
        queryArray.push('VERSION=1.1.0')
        queryArray.push('REQUEST=GetFeature')
        if (options.typeName) {
          queryArray.push('TYPENAME=' + options.typeName)
        }
        if (options.proj) {
          queryArray.push('SRSNAME=' + options.proj)
        }
        if (options.extent) {
          queryArray.push('BBOX=' + options.extent.join(','))
        }
        return queryArray.join('&')
      }

      let loader = function (extent, res, mapProj) {
        let query = buildQueryString({typeName: typeName, proj: proj, extent: extent})
        $.ajax({
          type: 'GET',
          url: settings.proxyUrl + serverUrl + query,
          beforeSend: function () {
            if (source.get('pendingRequests') === 0) {
              $progressbar = $("<div class='buffering'></div>")
              $progressbar.append($('#' + layer.get('id') + ' .layertitle'))
              $progressbar.progressbar({value: false})
              $progressbar.insertBefore($('#' + layer.get('id') + ' .layeropacity'))
            }
            source.set('pendingRequests', source.get('pendingRequests') + 1)
            console.log('Pending', source.get('pendingRequests'), 'res', res)
          }
        }).done(function (response) {
          console.log('*******************************************')
          let t0 = new Date().getTime()
          let features = formatWFS.readFeatures(response, {
            dataProjection: proj,
            featureProjection: mapProj.getCode()
          })
          let t1 = new Date().getTime()
          let nAdd = features.length
          console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAdd, 'n/t=', nAdd / (t1 - t0))
          let nBefore = source.getFeatures().length
          t0 = new Date().getTime()
          source.addFeatures(features)
          t1 = new Date().getTime()
          let nAfter = source.getFeatures().length
          console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAfter - nBefore, 'n/t=', (nAfter - nBefore) / (t1 - t0))
        }).fail(function (response) {
          sandBox.message('Some unexpected error occurred in addWfsLayer: (' + response.message + ').')
        })
      }

      let $progressbar
      let typeName = $form.find('.layername').val()
      let proj = wfsProjections[typeName]
      // let formatWFS = new ol.format.WFS();
      let formatWFS = sandBox.getFormat('wfs')
      let serverUrl = $form.find('.url').val()
      serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl
      serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?'

      let source
      let source2
      let layer
      let strategy

      // if ($form.find(".tiled").is(":checked")) {
      //     strategy = ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
      // } else {
      //     strategy = ol.loadingstrategy.bbox
      // }
      // source = new ol.source.Vector({
      //     loader: loader,
      //     strategy: strategy,
      //     wrapX: false
      // });
      // source.set('pendingRequests', 0);
      // layer = new ol.layer.Image({
      //     source: new ol.source.ImageVector({
      //         source: source
      //     }),
      //     name: $form.find(".displayname").val(),
      //     opacity: 0.7
      // });

      if ($form.find('.tiled').is(':checked')) {
        strategy = sandBox.getLoadingStrategy('tile')
      } else {
        strategy = sandBox.getLoadingStrategy('bbox')
      }
      source = sandBox.getSource('Vector', {
        loader: loader,
        strategy: strategy,
        wrapX: false,
        pendingRequests: 0
      })
      // source.set('pendingRequests', 0);
      source2 = sandBox.getSource('ImageVector', {
        source: source
      })
      layer = sandBox.getLayer('Image', {
        source: source2,
        name: $form.find('.displayname').val(),
        opacity: 0.7
      })

      // layertree.addBufferIcon(layer);

      source.on('change', function (evt) {
        let id = '#' + layer.get('id')
        let hasFeatures
        if (evt.target.getState() === 'ready') {
          if (source.get('pendingRequests') > 0) {
            source.set('pendingRequests', source.get('pendingRequests') - 1)
            // console.log('Remaining', source.get('pendingRequests'));
            // Only unwrap layers with progressbar (i.e. addWfs and addVector)
            if (source.get('pendingRequests') === 0) {
              $(id + ' .layertitle').unwrap()
            }
          }
          if (source.get('pendingRequests') === 0) {
            layer.buildHeaders()
          }
          if (source.getFeatures().length === 0) {
            hasFeatures = 'disable'
          } else {
            hasFeatures = 'enable'
          }
          $(id + '-hovercontrol').controlgroup(hasFeatures)
          $(id + '-colorcontrol').controlgroup(hasFeatures)

        } else {
          $(id).addClass('error')
        }
      })

      sandBox.publishCustomEvent({
        type: 'addWfsLayer-Created',
        data: layer
      })

      sandBox.addLayer(layer)
      // map.addLayer(layer);
      sandBox.message('WFS layer added successfully.')
      return this
    },

    createAddWfsDialog: function () {
      $dialog = $('<div>', {id: config.moduleId})
      $form = $('<form>', {id: 'addwfsform', class: 'addlayer'})
      $fieldset = $('<fieldset>')
      this.createDisplayNameNodes($fieldset)
      this.createServerUrlNodes($fieldset, 'wfs')
      this.createLayerNameNodes($fieldset)
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
      $fieldset.append($('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/wfs">'))
      $fieldset.append($('<input type="button" id="open-check" name="check" value="Check for layers">'))
    },
    createLayerNameNodes: function ($fieldset) {
      $fieldset.append($('<label for="open-layername">Layer Name</label>'))
      $fieldset.append($('<select id="open-layername" name="layername" class="layername ui-selectmenu">'))
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
          sandBox.contextObj.addWfsLayer($(this).children())
          sandBox.publishCustomEvent({
            type: 'addWfsLayer-Submitted',
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
        sandBox.contextObj.addWfsLayer($(this))
        sandBox.publishCustomEvent({
          type: 'addWfsLayer-Submitted',
          data: $(this)
        })
        $(this).parent().dialog('close')
      })
      $('#open-url').on('change', function () {
        // for both addwms and addwfs.
        let $layername = $(this).parent().find('.layername')
        $layername.empty()
        $layername.selectmenu('refresh')
        $(this).parent().find('.displayname').val('')
      })
      $('#open-check').button().on('click', function () {
        sandBox.contextObj.checkWfsLayer($(this))
        sandBox.publishCustomEvent({
          type: 'checkWfsLayer-Clicked',
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
    },
  }
}

OSMFire_Core.registerComponent('app-container', 'addWfsWidget', callback)
