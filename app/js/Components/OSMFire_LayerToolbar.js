/**
 * Created by maddoxw on 7/23/16.
 */
define(['jquery', 'MainCore', 'jquery-ui'], function ($, OSMFire_Core) {

    'use strict';

    var callback = function(sandBox) {
        var ButtonWidgetObjID, ButtonWidgetObj,
            DialogWidget,
            _i,
            _len,
            componentConfigArray,
        // initComponent,
        // binder,
        // add_wms,
            // add_wfs,
            // new_vector,
            // add_vector,
            // delete_layer;
        // add_wms = document.getElementById('add-wms');
        // add_wfs = document.getElementById('add-wfs');
        // add_vector = document.getElementById('add-vector');
        // new_vector = document.getElementById('new-vector');
        // delete_layer = document.getElementById('delete-layer');
        // new_vector = $('#new-vector');
            states = {
                unloaded: "UNLOADED",
                loading: "LOADING",
                loaded: "LOADED"
            };
        componentConfigArray = [{
            buttonType: 'addlayer',
            buttonId: 'add-wms',
            moduleId: 'addWmsWidget',
            moduleDef: 'Widgets/AddWmsDialogWidget',
            containerId: 'add-wms-container',
            defId: "AddWmsDefID",
            title: 'Add WMS Layer'
        }, {
            buttonType: 'addlayer',
            buttonId: 'add-wfs',
            moduleId: 'addWfsWidget',
            moduleDef: 'Widgets/AddWfsDialogWidget',
            containerId: 'add-wfs-container',
            defId: "AddWfsDefID",
            title: 'Add WFS Layer'
        }, {
            buttonType: 'addlayer',
            buttonId: 'add-vector',
            moduleId: 'addVectorWidget',
            moduleDef: 'Widgets/AddVectorDialogWidget',
            containerId: 'add-vector-container',
            defId: "AddVectorDefID",
            title: 'Add Vector Layer'
        }, {
            buttonType: 'addlayer',
            buttonId: 'new-vector',
            moduleId: 'newVectorWidget',
            moduleDef: 'Widgets/NewVectorDialogWidget',
            containerId: 'new-vector-container',
            defId: "NewVectorDefID",
            title: 'New Vector Layer'
        }, {
            buttonType: 'deletelayer',
            buttonId: 'delete-layer',
            moduleId: 'deleteLayer',
            containerId: 'delete-layer-container',
            title: 'Remove Layer'
        }];

        return {
            // initialize as a component
            init: function() {
                // sandBox.registerForCustomEvents("Notification", {'support-Clicked': this.handleSupportClick});
                sandBox.contextObj = this;
                sandBox.applyElementCSSClass('layertoolbar-container', 'layertree-buttons');
                var $controlDiv = $('#layertoolbar-container');
                for (_i = 0, _len = componentConfigArray.length; _i < _len; _i++) {
                    $controlDiv.append(this.createButton(componentConfigArray[_i]));
                }
                for (_i = 0, _len = componentConfigArray.length; _i < _len; _i++) {
                    this.initComponent(componentConfigArray[_i]);
                }
                // binder();
                // this.registerForEvents();
                sandBox.log(1, 'LayerToolbar component has been initialized...', 'blue');
            },
            destroy: function() {
                sandBox.unregisterFromEvents();
                sandBox.log(1, 'LayerToolbar has been destroyed...', 'purple');
            },
            onDemandLoadingClickHandlerFactory: function(config) {
                var state = states.unloaded;
                return function(event) {
                    if (state === states.loaded) {
                        sandBox.contextObj.render(config.moduleId);
                    } else if (state === states.unloaded) {
                        state = states.loading;
                        require([config.moduleDef], function() {
                            sandBox.loadComponent(OSMFire_GlobalData.getButtonWidgetDefID(config.defId));
                            OSMFire_Core.getComponentByID(config.moduleId).init(config);
                            // DialogWidget.init();
                            state = states.loaded;
                            // DialogWidget.render();
                            sandBox.contextObj.render(config.moduleId);
                        });
                    }
                };
            },
            initComponent: function(config) {
                // config.button.addEventListener('click', onDemandLoadingClickHandlerFactory(config), false);
                // $('#'+config.buttonId).on('click', this.onDemandLoadingClickHandlerFactory(config));
                if (config.buttonType === 'addlayer') {
                    sandBox.addEventHandlerToElement(config.buttonId, 'click', this.onDemandLoadingClickHandlerFactory(config));
                } else if (config.buttonType === 'deletelayer') {
                    console.log('deletelayer')
                }
            },
            createButton: function (config) {
                // var _this = this;
                // var $button = $('<button id="' + elemName + '" class="' + elemName + '" title="' + elemTitle + '">').button();
                var $button = $('<button>', {id: config.buttonId, class: config.buttonId, title: config.title}).button();
                // switch (elemType) {
                //     case 'addlayer':
                //         $button.on("click", function () {
                //             // _this.openDialog(elemName, elemTitle);
                //         });
                //         return $button;
                //     case 'deletelayer':
                //         $button.on("click", function () {
                //             // layertree.removeLayer()
                //         });
                //         return $button;
                //     default:
                //         return false;
                // }
                return $button
            },
            // registerForEvents: function() {
            //     sandBox.addEventHandlerToElement("addwms-button", "click", this.handleAddWMSButtonClick);
            //     sandBox.addEventHandlerToElement("addwfs-button", "click", this.handleAddWFSButtonClick);
            //     sandBox.addEventHandlerToElement("addvector-button", "click", this.handleAddVectorButtonClick);
            //     sandBox.addEventHandlerToElement("new-vector", "click", this.handleNewVectorButtonClick);
            //     sandBox.addEventHandlerToElement("deletelayer-button", "click", this.handleDeleteLayerButtonClick);
            // },
            // unregisterFromEvents: function() {
            //     sandBox.removeEventHandlerFromElem("addwms-button", "click", this.handleAddWMSButtonClick);
            //     sandBox.removeEventHandlerFromElem("addwfs-button", "click", this.handleAddWFSButtonClick);
            //     sandBox.removeEventHandlerFromElem("addvector-button", "click", this.handleAddVectorButtonClick);
            //     sandBox.removeEventHandlerFromElem("newvector-button", "click", this.handleNewVectorButtonClick);
            //     sandBox.removeEventHandlerFromElem("deletelayer-button", "click", this.handleDeleteLayerButtonClick);
            // },
            // handleAddWMSButtonClick: function() {
            //     ButtonWidgetObjID = "addwms";
            //     sandBox.contextObj.loadAndRender();
            // },
            // handleAddWFSButtonClick: function() {
            //     ButtonWidgetObjID = "addwfs";
            //     sandBox.contextObj.loadAndRender();
            // },
            // handleAddVectorButtonClick: function() {
            //     ButtonWidgetObjID = "addvector";
            //     sandBox.contextObj.loadAndRender();
            // },
            // handleNewVectorButtonClick: function() {
            //     // require(['NewVectorDialogWidget']);
            //     ButtonWidgetObjID = "newvector";
            //     sandBox.contextObj.loadAndRender();
            // },
            // handleDeleteLayerButtonClick: function() {
            //     ButtonWidgetObjID = "deletelayer";
            //     sandBox.contextObj.loadAndRender();
            // },
            // loadAndRender: function() {
            //     ButtonWidgetObj = OSMFire_Core.getComponentByID("newVectorWidget");
            //     if (!ButtonWidgetObj) {
            //         // var temp = OSMFire_GlobalData.getButtonWidgetDefID("NewVectorDefID");
            //         sandBox.loadComponent(OSMFire_GlobalData.getNewVectorDefID(), this.render);
            //     } else {
            //         this.render();
            //     }
            // },
            render: function(moduleId) {
                OSMFire_Core.getComponentByID(moduleId).render();
            },
        }
    };
    OSMFire_Core.registerComponent("layertoolbar-container", "layertoolbar", callback)
});