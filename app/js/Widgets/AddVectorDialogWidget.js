/**
 * Created by maddoxw on 7/23/16.
 */

define(['jquery', 'MainCore',
    // 'ol',
    // 'map',
    // 'layertree',
    // 'shp',
    'utils',
    'jquery-ui'
], function ($, OSMFire_Core,
             // ol,
             // map,
             // layertree,
             // shp,
             utils) {

    'use strict';

    var callback = function(sandBox) {

        var $dialog,
            $form,
            $fieldset,
            config;

        return {
            init: function (cfg) {
                try {
                    config = cfg;
                    sandBox.contextObj = this;
                    sandBox.log(1, 'Add Vector Dialog Widget component has been initialized...', 'blue');
                } catch (e) {
                    sandBox.log(3, 'Add Vector Dialog Widget has NOT been initialized correctly --> ' + e.message);
                }
            },
            render: function() {
                $dialog = this.createAddVectorDialog();
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
                sandBox.log(1, 'Add Vector Dialog Widget has been destroyed...', "blue");
            },

            addVectorLayer: function ($form) {

                var file = $form.find(".file")[0].files[0];
                var fileType = $form.find(".filetype").val();
                var currentProj = sandBox.getView().getProjection();
                var sourceFormat = sandBox.getFormat(fileType);
                var $progressbar;

                function loadStart(evt) {
                    $progressbar = $("<div class='buffering'>");
                    $progressbar.append($('#' + layer.get('id') + ' .layertitle'));
                    if (evt.lengthComputable) {
                        $progressbar.progressbar({
                            max: evt.total,
                            value: 0
                        });
                    } else {
                        $progressbar.progressbar({
                            value: false
                        });
                    }
                    $progressbar.insertBefore($('#' + layer.get('id') + ' .layeropacity'));
                }
                function updateProgress(evt) {
                    if (evt.lengthComputable) {
                        $progressbar.progressbar("value", evt.loaded);
                    }
                }
                function loaded(evt) {
                    $progressbar.progressbar("value", false);
                    var vectorData = evt.target.result;
                    var dataProjection = $form.find(".projection").val() || sourceFormat.readProjection(vectorData) || currentProj;
                    if (fileType === 'zip') {
                        shp(vectorData).then(function (geojson) {
                            source.addFeatures(sourceFormat.readFeatures(geojson, {
                                dataProjection: dataProjection,
                                featureProjection: currentProj
                            }));
                        });
                        // // Read in a .shp file directly.
                        // } else if (form.format.value === 'shp'){
                        //     shp(file).then(function (geojson) {
                        //         source.addFeatures(sourceFormat.readFeatures(geojson, {
                        //             dataProjection: dataProjection,
                        //             featureProjection: currentProj
                        //         }));
                        //     });
                    } else {
                        source.addFeatures(sourceFormat.readFeatures(vectorData, {
                            dataProjection: dataProjection,
                            featureProjection: currentProj
                        }));
                    }
                    // // Convert MultiPolygon to Polygons if there is only one exterior ring.
                    // // Convert MultiLineString to LineString if there is only one linestring.
                    // var newgeom;
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
                function loadEnd(evt) {
                    // $('#' + layer.get('id') + ' .layertitle').unwrap();
                    // layer.buildHeaders();
                    console.log('addVectorLayer loadEnd');
                    // _this.identifyLayer(layer);
                    // _this.styleDefault(layer);
                }
                function errorHandler(evt) {
                    if (evt.target.error.name == "NotReadableError") {
                        sandBox.message('The file could not be read.');
                    } else {
                        sandBox.message('Some unexpected error occurred in addVectorLayer1: (' + evt.message + ').');
                    }
                }

                try {
                    var fr = new FileReader();
                    fr.onloadstart = loadStart;
                    fr.onprogress = updateProgress;
                    fr.onload = loaded;
                    fr.onloadend = loadEnd;
                    fr.onerror = errorHandler;

                    if (fileType === 'zip') {
                        fr.readAsArrayBuffer(file); // SHP
                    } else {
                        fr.readAsText(file);
                    }

                    var source0;
                    var source;
                    var layer;
                    source0 = sandBox.getSource('Vector', {
                        strategy: ol.loadingstrategy.bbox,
                        format: sourceFormat
                    });
                    source0.set('pendingRequests', 1);
                    source = sandBox.getSource('ImageVector', {
                        source: source0
                    });
                    layer = sandBox.getLayer('Image', {
                        source: source,
                        name: $form.find(".displayname").val(),
                        opacity: 0.7
                    });

                    // var source = new ol.source.Vector({
                    //     strategy: ol.loadingstrategy.bbox,
                    //     format: sourceFormat
                    // });
                    // source.set('pendingRequests', 1);
                    // var layer = new ol.layer.Image({
                    //     source: new ol.source.ImageVector({
                    //         source: source
                    //     }),
                    //     name: $form.find(".displayname").val(),
                    //     opacity: 0.7
                    // });

                    layertree.addBufferIcon(layer);
                    map.addLayer(layer);
                    sandBox.message('Vector layer added successfully.');
                    return this;
                } catch (error) {
                    sandBox.message('Some unexpected error occurred in addVectorLayer: (' + error.message + ').');
                    console.log(error.stack);
                    return error;
                }
            },

            createAddVectorDialog: function () {
                $dialog = $('<div>', {id: config.moduleId});
                $form = $('<form>', {id: "addvectorform", class: "addlayer"});
                $fieldset = $('<fieldset>');
                this.createDisplayNameNodes($fieldset);
                this.createFileTypeNodes($fieldset);
                this.createFileOpenNodes($fieldset);
                this.createProjectionNodes($fieldset);
                $fieldset.append($('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>'));
                $form.append($fieldset);
                $dialog.append($form);
                return $dialog
            },
            createDisplayNameNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-displayname">Display Name</label>'));
                $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'));
            },
            createFileTypeNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-filetype">File Type</label>'));
                var $selectNode = $('<select id="open-filetype" name="filetype" class="filetype ui-selectmenu">');
                $selectNode.append(utils.createMenuOption("geojson", "GeoJSON"));
                $selectNode.append(utils.createMenuOption("topojson", "TopoJSON"));
                $selectNode.append(utils.createMenuOption("zip", "Shapefile (zipped)"));
                $selectNode.append(utils.createMenuOption("kml", "KML"));
                $selectNode.append(utils.createMenuOption("osm", "OSM"));
                $fieldset.append($selectNode);
            },
            createFileOpenNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-file">Vector file</label>'));
                $fieldset.append($('<input type="file" id="open-file" name="file" class="file ui-widget-content ui-button" accept=".geojson" required>'));
            },
            createProjectionNodes: function ($fieldset) {
                $fieldset.append($('<label for="open-projection">Projection</label>'));
                $fieldset.append($('<input type="text" id="open-projection" name="projection" class="projection">'));
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
                        // sandBox.contextObj.addVectorLayer($(this).children());
                        sandBox.publishCustomEvent({
                            type: 'addVectorLayer-Submitted',
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
                    // sandBox.contextObj.addVectorLayer($(this));
                    sandBox.publishCustomEvent({
                        type: 'addVectorLayer-Submitted',
                        data: $(this)
                    });
                    $(this).parent().dialog("close");
                });
                $('#open-file').on("change", function () {
                    var startPos = this.value.lastIndexOf("\\") + 1;
                    var stopPos = this.value.lastIndexOf(".");
                    var name = this.value.slice(startPos, stopPos);
                    $(this).parent().find(".displayname").val(name);
                });
                $('.filetype').selectmenu({
                    classes: {
                        "ui-selectmenu-button": "menuselect"
                    }
                }).on('selectmenuchange', function () {
                    $(this).parent().find(".file").val("");
                    $(this).parent().find(".file")[0].accept = '.' + $(this).val();
                    $(this).parent().find(".displayname").val("");
                });
                $(".addlayer select").each(function () {
                    $(this).selectmenu().selectmenu('menuWidget').addClass("overflow");
                });
            }
        }
    };
    OSMFire_Core.registerComponent("app-container", "addVectorWidget", callback)
});