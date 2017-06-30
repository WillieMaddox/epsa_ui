/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

// const $ = require('jquery')
const ol = require('openlayers'),
  map = require('map'),
  shp = require('shp'),
  utils = require('utilities'),
  message = require('messagebar'),
  layertree = require('layertree'),
  WFSContext = require('wfs110context'),
  tobjectTemplates = require('ttemplate'),
  tobjectStyleFunction = require('tstylefunction'),
  sensorTemplates = require('stemplate'),
  sensorStyleFunction = require('sstylefunction'),
  settings = require('serversettings')

require('jquery-ui')

let wfsProjections = null
// let WFSContext = null

module.exports = {
  init: function () {
    let $controlDiv = $('#layertoolbar-container')
    $controlDiv.addClass('layertree-buttons')
    $controlDiv.append(this.createButton('add-wms', 'Add WMS Layer', 'addlayer'))
    $controlDiv.append(this.createButton('add-wfs', 'Add WFS Layer', 'addlayer'))
    $controlDiv.append(this.createButton('add-vector', 'Add Vector Layer', 'addlayer'))
    $controlDiv.append(this.createButton('new-vector', 'New Vector Layer', 'addlayer'))
    $controlDiv.append(this.createButton('save-vector', 'Save Vector Layer', 'savelayer'))
    $controlDiv.append(this.createButton('delete-layer', 'Remove Layer', 'deletelayer'))
  },

  createButton: function (elemName, elemTitle, elemType) {
    let _this = this
    let $button = $('<button class="' + elemName + '" title="' + elemTitle + '">').button()
    if (elemType === 'addlayer') {
      $button.on('click', function () {
        _this.openDialog(elemName, elemTitle)
      })
      return $button
    } else if (elemType === 'savelayer') {
      $button.on('click', function () {
        let layernode = layertree.selectedLayer
        if (layernode === null) {
          return false
        }
        let layer = layertree.getLayerById(layernode.id)
        if (layer.get('is_dirty') === false) {
          return false
        }
        if (layer.get('is_dirty') === true) {
          _this.openDialog(elemName, elemTitle)
        }
      })
      return $button
    } else if (elemType === 'deletelayer') {
      $button.on('click', function () {
        layertree.removeLayer()
      })
      return $button
    } else {
      return false
    }
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
      let parser = new ol.format.WMSCapabilities()
      let capabilities = parser.read(response)
      let currentProj = map.getView().getProjection().getCode()
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
        message(messageText)
      }
    }).fail(function (error) {
      message('Some unexpected error occurred in checkWmsLayer: (' + error.message + ').')
    }).always(function () {
      $form.find('.layername').selectmenu('refresh')
      $form.find('.format').selectmenu('refresh')
      $button.button('enable')
    })
  },
  addWmsLayer: function ($form) {
    let params = {
      url: $form.find('.url').val(),
      params: {
        layers: $form.find('.layername').val(),
        format: $form.find('.format').val()
      }
    }
    let layer
    if ($form.find('.tiled').is(':checked')) {
      layer = new ol.layer.Tile({
        source: new ol.source.TileWMS(params),
        name: $form.find('.displayname').val(),
        opacity: 0.7
      })
    } else {
      layer = new ol.layer.Image({
        source: new ol.source.ImageWMS(params),
        name: $form.find('.displayname').val(),
        opacity: 0.7
      })
    }
    map.addLayer(layer)
    message('WMS layer added successfully.')
    return this
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

      // if (WFSContext === null) {
      //   WFSContext = require('wfs110context')
      // }

      let unmarshaller = WFSContext.createUnmarshaller()
      let capabilities = unmarshaller.unmarshalDocument(response).value
      let messageText = 'Layers read successfully.'
      if (capabilities.version !== '1.1.0') {
        messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').'
      }
      let layers = capabilities.featureTypeList.featureType
      let nLayers = layers.length
      if (nLayers > 0) {
        const re = /}(.*)/
        for (let i = 0; i < nLayers; i += 1) {
          let name = re.exec(layers[i].name)[1]
          $form.find('.layername').append(utils.createMenuOption(name))
          wfsProjections[name] = layers[i].defaultSRS
        }
        message(messageText)
      }
    }).fail(function (error) {
      message('Some unexpected error occurred in checkWfsLayer: (' + error.message + ').')
    }).always(function () {
      $form.find('.layername').selectmenu('refresh')
      $button.button('enable')
    })
  },
  addWfsLayer: function ($form) {

    let t0, t1, nAdd, nBefore, nAfter
    let source, strategy, layer
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
    let typeName = $form.find('.layername').val()
    let proj = wfsProjections[typeName]
    let featureProjection
    let formatWFS = new ol.format.WFS()
    let serverUrl = $form.find('.url').val()
    serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl
    serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?'

    function loadend(response) {
      console.log('*******************************************')
      t0 = new Date().getTime()
      let features = formatWFS.readFeatures(response, {
        dataProjection: proj,
        featureProjection: featureProjection
      })
      t1 = new Date().getTime()
      nAdd = features.length
      console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAdd, 'n/t=', nAdd / (t1 - t0))
      nBefore = source.getFeatures().length
      t0 = new Date().getTime()
      source.addFeatures(features)
      t1 = new Date().getTime()
      nAfter = source.getFeatures().length
      console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAfter - nBefore, 'n/t=', (nAfter - nBefore) / (t1 - t0))
    }
    function loader(extent, res, mapProj) {
      let query = buildQueryString({typeName: typeName, proj: proj, extent: extent})
      featureProjection = mapProj.getCode()
      $.ajax({
        type: 'GET',
        url: settings.proxyUrl + serverUrl + query,
        beforeSend: function () {
          if (source.get('pendingRequests') === 0) {
            let $progressbar = $("<div class='buffering'></div>")
            $progressbar.append($('#' + layer.get('id') + ' .layertitle'))
            $progressbar.progressbar({value: false})
            $progressbar.insertBefore($('#' + layer.get('id') + ' .layeropacity'))
          }
          source.set('pendingRequests', source.get('pendingRequests') + 1)
          console.log('Pending', source.get('pendingRequests'), 'res', res)
        }
      }).done(loadend).fail(function (response) {
        message('Some unexpected error occurred in addWfsLayer: (' + response.message + ').')
      })
    }
    // $.when(maybeAsync(1)).then(function (resp) {
    //     $('#target').append('<p>' + resp + '</p>');
    // });

    if ($form.find('.tiled').is(':checked')) {
      strategy = ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
    } else {
      strategy = ol.loadingstrategy.bbox
    }
    source = new ol.source.Vector({
      loader: loader,
      strategy: strategy,
      wrapX: false
    })
    source.set('pendingRequests', 0)
    layer = new ol.layer.Image({
      source: new ol.source.ImageVector({
        source: source
      }),
      name: $form.find('.displayname').val(),
      opacity: 0.7
    })
    layertree.addBufferIcon(layer)
    map.addLayer(layer)
    message('WFS layer added successfully.')
    console.log('WFS layer added successfully.')
    return this
  },
  addVectorLayer: function ($form) {

    let fr
    let source
    let layer
    let file = $form.find('.file')[0].files[0]
    let fileType = $form.find('.filetype').val()
    let displayname = $form.find('.displayname').val()
    let currentProj = map.getView().getProjection()
    let $progressbar
    let sourceFormat
    if (fileType === 'zip') {
      sourceFormat = new ol.format.GeoJSON()
    } else if (fileType === 'geojson') {
      sourceFormat = new ol.format.GeoJSON()
    } else if (fileType === 'topojson') {
      sourceFormat = new ol.format.TopoJSON()
    } else if (fileType === 'kml') {
      sourceFormat = new ol.format.KML()
    } else if (fileType === 'osm') {
      sourceFormat = new ol.format.OSMXML()
    } else {
      return false
    }

    function loadStart(evt) {
      $progressbar = $("<div class='buffering'>")
      $progressbar.append($('#' + layer.get('id') + ' .layertitle'))
      if (evt.lengthComputable) {
        $progressbar.progressbar({
          max: evt.total,
          value: 0
        })
      } else {
        $progressbar.progressbar({
          value: false
        })
      }
      $progressbar.insertBefore($('#' + layer.get('id') + ' .layeropacity'))
    }

    function updateProgress(evt) {
      if (evt.lengthComputable) {
        $progressbar.progressbar('value', evt.loaded)
      }
    }

    function loaded(evt) {
      $progressbar.progressbar('value', false)
      let vectorData = evt.target.result
      let dataProjection = $form.find('.projection').val() || sourceFormat.readProjection(vectorData) || currentProj
      // let dfd = makeAsyncCall()
      if (fileType === 'zip') {
        shp(vectorData).then(function (geojson) {
          if (typeof geojson === 'object' && geojson.length > 1) {
            geojson = geojson[0]
            displayname = geojson.fileName
            layer.set('name', displayname)
          }
          source.addFeatures(sourceFormat.readFeatures(geojson, {
            dataProjection: dataProjection,
            featureProjection: currentProj
          }))
        })
      } else {
        console.log('begin adding and reading')
        source.addFeatures(sourceFormat.readFeatures(vectorData, {
          dataProjection: dataProjection,
          featureProjection: currentProj
        }))
      }
      // // Convert MultiPolygon to Polygons if there is only one exterior ring.
      // // Convert MultiLineString to LineString if there is only one linestring.
      // let newgeom;
      // source.getFeatures().forEach(function (feature) {
      //     if (feature.getGeometry().getType() === 'MultiPolygon') {
      //         if (feature.getGeometry().getCoordinates().length === 1) {
      //             newgeom = new ol.geom.Polygon(feature.getGeometry().getCoordinates()[0]);
      //             feature.setGeometry(newgeom);
      //         }
      //     } else if (feature.getGeometry().getType() === 'MultiLineString') {
      //         if (feature.getGeometry().getCoordinates().length === 1) {
      //             newgeom = new ol.geom.LineString(feature.getGeometry().getCoordinates()[0]);
      //             feature.setGeometry(newgeom);
      //         }
      //     }
      // });
    }

    function loadEnd() {
      // $('#' + layer.get('id') + ' .layertitle').unwrap();
      // layer.buildHeaders();
      layer.set('name', displayname)
      console.log('addVectorLayer loadEnd')
      // _this.identifyLayer(layer);
      // _this.styleDefault(layer);
    }

    function errorHandler(evt) {
      if (evt.target.error.name === 'NotReadableError') {
        message('The file could not be read.')
      } else {
        message('Some unexpected error occurred in addVectorLayer1: (' + evt.message + ').')
      }
    }

    try {
      fr = new FileReader()
      fr.onloadstart = loadStart
      fr.onprogress = updateProgress
      fr.onload = loaded
      fr.onloadend = loadEnd
      fr.onerror = errorHandler

      if (fileType === 'zip') {
        fr.readAsArrayBuffer(file) // SHP ZIPPED
      } else {
        fr.readAsText(file)
      }
      source = new ol.source.Vector({
        strategy: ol.loadingstrategy.bbox,
        format: sourceFormat
      })
      source.set('pendingRequests', 1)
      layer = new ol.layer.Image({
        source: new ol.source.ImageVector({
          source: source
        }),
        name: displayname,
        opacity: 0.6
      })
      layertree.addBufferIcon(layer)
      map.addLayer(layer)
      message('Vector layer added successfully.')
      return this
    } catch (error) {
      message('Some unexpected error occurred in addVectorLayer: (' + error.message + ').')
      console.log(error.stack)
      return error
    }
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
      message('Unrecognized layer type.')
      return false
    }
    let source = new ol.source.Vector({
      wrapX: false
    })
    source.set('pendingRequests', 0)
    let layer = new ol.layer.Image({
      source: new ol.source.ImageVector({
        source: source,
        style: styleFunction
      }),
      name: $form.find('.displayname').val() || layerName + ' Layer',
      type: layerType,
      geomtype: geomType,
      opacity: 0.6
    })
    layertree.addBufferIcon(layer)
    map.addLayer(layer)
    layer.getSource().getSource().changed()
    message('New vector layer created successfully.')
    return this
  },
  saveVectorLayer: function ($form) {
    let data
    let file_format_map = {
      'zip': 'GeoJSON',
      'geojson': 'GeoJSON',
      'topojson': 'TopoJSON',
      'kml': 'KML',
      'osm': 'OSMXML'
    }
    let current_proj = map.getView().getProjection()
    let vector_layer = layertree.getLayerById(layertree.selectedLayer.id)
    let vector_data = vector_layer.getSource().getSource().getFeatures()
    let file_type = $form.find('.filetype').val()
    let data_type = file_format_map[file_type]
    let targetFormat = new ol.format[data_type]()
    let data_projection = $form.find('.projection').val() || targetFormat.readProjection(vector_data)

    if (data_type === 'GeoJSON' || data_type === 'KML') {
      // Use OpenLayers built-in formatter
      data = targetFormat.writeFeatures(vector_data, {
        dataProjection: data_projection,
        featureProjection: current_proj
      })
    } else {
      //TODO: apply data_type to OSMXML, TopoJSON, and shapefiles.
      // format is XML (GPX or KML)
      // let serializer = new XMLSerializer();
      // data = serializer.serializeToString(vector_data);
      message('Only GeoJSON and KML formats have been implemented.  Exit Save...')
      return
    }
    let element = document.createElement('a')
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + data)
    element.setAttribute('download', vector_layer.get('name') + '.' + file_type)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    message('Save Successful.')
  },

  // getDefaultSensors = function () {
  //     let _this = this;
  //     let $form = $button.form();
  //     $button.button("disable");
  //     $form.find(".layername").empty();
  //     $form.find(".format").empty();
  //     let serverUrl = $form.find(".url").val();
  //     serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
  //     $form.find(".url").val(serverUrl);
  //     serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
  //     let query = 'SERVICE=WMS&REQUEST=GetCapabilities';
  //     let url = settings.proxyUrl + serverUrl + query;
  //     console.log(url);

  // let defsens = null;
  // $.getJSON('data/default_sensors.json', function (data) {
  //     defsens = data;
  // });
  // return defsens;

  openDialog: function (elemName, elemTitle) {

    let $dialog
    let $fieldset = $('<fieldset>')

    if (elemName === 'add-wms') {
      $dialog = this.createAddWmsDialog($fieldset, elemName, elemTitle)
    } else if (elemName === 'add-wfs') {
      $dialog = this.createAddWfsDialog($fieldset, elemName, elemTitle)
    } else if (elemName === 'add-vector') {
      $dialog = this.createAddVectorDialog($fieldset, elemName, elemTitle)
    } else if (elemName === 'new-vector') {
      $dialog = this.createNewVectorDialog($fieldset, elemName, elemTitle)
    } else if (elemName === 'save-vector') {
      $dialog = this.createSaveVectorDialog($fieldset, elemName, elemTitle)
    } else {
      return false
    }

    $('.addlayer select').each(function () {
      $(this).selectmenu().selectmenu('menuWidget').addClass('overflow')
    })
    $dialog.dialog('open')
  },

  createAddWmsDialog: function ($fieldset, elemName, elemTitle) {
    this.createDisplayNameNodes($fieldset)
    this.createServerUrlNodes($fieldset, 'wms')
    this.createLayerNameNodes($fieldset)
    this.createFormatNodes($fieldset)
    this.createTiledNodes($fieldset)
    let $dialog = this.createDialog($fieldset, elemName, elemTitle, this.addWmsLayer)
    $('.layername').selectmenu().on('selectmenuchange', function () {
      $(this).parent().find('.displayname').val($(this).val())
    })
    return $dialog
  },
  createAddWfsDialog: function ($fieldset, elemName, elemTitle) {
    this.createDisplayNameNodes($fieldset)
    this.createServerUrlNodes($fieldset, 'wfs')
    this.createLayerNameNodes($fieldset)
    this.createTiledNodes($fieldset)
    let $dialog = this.createDialog($fieldset, elemName, elemTitle, this.addWfsLayer)
    $('.layername').selectmenu().on('selectmenuchange', function () {
      $(this).parent().find('.displayname').val($(this).val())
    })
    return $dialog
  },
  createAddVectorDialog: function ($fieldset, elemName, elemTitle) {
    this.createDisplayNameNodes($fieldset)
    this.createFileTypeNodes($fieldset)
    this.createFileOpenNodes($fieldset)
    this.createProjectionNodes($fieldset)
    let $dialog = this.createDialog($fieldset, elemName, elemTitle, this.addVectorLayer)
    $('.filetype').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('selectmenuchange', function () {
      $(this).parent().find('.file').val('')
      $(this).parent().find('.file')[0].accept = '.' + $(this).val()
      $(this).parent().find('.displayname').val('')
    })
    return $dialog
  },
  createNewVectorDialog: function ($fieldset, elemName, elemTitle) {
    this.createDisplayNameNodes($fieldset)
    this.createLayerTypeNodes($fieldset)
    this.createGeomTypeNodes($fieldset)
    let $dialog = this.createDialog($fieldset, elemName, elemTitle, this.newVectorLayer)
    $('.layertype').selectmenu().on('selectmenuchange', function () {
      let $geomType = $(this).parent().find('.geomtype')
      if ($(this).val() === 'sensor') {
        $geomType.val('point')
        $geomType.selectmenu('refresh')
        $geomType.selectmenu('disable')
      } else if ($(this).val() === 'feature') {
        $geomType.selectmenu('enable')
      }
    })
    return $dialog
  },
  createSaveVectorDialog: function ($fieldset, elemName, elemTitle) {
    this.createFileTypeNodes($fieldset)
    this.createProjectionNodes($fieldset)
    let $dialog = this.createDialog($fieldset, elemName, elemTitle, this.saveVectorLayer)
    $('.filetype').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    })
    $('.projection').val('EPSG:4326')
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
  createServerUrlNodes: function ($fieldset, id) {
    let _this = this
    $fieldset.append($('<label for="open-url">Server URL</label>'))
    let $url = $('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/' + id + '">')
    $fieldset.append($url)
    let $check = $('<input type="button" name="check" value="Check for layers">')
    $fieldset.append($check)
    $url.on('change', function () {
      // for both addwms and addwfs.
      let $layername = $(this).parent().find('.layername')
      $layername.empty()
      $layername.selectmenu('refresh')
      $(this).parent().find('.displayname').val('')
      if (id === 'wms') {
        let $format = $(this).parent().find('.format')
        $format.empty()
        $format.selectmenu('refresh')
      }
    })
    $check.button().on('click', function () {
      if (id === 'wms') {
        _this.checkWmsLayer($(this))
      } else if (id === 'wfs') {
        _this.checkWfsLayer($(this))
      }
    })
  },
  createLayerNameNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-layername">Layer Name</label>'))
    $fieldset.append($('<select id="open-layername" name="layername" class="layername ui-selectmenu">'))
  },
  createFileTypeNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-filetype">File Type</label>'))
    let $selectNode = $('<select id="open-filetype" name="filetype" class="filetype ui-selectmenu">')
    $selectNode.append(utils.createMenuOption('geojson', 'GeoJSON'))
    $selectNode.append(utils.createMenuOption('topojson', 'TopoJSON'))
    $selectNode.append(utils.createMenuOption('zip', 'Shapefile (zipped)'))
    $selectNode.append(utils.createMenuOption('kml', 'KML'))
    $selectNode.append(utils.createMenuOption('osm', 'OSM'))
    $fieldset.append($selectNode)
  },
  createFileOpenNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-file">Vector file</label>'))
    let $file = $('<input type="file" id="open-file" name="file" class="file ui-widget-content ui-button" accept=".geojson" required>')
    $fieldset.append($file)
    $file.on('change', function () {
      let startPos = this.value.lastIndexOf('\\') + 1
      let stopPos = this.value.lastIndexOf('.')
      let name = this.value.slice(startPos, stopPos)
      $(this).parent().find('.displayname').val(name)
    })
  },
  createProjectionNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-projection">Projection</label>'))
    $fieldset.append($('<input type="text" id="open-projection" name="projection" class="projection">'))
  },
  createFormatNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-format">Format</label>'))
    $fieldset.append($('<select id="open-format" name="format" class="format ui-selectmenu">'))
  },
  createTiledNodes: function ($fieldset) {
    $fieldset.append($('<label for="open-tiled">Tiled</label>'))
    let $tiled = $('<input type="checkbox" id="open-tiled" name="tiled" class="tiled">')
    $fieldset.append($tiled)
    $tiled.checkboxradio()
  },

  createDialog: function ($fieldset, elemName, title, callback) {

    let $dialog = $('<div id="dialog-widget">')
    let $form = $('<form class="addlayer">')
    $fieldset.append($('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>'))
    $form.append($fieldset)
    $dialog.append($form)
    $('body').append($dialog)

    $dialog.dialog({
      title: title,
      autoOpen: false,
      modal: true,
      buttons: {
        'OK': function () {
          callback($(this).children())
          $(this).dialog('close')
        },
        Cancel: function () {
          $(this).dialog('close')
        }
      },
      close: function () {
        $(this).find('form')[0].reset()
        $(this).dialog('destroy')
        $(this).remove()
      }
    })

    // $form.on("submit", function (event) {
    //     event.preventDefault();
    //     callback($(this));
    //     $(this).parent().dialog("close");
    // });
    // $dialog.find("form").on("submit", function (event) {
    //     event.preventDefault();
    //     callback($(this));
    //     $(this).parent().dialog("close");
    // });
    return $dialog
  }
}

