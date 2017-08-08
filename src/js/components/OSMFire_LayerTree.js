/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const $ = require('jquery')
const ol = require('ol')
const utils = require('utils')
const featureStyleFunction = require('fstylefunction')

require('jquery-ui')

let callback = function(sandBox) {
  let innerHTMLStr = '<div id="layertree" class="layertree"></div>'
  let idCounter = 0

  return {
    init: function () {

      try {
        sandBox.updateElement('layertree-container', innerHTMLStr)
        this.$layerContainer = $('#layertree-container')
        this.$layerContainer.sortable({
          axis: 'y',
          items: '> .layer',
          containment: 'parent',
          opacity: 0.5,
          start: function () {
            console.log('start')
          },
          change: function () {
            console.log('change')
          },
          beforeStop: function () {
            console.log('beforeStop')
          },
          stop: function (event, ui) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children('.layer').triggerHandler('focusout')

            let htmlArray = [].slice.call(_this.$layerContainer[0].children)
            let index = htmlArray.length - htmlArray.indexOf(ui.item[0]) - 1
            let sourceLayer = _this.getLayerById(ui.item[0].id)
            let layers = map.getLayers().getArray()
            let group_shift = layers.length - htmlArray.length
            layers.splice(layers.indexOf(sourceLayer), 1)
            layers.splice(group_shift + index, 0, sourceLayer)
            map.render()
            // map.getLayers().changed();
          }
        })

        this.layerEditors = {}
        this.selectedLayer = null
        this.selectEventEmitter = new ol.Observable()
        this.deselectEventEmitter = new ol.Observable()

        let map = sandBox.getMap()
        let _this = this

        map.getLayers().on('add', function (evt) {
          if (evt.element.get('type') !== 'overlay') {
            this.createRegistry(evt.element)
          }
        }, this)
        map.getLayers().on('remove', function (evt) {
          if (evt.element.get('type') !== 'overlay') {
            if (evt.element instanceof ol.layer.Image) {
              this.deselectEventEmitter.changed()
            }
            $('#' + evt.element.get('id')).remove()
          }
        }, this)
        sandBox.log(1, 'LayerTree component has been initialized...', 'blue')
      } catch (e) {
        sandBox.log(3, 'LayerTree component has NOT been initialized correctly --> ' + e.stack)
      }

    },
    destroy: function (removeComponent) {
      sandBox.contextObj.unregisterFromEvents()
      sandBox.unsubscribeFromAllCustomEvents()
      if (removeComponent) {
        sandBox.removeComponent('layertree-container')
      }
      sandBox.log(1, 'LayerTree component has been destroyed...', 'blue')
    },
    handler: function (event, data) {
      if (data) {
        event.data = data
      }
      if (event.data.selectevent) {
        let targetNode = event.target
        if (targetNode.classList.contains('layertitle')) {
          targetNode = targetNode.parentNode
        }
        if (targetNode.classList.contains('layerrow')) {
          targetNode = targetNode.parentNode
        }
        if (!(targetNode.classList.contains('layer'))) {
          return
        }
        if (this.selectedLayer === targetNode) {
          this.deselectEventEmitter.changed()
          this.selectedLayer.classList.remove('active')
          this.selectedLayer = null
        } else if (this.selectedLayer === null) {
          this.selectedLayer = targetNode
          this.selectedLayer.classList.add('active')
          this.selectEventEmitter.changed()
        } else if (this.selectedLayer !== targetNode) {
          this.deselectEventEmitter.changed()
          this.selectedLayer.classList.remove('active')
          this.selectedLayer = null
          this.selectedLayer = targetNode
          this.selectedLayer.classList.add('active')
          this.selectEventEmitter.changed()
        }
      }
      if (event.data.stopProp) {
        event.stopPropagation()
        event.stopPropagation()
      }
    },
    createRegistry: function (layer) {
      let mouseDownFired = false
      let lid = 'layer_' + idCounter
      layer.set('id', lid)
      idCounter += 1

      let $layerDiv = $("<div id='" + lid + "' class='layer ol-unselectable'>")

      let $layerRow1 = $("<div class='layerrow layerrow1'>")

      // let $layerVisibleLabel = $("<label for='"+lid+"-layervisible' class='visible layervisible'>");
      // let $layerVisible = $("<input type='checkbox' id='"+lid+"-layervisible' class='checkboxradio' checked>");
      // let $layerTitle = $("<div id='"+lid+"-layertitle' class='layertitle'>" + layer.get('name') + "</div>");
      // let $layerOpacity = $("<div id='"+lid+"-layeropacity' class='layeropacity'>");
      $layerRow1.append($("<label for='" + lid + "-layervisible' class='visible layervisible'>"))
      $layerRow1.append($("<input type='checkbox' id='" + lid + "-layervisible' class='checkboxradio' checked>"))
      $layerRow1.append($("<div id='" + lid + "-layertitle' class='layertitle'>" + layer.get('name') + '</div>'))
      $layerRow1.append($("<div id='" + lid + "-layeropacity' class='layeropacity'>"))

      $layerDiv.append($layerRow1)

      this.$layerContainer.prepend($layerDiv)

      if (layer instanceof ol.layer.Image) {

        let $layerRow2 = $("<div class='layerrow layerrow2'>")

        let $hoverControl = $("<div class='controlgroup hovercontrol'>")

        // let $hoverVisibleLabel = $("<label for='"+lid+"-hovervisible' class='visible hovervisible'>");
        // let $hoverVisible = $("<input type='checkbox' id='"+lid+"-hovervisible' class='checkboxradio' checked>");
        // let $hoverSelect = $("<select id='"+lid+"-hoverselect' class='hoverselect'>");
        $hoverControl.append($("<label for='" + lid + "-hovervisible' class='visible hovervisible'>"))
        $hoverControl.append($("<input type='checkbox' id='" + lid + "-hovervisible' class='checkboxradio' checked>"))
        $hoverControl.append($("<select id='" + lid + "-hoverselect' class='hoverselect'>"))

        $layerRow2.append($hoverControl)

        let $colorControl = $("<div class='controlgroup colorcontrol'>")

        // let $resetButton = $("<button id='"+lid+"-resetbutton' class='mybutton resetbutton'>Reset</button>");
        // let $colorButton = $("<button id='"+lid+"-colorbutton' class='mybutton colorbutton colorwheel-icon'></button>");
        // let $colorSelect = $("<select id='"+lid+"-colorselect' class='colorselect'>");
        $colorControl.append($("<button id='" + lid + "-resetbutton' class='mybutton resetbutton'>Reset</button>"))
        $colorControl.append($("<button id='" + lid + "-colorbutton' class='mybutton colorbutton colorwheel-icon'></button>"))
        $colorControl.append($("<select id='" + lid + "-colorselect' class='colorselect'>"))

        $layerRow2.append($colorControl)

        $layerDiv.append($layerRow2)
      }

      $layerDiv.on('click', null, function (event) {
        console.log($layerDiv[0].id + ' .layer click')
        if (mouseDownFired) {
          mouseDownFired = false
          event.stopPropagation()
          return
        }
        _this.handler(event, {
          selectevent: true,
          stopProp: true
        })
      }).on('click', '.layerrow', function (event) {
        console.log($layerDiv[0].id + ' .layerrow click')
        if (mouseDownFired) {
          mouseDownFired = false
          event.stopPropagation()
          return
        }
        this.handler(event, {
          selectevent: true,
          stopProp: true
        })
      })

      $('#' + lid + '-layervisible').checkboxradio().on('change', function () {
        layer.setVisible(this.checked)
      }).on('click', function (event) {
        this.handler(event, {
          stopProp: true
        })
      })
      $('#' + lid + '-layertitle').on('dblclick', function () {
        this.contentEditable = true
        this.style.textOverflow = 'initial'
        // $layerDiv[0].draggable = false;
        $layerDiv[0].classList.remove('ol-unselectable')
        this.focus()
      }).on('blur', function () {
        if (this.contentEditable) {
          this.contentEditable = false
          // $layerDiv[0].draggable = true;
          $layerDiv[0].classList.add('ol-unselectable')
          // $layerDiv[0].title = this.textContent;
          layer.set('name', this.textContent)
          this.style.textOverflow = 'ellipsis'
          this.scrollLeft = 0
        }
      }).on('click', function (event) {
        this.handler(event, {
          selectevent: true,
          stopProp: true
        })
      })
      $('#' + lid + '-layeropacity').slider({
        animate: true,
        range: 'min',
        min: 0,
        max: 1,
        step: 0.01,
        value: layer.getOpacity(),
        slide: function (event, ui) {
          layer.setOpacity(ui.value)
        }
      }).on('mousedown', function (event) {
        console.log($layerDiv[0].id + ' .opacity mousedown')
        mouseDownFired = true
        this.handler(event, {
          stopProp: true
        })
      }).on('mouseup', function (event) {
        console.log($layerDiv[0].id + ' .opacity mouseup')
        if (mouseDownFired) {
          mouseDownFired = false
          event.stopPropagation()
          return
        }
        this.handler(event, {
          stopProp: true
        })
      })

      if (layer instanceof ol.layer.Image) {

        $('#' + lid + '-hovercontrol').controlgroup()
        $('#' + lid + '-hovervisible').checkboxradio().on('click', function (event) {
          this.handler(event, {
            stopProp: true
          })
        })
        $('#' + lid + '-hoverselect').selectmenu()
        $('#' + lid + '-colorcontrol').controlgroup()
        $('#' + lid + '-resetbutton').button().on('click', function (event) {
          layer.getSource().setStyle(featureStyleFunction)
          layer.set('textstyle', 'name')
          layer.set('geomstyle', 'type')
          this.handler(event, {
            stopProp: true
          })
        })
        $('#' + lid + '-colorbutton').button().on('click', function (event) {
          let attribute = $('#' + lid + '-colorselect').val()
          if (layer.get('headers')[attribute] === 'string') {
            _this.styleCategorized(layer, attribute)
          } else if (layer.get('headers')[attribute] === 'number') {
            _this.styleGraduated(layer, attribute)
          } else {
            sandBox.message('A string or numeric column is required for attribute coloring.')
          }
          _this.handler(event, {
            stopProp: true
          })
        })
        $('#' + lid + '-colorselect').selectmenu()

        layer.on('propertychange', function (evt) {
          if (evt.key === 'headers') {
            let refresh = false
            let opt, header
            let headers = evt.target.get('headers')
            let previous = evt.oldValue

            for (header in headers) {
              if (!previous || !previous[header]) {
                refresh = true
              } else {
                console.log('Warning: This should have been caught in buildHeaders function.')
              }
            }
            if (refresh) {
              layer.getSource().setStyle(featureStyleFunction)
              let id = '#' + evt.target.get('id')
              let $hoverSelect = $(id + '-hoverselect')
              let $colorSelect = $(id + '-colorselect')
              let $hoverAttribute = $hoverSelect.val()
              let $colorAttribute = $colorSelect.val()
              $hoverSelect.selectmenu('destroy').empty()
              $colorSelect.selectmenu('destroy').empty()

              for (header in headers) {
                $hoverSelect.append(utils.createMenuOption(header))
                $colorSelect.append(utils.createMenuOption(header))
              }

              if ($hoverSelect.children().length > 0) {
                let opt1 = null
                let opt2 = null
                $hoverSelect.children().each(function () {
                  if ($(this).text() === $hoverAttribute) {
                    opt1 = $(this).text()
                  }
                  if ($(this).text() === 'name') {
                    opt2 = $(this).text()
                  }
                })
                opt = opt1 || opt2 || $hoverSelect.children()[0].value
                $hoverSelect.val(opt)
              }
              layer.set('textstyle', opt)

              if ($colorSelect.children().length > 0) {
                let opt1 = null
                let opt2 = null
                $colorSelect.children().each(function () {
                  if ($(this).text() === $colorAttribute) {
                    opt1 = $colorAttribute
                  }
                  if ($(this).text() === 'type') {
                    opt2 = 'type'
                  }
                })
                opt = opt1 || opt2 || $colorSelect.children()[0].value
                $colorSelect.val(opt)
              }
              layer.set('geomstyle', opt)

              $hoverSelect.selectmenu({
                classes: {
                  'ui-selectmenu-button': 'menuselect'
                },
                change: function () {
                  layer.set('textstyle', this.value)
                }
              }).selectmenu('menuWidget').addClass('overflow')
              $colorSelect.selectmenu({
                classes: {
                  'ui-selectmenu-button': 'menuselect'
                },
                change: function () {
                  layer.set('geomstyle', this.value)
                  if (layer.get('headers')[this.value] === 'string') {
                    _this.styleCategorized(layer, this.value)
                  } else if (layer.get('headers')[this.value] === 'number') {
                    _this.styleGraduated(layer, this.value)
                  } else {
                    sandBox.message('A string or numeric column is required for attribute coloring.')
                  }
                }
              }).selectmenu('menuWidget').addClass('overflow')
              $(id + '-hovercontrol').controlgroup('refresh')
              $(id + '-colorcontrol').controlgroup('refresh')
              // $('.controlgroup').controlgroup('refresh')
            }
          }
        })
      }

      // $('.mybutton').button();
      // $('.checkboxradio').checkboxradio();
      // $('.controlgroup').controlgroup();

      return this
    },
    addBufferIcon: function (layer) {
      layer.getSource().getSource().on('change', function (evt) {
        let hasFeatures
        let id = '#' + layer.get('id')
        if (evt.target.getState() === 'ready') {
          if (layer.getSource().getSource().get('pendingRequests') > 0) {
            layer.getSource().getSource().set('pendingRequests', layer.getSource().getSource().get('pendingRequests') - 1)
            // console.log('Remaining', layer.getSource().getSource().get('pendingRequests'));
            // Only unwrap layers with progressbar (i.e. addWfs and addVector)
            if (layer.getSource().getSource().get('pendingRequests') === 0) {
              $(id + ' .layertitle').unwrap()
            }
          }
          if (layer.getSource().getSource().get('pendingRequests') === 0) {
            layer.buildHeaders()
          }
          if (layer.getSource().getSource().getFeatures().length === 0) {
            hasFeatures = [false, 'disable']
          } else {
            hasFeatures = [true, 'enable']
          }
          $(id + '-hovercontrol').controlgroup(hasFeatures[1])
          $(id + '-colorcontrol').controlgroup(hasFeatures[1])

        } else {
          $(id).addClass('error')
        }
      })
    },
    removeLayer: function () {
      if (this.selectedLayer) {
        let layer = this.getLayerById(this.selectedLayer.id)
        map.removeLayer(layer)
        this.selectedLayer.classList.remove('active')
        this.selectedLayer = null
        sandBox.message('Layer removed successfully.')
      } else {
        sandBox.message('No selected layer to remove.')
      }
    },

    getLayerById: function (id) {
      let layers = map.getLayers().getArray()
      let len = layers.length
      for (let i = 0; i < len; i += 1) {
        if (layers[i].get('id') === id) {
          return layers[i]
        }
      }
      return false
    },

    styleGraduated: function (layer, attribute) {
      let attributeArray = []
      layer.getSource().getSource().forEachFeature(function (feat) {
        attributeArray.push(feat.get(attribute) || 0)
      })
      let max = Math.max.apply(null, attributeArray)
      let min = Math.min.apply(null, attributeArray)
      let step = (max - min) / 5
      let colors = this.graduatedColorFactory(5, [254, 240, 217], [179, 0, 0])
      layer.getSource().setStyle(function (feature, res) {
        let property = feature.get(attribute) || 0
        // let opacity = feature.get('type') === 'aor' ? 0.0 : 0.9;
        let color = property < min + step ? colors[0] :
          property < min + step * 2 ? colors[1] :
            property < min + step * 3 ? colors[2] :
              property < min + step * 4 ? colors[3] : colors[4]
        let style
        if (feature.getGeometry().getType().endsWith('Point')) {
          if (feature.get('type') === 'camera' || feature.get('type') === 'radio') {
            style = [
              new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                  anchor: [0.5, 0.5],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  color: color,
                  opacity: 1,
                  scale: 0.05,
                  snapToPixel: false,
                  src: './img/camera-normal.png'
                }))
              })
            ]
          } else {
            style = [
              new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 5,
                  stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1],
                    width: 2
                  }),
                  fill: new ol.style.Fill({
                    color: color.concat(0.5)
                  })
                })
              })
            ]
          }
        } else if (feature.getGeometry().getType().endsWith('LineString') || feature.get('type') === 'aor') {
          style = [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1],
                width: 4
              })
            }),
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: color.concat(1),
                width: 2
              })
            })
          ]
        } else {
          style = [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1],
                width: 1
              }),
              fill: new ol.style.Fill({
                color: color.concat(1)
              })
            })
          ]
        }
        return style
      })
    },
    graduatedColorFactory: function (intervals, rgb1, rgb2) {
      let colors = []
      let step = intervals - 1
      let redStep = (rgb2[0] - rgb1[0]) / step
      let greenStep = (rgb2[1] - rgb1[1]) / step
      let blueStep = (rgb2[2] - rgb1[2]) / step
      for (let i = 0; i < step; i += 1) {
        let red = Math.ceil(rgb1[0] + redStep * i)
        let green = Math.ceil(rgb1[1] + greenStep * i)
        let blue = Math.ceil(rgb1[2] + blueStep * i)
        colors.push([red, green, blue])
      }
      colors.push([rgb2[0], rgb2[1], rgb2[2]])
      return colors
    },
    styleCategorized: function (layer, attribute) {
      let attributeArray = []
      let colorArray = []
      let randomColor

      function convertHex(hex, opacity) {
        hex = hex.replace('#', '')
        let r = parseInt(hex.substring(0, 2), 16)
        let g = parseInt(hex.substring(2, 4), 16)
        let b = parseInt(hex.substring(4, 6), 16)
        if (opacity) {
          return [r, g, b, opacity]
        } else {
          return [r, g, b]
        }
      }

      layer.getSource().getSource().forEachFeature(function (feature) {
        let property = feature.get(attribute) ? feature.get(attribute).toString() : ''
        if (attributeArray.indexOf(property) === -1) {
          attributeArray.push(property)
          do {
            randomColor = this.randomHexColor()
          } while (colorArray.indexOf(randomColor) !== -1)
          colorArray.push(randomColor)
        }
      }, this)
      layer.getSource().setStyle(function (feature, res) {
        let index = feature.get(attribute) ? attributeArray.indexOf(feature.get(attribute).toString()) : attributeArray.indexOf('')
        let style
        if (feature.getGeometry().getType().endsWith('Point')) {
          if (feature.get('type') === 'camera' || feature.get('type') === 'radio') {
            style = [
              new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                  anchor: [0.5, 0.5],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  color: convertHex(colorArray[index]),
                  opacity: 0.8,
                  scale: 0.05,
                  snapToPixel: false,
                  src: './img/camera-normal.png'
                }))
              })
            ]
          } else {
            style = [
              new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 5,
                  stroke: new ol.style.Stroke({
                    color: convertHex(colorArray[index], 1),
                    width: 2
                  }),
                  fill: new ol.style.Fill({
                    color: convertHex(colorArray[index], 0.5)
                  })
                })
              })
            ]
          }
        } else if (feature.getGeometry().getType().endsWith('LineString') || feature.get('type') === 'aor') {
          style = [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1],
                width: 4
              })
            }),
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: convertHex(colorArray[index], 1),
                width: 2
              })
            })
          ]
        } else {
          style = [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1],
                width: 1
              }),
              fill: new ol.style.Fill({
                color: convertHex(colorArray[index], 1)
              })
            })
          ]
        }
        return style
      })
    },
    randomHexColor: function () {
      const num = Math.floor(Math.random() * 16777215).toString(16)
      return '#' + String.prototype.repeat.call('0', 6 - num.length) + num
    },
    subscribeToCustomEvents: function () {
      sandBox.subscribeToCustomEvents({
        'selectedLayer-Changed': this.handleSelectedLayerChanged
      })
    },
    handleSelectedLayerChanged: function (selectedLayer) {
      sandBox.setSelectedLayer(selectedLayer)
    },

  }
}

OSMFire_Core.registerComponent('layertree-container', 'layertree', callback)