import $ from 'jquery'
import ol from 'openlayers'
import layertree from 'layertree'
import layertoolbar from 'layertoolbar'
import featuretoolbar from 'featuretoolbar'
import layerinteractor from 'layerinteractor'

ol.layer.Image.prototype.buildHeaders = function () {
  let features = this.getSource().getSource().getFeatures()
  if (features.length === 0) {
    return this
  }
  let hasNew = false
  let oldHeaders = this.get('headers') || {}
  let headers = {}
  for (let feature of features) {
    let attributes = feature.getProperties()
    for (let j in attributes) {
      if (typeof attributes[j] !== 'object' && attributes[j].length > 0 && !(j in oldHeaders)) {
        headers[j] = typeof attributes[j]
        hasNew = true
      } else if (j in oldHeaders) {
        headers[j] = oldHeaders[j]
      }
    }
  }
  if (hasNew) {
    this.set('headers', headers)
    console.log('addBufferIcon headers built')
  }
  return this
}

ol.interaction.ChooseHole = function (opt_options) {

  this.emitter = new ol.Observable()

  ol.interaction.Pointer.call(this, {
    handleDownEvent: function (evt) {
      this.set('deleteCandidate', evt.map.forEachFeatureAtPixel(evt.pixel,
        (function (feature) {
          if (this.get('holes').getArray().indexOf(feature) !== -1) {
            return feature
          }
        }).bind(this)
      ))
      return !!this.get('deleteCandidate')
    },
    handleUpEvent: function (evt) {
      evt.map.forEachFeatureAtPixel(evt.pixel,
        (function (feature, layer) {
          if (feature === this.get('deleteCandidate')) {
            layer.getSource().removeFeature(feature)
            this.get('holes').remove(feature)
            this.set('hole', feature)
          }
        }).bind(this)
      )
      this.set('deleteCandidate', null)
      this.emitter.changed()
    }
  })
  this.setProperties({
    holes: opt_options.holes,
    deleteCandidate: null
  })
}
ol.inherits(ol.interaction.ChooseHole, ol.interaction.Pointer)

ol.control.Interaction = function (opt_options) {
  let options = opt_options || {}
  let controlDiv = document.createElement('div')
  controlDiv.className = options.className || 'ol-unselectable ol-control'
  let controlButton = document.createElement('button')
  controlButton.textContent = options.label || 'I'
  controlButton.title = 'Add ' + options.feature_type || 'Custom interaction'
  controlDiv.appendChild(controlButton)

  let _this = this
  controlButton.addEventListener('click', function () {
    if (_this.get('interaction').getActive()) {
      _this.set('active', false)
    } else {
      _this.set('active', true)
    }
  })
  ol.control.Control.call(this, {
    element: controlDiv,
    target: options.target
  })

  this.setDisabled = function (bool) {
    if (typeof bool === 'boolean') {
      controlButton.disabled = bool
      return this
    }
  }

  this.setProperties({
    interaction: options.interaction,
    active: false,
    button_type: 'radio',
    feature_type: options.feature_type,
    destroyFunction: function (evt) {
      if (evt.element === _this) {
        this.removeInteraction(_this.get('interaction'))
      }
    }
  })
  this.on('change:active', function () {
    this.get('interaction').setActive(this.get('active'))
    if (this.get('active')) {
      controlButton.classList.add('active')
      $(document).on('keyup', function (evt) {
        if (evt.keyCode === 189 || evt.keyCode === 109) {
          _this.get('interaction').removeLastPoint()
        } else if (evt.keyCode === 27) {
          _this.set('active', false)
        }
      })
    } else {
      $(document).off('keyup')
      controlButton.classList.remove('active')
    }
  }, this)
}
ol.inherits(ol.control.Interaction, ol.control.Control)
ol.control.Interaction.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map)
  let interaction = this.get('interaction')
  if (map === null) {
    ol.Observable.unByKey(this.get('eventId'))
  } else if (map.getInteractions().getArray().indexOf(interaction) === -1) {
    map.addInteraction(interaction)
    interaction.setActive(false)
    this.set('eventId', map.getControls().on('remove', this.get('destroyFunction'), map))
  }
}

layertree.init()
layertoolbar.init()
featuretoolbar.init()
layerinteractor.init()

/*********** WFS-T *************/
// let dirty = {}
// let formatGML = new ol.format.GML({
//   featureNS: 'http://argeomatica.com',
//   featureType: 'cite:nyc_buildings',
//   srsName: 'EPSG:3857'
// })
// let transactWFS = function (p, f) {
//   let node
//   switch (p) {
//     case 'insert':
//       node = formatWFS.writeTransaction([f], null, null, formatGML)
//       break
//     case 'update':
//       node = formatWFS.writeTransaction(null, [f], null, formatGML)
//       break
//     case 'delete':
//       node = formatWFS.writeTransaction(null, null, [f], formatGML)
//       break
//   }
//   let s = new XMLSerializer()
//   let str = s.serializeToString(node)
//   $.ajax('http://www.firefly.com/geoserver/wfs', {
//     type: 'POST',
//     dataType: 'xml',
//     processData: false,
//     contentType: 'text/xml',
//     data: str
//   }).done()
// }

