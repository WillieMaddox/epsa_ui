/**
 * Created by maddoxw on 7/23/16.
 */

define(['jquery', 'MainCore',
    // 'ol',
    // 'map',
    // 'layertree',
    'wfs110context',
    'serversettings',
    'utils',
    'jquery-ui'
], function ($, OSMFire_Core,
             // ol,
             // map,
             // layertree,
             WFSContext,
             settings,
             utils) {

    'use strict';

    var callback = function(sandBox) {

        var wfsProjections = null;
        var $dialog,
            $form,
            $fieldset,
            config;

        return {
            init: function (cfg) {
                try {
                    config = cfg;
                    sandBox.contextObj = this;
                    sandBox.log(1, 'Add WFS Dialog Widget component has been initialized...', 'blue');
                } catch (e) {
                    sandBox.log(3, 'Add WFS Dialog Widget has NOT been initialized correctly --> ' + e.message);
                }
            },
            render: function() {
                $dialog = this.createAddWfsDialog();
                sandBox.setElement('body', $dialog);
                this.styleWidget($dialog);
                // this.registerForEvents();
                $dialog.dialog("open");
            },
            destroy: function(removeComponent) {
                sandBox.contextObj.unregisterFromEvents();
                if (removeComponent) {
                    sandBox.removeComponentFromDom("widgetContainer");
                }
                sandBox.log(1, 'Add WFS Dialog Widget has been destroyed...', "blue");
            },

            checkWfsLayer: function ($button) {

                var $form = $button.form();
                $button.button("disable");
                $form.find(".layername").empty();
                wfsProjections = {};
                var serverUrl = $form.find(".url").val();
                serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
                $form.find(".url").val(serverUrl);
                serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
                var query = 'SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities';
                var url = settings.proxyUrl + serverUrl + query;

                $.ajax({
                    type: 'GET',
                    url: url
                }).done(function (response) {
                    var unmarshaller = WFSContext.createUnmarshaller();
                    var capabilities = unmarshaller.unmarshalDocument(response).value;
                    var messageText = 'Layers read successfully.';
                    if (capabilities.version !== '1.1.0') {
                        messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').';
                    }
                    var layers = capabilities.featureTypeList.featureType;
                    var nLayers = layers.length;
                    if (nLayers > 0) {
                        var re = /}(.*)/;
                        for (var i = 0; i < nLayers; i += 1) {
                            var name = re.exec(layers[i].name)[1];
                            $form.find(".layername").append(utils.createMenuOption(name));
                            wfsProjections[name] = layers[i].defaultSRS;
                        }
                        sandBox.message(messageText);
                    }
                }).fail(function (error) {
                    sandBox.message('Some unexpected error occurred in checkWfsLayer: (' + error.message + ').');
                }).always(function () {
                    $form.find(".layername").selectmenu("refresh");
                    $button.button("enable");
                });
            },
            addWfsLayer: function ($form) {

                var buildQueryString = function (options) {
                    var queryArray = [];
                    queryArray.push('SERVICE=WFS');
                    queryArray.push('VERSION=1.1.0');
                    queryArray.push('REQUEST=GetFeature');
                    if (options.typeName) {
                        queryArray.push('TYPENAME=' + options.typeName);
                    }
                    if (options.proj) {
                        queryArray.push('SRSNAME=' + options.proj);
                    }
                    if (options.extent) {
                        queryArray.push('BBOX=' + options.extent.join(','));
                    }
                    return queryArray.join('&')
                };

                var loader = function (extent, res, mapProj) {
                    var query = buildQueryString({typeName: typeName, proj: proj, extent: extent});
                    $.ajax({
                        type: 'GET',
                        url: settings.proxyUrl + serverUrl + query,
                        beforeSend: function () {
                            if (source.get('pendingRequests') == 0) {
                                $progressbar = $("<div class='buffering'></div>");
                                $progressbar.append($('#' + layer.get('id') + ' .layertitle'));
                                $progressbar.progressbar({value: false});
                                $progressbar.insertBefore($('#' + layer.get('id') + ' .layeropacity'));
                            }
                            source.set('pendingRequests', source.get('pendingRequests') + 1);
                            console.log('Pending', source.get('pendingRequests'), 'res', res);
                        }
                    }).done(function (response) {
                        console.log('*******************************************');
                        var t0 = new Date().getTime();
                        var features = formatWFS.readFeatures(response, {
                            dataProjection: proj,
                            featureProjection: mapProj.getCode()
                        });
                        var t1 = new Date().getTime();
                        var nAdd = features.length;
                        console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAdd, 'n/t=', nAdd / (t1 - t0));
                        var nBefore = source.getFeatures().length;
                        var t0 = new Date().getTime();
                        source.addFeatures(features);
                        var t1 = new Date().getTime();
                        var nAfter = source.getFeatures().length;
                        console.log('Remaining', source.get('pendingRequests'), 't=', t1 - t0, 'ms n=', nAfter - nBefore, 'n/t=', (nAfter - nBefore) / (t1 - t0));
                    }).fail(function (response) {
                        sandBox.message('Some unexpected error occurred in addWfsLayer: (' + response.message + ').');
                    });
                };

                var $progressbar;
                var typeName = $form.find(".layername").val();
                var proj = wfsProjections[typeName];
                // var formatWFS = new ol.format.WFS();
                var formatWFS = sandBox.getFormat('wfs');
                var serverUrl = $form.find(".url").val();
                serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
                serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';

                var source;
                var source2;
                var layer;
                var strategy;

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

                if ($form.find(".tiled").is(":checked")) {
                    strategy = sandBox.getLoadingStrategy('tile')
                } else {
                    strategy = sandBox.getLoadingStrategy('bbox')
                }
                source = sandBox.getSource('Vector', {
                    loader: loader,
                    strategy: strategy,
                    wrapX: false,
                    pendingRequests: 0
                });
                // source.set('pendingRequests', 0);
                source2 = sandBox.getSource('ImageVector', {
                    source: source
                });
                layer = sandBox.getLayer('Image', {
                    source: source2,
                    name: $form.find(".displayname").val(),
                    opacity: 0.7
                });

                // layertree.addBufferIcon(layer);

                source.on('change', function (evt) {
                    let id = '#' + layer.get('id');
                    let hasFeatures;
                    if (evt.target.getState() === 'ready') {
                        if (source.get('pendingRequests') > 0) {
                            source.set('pendingRequests', source.get('pendingRequests') - 1);
                            // console.log('Remaining', source.get('pendingRequests'));
                            // Only unwrap layers with progressbar (i.e. addWfs and addVector)
                            if (source.get('pendingRequests') === 0) {
                                $(id + ' .layertitle').unwrap();
                            }
                        }
                        if (source.get('pendingRequests') === 0) {
                            layer.buildHeaders();
                        }
                        if (source.getFeatures().length === 0) {
                            hasFeatures = 'disable'
                        } else {
                            hasFeatures = 'enable'
                        }
                        $(id + '-hovercontrol').controlgroup(hasFeatures);
                        $(id + '-colorcontrol').controlgroup(hasFeatures);

                    } else {
                        $(id).addClass('error');
                    }
                });

                sandBox.publishCustomEvent({
                    type: 'addWfsLayer-Created',
                    data: layer
                });

                sandBox.addLayer(layer);
                // map.addLayer(layer);
                sandBox.message('WFS layer added successfully.');
                return this;
            },

            createAddWfsDialog: function () {
                $dialog = $('<div>', {id: config.moduleId});
                $form = $('<form>', {id: "addwfsform", class: "addlayer"});
                $fieldset = $('<fieldset>');
                this.createDisplayNameNodes($fieldset);
                this.createServerUrlNodes($fieldset, 'wfs');
                this.createLayerNameNodes($fieldset);
                this.createTiledNodes($fieldset);
                $fieldset.append($('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>'));
                $form.append($fieldset);
                $dialog.append($form);

                return $dialog
            },
            createDisplayNameNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-displayname">Display Name</label>'));
                $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'));
            },
            createServerUrlNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-url">Server URL</label>'));
                $fieldset.append($('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/wfs">'));
                $fieldset.append($('<input type="button" id="open-check" name="check" value="Check for layers">'));
            },
            createLayerNameNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-layername">Layer Name</label>'));
                $fieldset.append($('<select id="open-layername" name="layername" class="layername ui-selectmenu">'));
            },
            createTiledNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-tiled">Tiled</label>'));
                $fieldset.append($('<input type="checkbox" id="open-tiled" name="tiled" class="tiled">'));
            },
            styleWidget: function($dialog) {
                $dialog.dialog({
                    title: config.title,
                    autoOpen: false,
                    modal: true,
                    close: function () {
                        $(this).find("form")[0].reset();
                        $(this).dialog("destroy");
                        $(this).remove();
                    }
                });
                $dialog.dialog( "option", "buttons", {
                    "Add Layer": function () {
                        sandBox.contextObj.addWfsLayer($(this).children());
                        sandBox.publishCustomEvent({
                            type: 'addWfsLayer-Submitted',
                            data: $(this).children()
                        });
                        $(this).dialog("close")
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                });
                $dialog.find("form").on("submit", function (event) {
                    event.preventDefault();
                    sandBox.contextObj.addWfsLayer($(this));
                    sandBox.publishCustomEvent({
                        type: 'addWfsLayer-Submitted',
                        data: $(this)
                    });
                    $(this).parent().dialog("close");
                });
                $('#open-url').on("change", function () {
                    // for both addwms and addwfs.
                    var $layername = $(this).parent().find(".layername");
                    $layername.empty();
                    $layername.selectmenu("refresh");
                    $(this).parent().find(".displayname").val("");
                });
                $('#open-check').button().on("click", function () {
                    sandBox.contextObj.checkWfsLayer($(this));
                    sandBox.publishCustomEvent({
                        type: 'checkWfsLayer-Clicked',
                        data: $(this)
                    });
                });
                $('#open-tiled').checkboxradio();
                $('#open-layername').selectmenu().on('selectmenuchange', function () {
                    $(this).parent().find(".displayname").val($(this).val());
                });
                $(".addlayer select").each(function () {
                    $(this).selectmenu().selectmenu('menuWidget').addClass("overflow");
                });
            },
        }
    };
    OSMFire_Core.registerComponent("app-container", "addWfsWidget", callback)
});