// function makeSomeAsyc() {
//     return new Promise(function (resolve, reject) {
//         //Add ajax code here.
//         // on success, call resolve method, to resolve
//         // on error, call reject method, to reject
//     });
// }
// function handleSuccess() {
// }
// function handleError() {
// }
//
// let pobj = makeSomeAsyc();
// //Attaching success handler to promise
// pobj.then(handleSuccess, handleError);
//
//
// function makeAjaxCall(url, methodType) {
//     return new Promise(function (resolve, reject) {
//         let xhr = new XMLHttpRequest();
//         xhr.open(methodType, url, true);
//         xhr.send();
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState === 4) {
//                 if (xhr.status === 200) {
//                     console.log("xhr done successfully");
//                     let resp = xhr.responseText;
//                     let respJson = JSON.parse(resp);
//                     resolve(respJson);
//                 } else {
//                     reject(xhr.status);
//                     console.log("xhr failed");
//                 }
//             } else {
//                 console.log("xhr processing going on");
//             }
//         };
//         console.log("request sent succesfully");
//     });
// }
//
// function processUserDetailsResponse(userData) {
//     console.log("render user details", userData);
// }
// function processRepoListResponse(repoList) {
//     console.log("render repo list", repoList);
// }
// function errorHandler(statusCode) {
//     console.log("failed with status", statusCode);
// }
// document.getElementById("userDetails").addEventListener("click", function () {
//     let userId = document.getElementById("userId").value;
//     let URL = "https://api.github.com/users/" + userId;
//     makeAjaxCall(URL, "GET").then(processUserDetailsResponse, errorHandler);
// });
// document.getElementById("repoList").addEventListener("click", function () {
//     let userId = document.getElementById("userId").value;
//     let URL = "https://api.github.com/users/" + userId + "/repos";
//     makeAjaxCall(URL, "GET").then(processRepoListResponse, errorHandler);
// });
//
// function makeAjaxCall(url, methodType) {
//     return $.ajax({
//         url: url,
//         method: methodType,
//         dataType: "json"
//     })
// }
// // git hub url to get btford details
// let URL = "https://api.github.com/users/btford";
// makeAjaxCall(URL, "GET").then(function (respJson) {
//     document.getElementById("userid").innerHTML = respJson.login;
//     document.getElementById("name").innerHTML = respJson.name;
//     document.getElementById("company").innerHTML = respJson.company;
//     document.getElementById("blog").innerHTML = respJson.blog;
//     document.getElementById("location").innerHTML = respJson.location;
// }, function (reason) {
//     console.log("error in processing your request", reason);
// });

// let dialog_create = $('#dialog_create').dialog();
// dialog_create.dialog(options, {
//     buttons: {
//         Add: function () {
//             function getAjaxDeffered() {
//                 let promises = [];
//                 layer.eachLayer(function (layer) {
//                     let def = new $.Deferred();
//                     latGPS = layer.getLatLng().lat;
//                     lngGPS = layer.getLatLng().lng;
//                     $('#latitudeEP').val(latGPS);
//                     $('#longitudeEP').val(lngGPS);
//                     data = $("#formulaireEP").serialize();
//
//                     $.ajax({
//                         url: 'assets/php/create/create_EP.php',
//                         type: $("#formulaireEP").attr('method'),
//                         data: data,
//                         success: function () {
//                             def.resolve();
//                             dialog_create_EP.dialog("close");
//                             $("#formulaireEP")[0].reset();
//                         }
//                     });
//                     promises.push(def)
//                 });
//                 return $.when.apply(undefined, promises).promise();
//             }
//             defer.resolve(getAjaxDeffered());
//
//             getAjaxDeffered().then(function (data) {
//                 $.ajax({
//                     url: owsrootUrlAssainissement + L.Util.getParamString(parametersEP),
//                     dataType: 'jsonp',
//                     jsonpCallback: 'callEP'
//                 }).done(EPvannes1);
//             });
//             return false;
//         },
//         Cancel: function () {
//             dialog_create_EP.dialog("close");
//         },
//     }
// });
// dialog_create_EP.dialog("open");
//
// function maybeAsync(num) {
//     let dfd = $.Deferred();
//     if (num === 1) {
//         setTimeout(function () {
//             dfd.resolve(num);
//         }, 100);
//         return dfd.promise();
//     }
//     return num;
// }
//
// // this will resolve async
// $.when(maybeAsync(1)).then(function (resp) {
//     $('#target').append('<p>' + resp + '</p>');
// });
//
// // this will return immediately
// $.when(maybeAsync(0)).then(function (resp) {
//     $('#target').append('<p>' + resp + '</p>');
// });
//
// $.when(maybeAsync(0), maybeAsync(1)).then(function (resp1, resp2) {
//     let target = $('#target');
//     target.append('<p>' + resp1 + '</p>');
//     target.append('<p>' + resp2 + '</p>');
// });
//
// $.when(maybeAsync(0), $.get('/data/people.json')).then(function (resp1, resp2) {
//     console.log("Both operations are done", resp1, resp2);
// });