/********* ADD PROJECT *********/
// let loadProject = document.getElementById('loadProject')
// loadProject.onclick = function (e) {
//   map.removeLayer(featureOverlay)
//   map.removeLayer(projectGroup)
//   let bounds = [-105.54833333333333, 39.76361111111111, -105.52694444444444, 39.778055555555554]
//   let image = new ol.layer.Image({
//     title: 'camera',
//     type: 'overlay',
//     source: new ol.source.ImageStatic({
//       url: 'test_project/package_patched2.png',
//       imageExtent: ol.proj.transformExtent(bounds, 'EPSG:4326', 'EPSG:3857')
//     }),
//     // Replace with an opacity slider-bar.
//     opacity: 0.2
//   });
//   let vector_aor = new ol.layer.Vector({
//     title: 'AOR',
//     type: 'overlay',
//     source: new ol.source.Vector({
//       url: 'test_project/aor.geojson',
//       format: new ol.format.GeoJSON()
//     }),
//     style: featureStyleFunction
//   });
//   let vector = new ol.layer.Vector({
//     title: 'tobjects',
//     type: 'overlay',
//     source: new ol.source.Vector({
//       url: 'test_project/tobjects_test.geojson',
//       format: new ol.format.GeoJSON()
//     }),
//     style: featureStyleFunction
//   });
//   let projectGroup = new ol.layer.Group({
//     title: 'Project',
//     layers: [
//       image,
//       vector_aor,
//       vector
//     ]
//   })
//   map.addLayer(projectGroup)
//   map.addLayer(featureOverlay)
//   // Need to add in auto-zoom-in functionality here.
//   vector_aor.getSource().on('change', function (evt) {
//     let source = evt.target
//     if (source.getState() === 'ready') {
//       view.setCenter(ol.extent.getCenter(source.getExtent()))
//     }
//   })
// }

// map.on('click', function (evt) {
//   let pixel = evt.pixel;
//   let coord = evt.coordinate;
//   let attributeForm = document.createElement('form');
//   attributeForm.className = 'popup';
//   this.getOverlays().clear();
//   let firstFeature = true;
//
//   function createRow(attributeName, attributeValue, type) {
//     let rowElem = document.createElement('div');
//     let attributeSpan = document.createElement('span');
//     attributeSpan.textContent = attributeName + ': ';
//     rowElem.appendChild(attributeSpan);
//     let attributeInput = document.createElement('input');
//     attributeInput.name = attributeName;
//     attributeInput.type = 'text';
//     if (type !== 'string') {
//       attributeInput.type = 'number';
//       attributeInput.step = (type === 'float') ? 1e-6 : 1;
//     }
//     attributeInput.value = attributeValue;
//     rowElem.appendChild(attributeInput);
//     return rowElem;
//   }
//   this.forEachFeatureAtPixel(pixel, function (feature, layer) {
//     if (firstFeature) {
//       let attributes = feature.getProperties();
//       let headers = layer.get('headers');
//       for (let i in attributes) {
//         if (typeof attributes[i] !== 'object' && i in headers) {
//           attributeForm.appendChild(createRow(i, attributes[i], headers[i]));
//         }
//       }
//       if (attributeForm.children.length > 0) {
//         let saveAttributes = document.createElement('input');
//         saveAttributes.type = 'submit';
//         saveAttributes.className = 'save';
//         saveAttributes.value = '';
//         attributeForm.addEventListener('submit', function (evt) {
//           evt.preventDefault();
//           let attributeList = {};
//           let inputList = [].slice.call(this.querySelectorAll('input[type=text], input[type=number]'));
//           for (let input of inputList) {
//             if (headers[input.name] === 'string') {
//               attributeList[input.name] = input.value.toString()
//             } else if (headers[input.name] === 'integer') {
//               attributeList[input.name] = parseInt(input.value)
//             } else if (headers[input.name] === 'float') {
//               attributeList[input.name] = parseFloat(input.value);
//             }
//           }
//           feature.setProperties(attributeList);
//           map.getOverlays().clear();
//         });
//         attributeForm.appendChild(saveAttributes);
//         this.addOverlay(new ol.Overlay({
//           element: attributeForm,
//           position: coord
//         }));
//         firstFeature = false;
//       }
//     }
//   }, map, function (layerCandidate) {
//     return this.selectedLayer !== null && layerCandidate.get('id') === this.selectedLayer.id;
//   }, tree);
// });


// TODO: Need to integrate the opacity sliders from this code into the layerswitcher code.
// See http://openlayers.org/en/v3.13.0/examples/layer-group.html?q=mapquest
// function bindInputs(layerid, layer) {
//   let visibilityInput = $(layerid + ' input.visible')
//   visibilityInput.on('change', function () {
//     layer.setVisible(this.checked)
//   })
//   visibilityInput.prop('checked', layer.getVisible())
//
//   let opacityInput = $(layerid + ' input.opacity')
//   opacityInput.on('input change', function () {
//     layer.setOpacity(parseFloat(this.value))
//   })
//   opacityInput.val(String(layer.getOpacity()))
// }
// map.getLayers().forEach(function (layer, i) {
//   bindInputs('#layer' + i, layer)
//   if (layer instanceof ol.layer.Group) {
//     layer.getLayers().forEach(function (sublayer, j) {
//       bindInputs('#layer' + i + j, sublayer)
//     })
//   }
// })

//register StorageHandler with MainCore
// OSMFire_Core.StorageHandler.register = (function() {
//   OSMFire_Core.registerModule(OSMFire_Core.StorageHandler)
// })()
//add error handling to all methods of StorageHandler, in case localStorage not available
// if (OSMFire_Core.Utilitizes) {
//   OSMFire_Core.Utilitizes.addLocalStorageCheck(OSMFire_Core.StorageHandler)
// }
// OSMFire_Core.StorageHandler.clearLocalStorage()
// OSMFire_Core.initializeAllModules()
// OSMFire_Core.initializeAllComponents()
// uncomment below if you'd like to run some unit test and then see results in the console
// remember that running tests deletes all the cookie and localstorage values for the this app
// OSMFire_Core.runAllUnitTests();
// OSMFire_Core.handlePageChange(location.pathname)


if (module.hot) {
  module.hot.accept()
}
