
require(['jquery', 'ol', 'mainapp'], function ($, ol, mainapp) {

    String.prototype.capitalizeFirstLetter = function (flip) {
        if (flip) {
            return this.charAt(0).toLowerCase() + this.slice(1);
        } else {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    };
    ol.layer.Image.prototype.buildHeaders = function () {
        var features = this.getSource().getSource().getFeatures();
        var len = features.length;
        if (len === 0) {
            return this;
        }
        var hasNew = false;
        var oldHeaders = this.get('headers') || {};
        var headers = {};
        for (var i = 0; i < len; i += 1) {
            var attributes = features[i].getProperties();
            for (var j in attributes) {
                if (typeof attributes[j] !== 'object' && !(j in oldHeaders)) {
                    headers[j] = typeof attributes[j];
                    hasNew = true;
                } else if (j in oldHeaders) {
                    headers[j] = oldHeaders[j];
                }
            }
        }
        if (hasNew) {
            this.set('headers', headers);
            console.log("addBufferIcon headers built");
        }
        return this;
    };
    ol.interaction.ChooseHole = function (opt_options) {

        this.emitter = new ol.Observable();

        ol.interaction.Pointer.call(this, {
            handleDownEvent: function (evt) {
                this.set('deleteCandidate', evt.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        if (this.get('holes').getArray().indexOf(feature) !== -1) {
                            return feature;
                        }
                    }, this
                ));
                return !!this.get('deleteCandidate');
            },
            handleUpEvent: function (evt) {
                evt.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        if (feature === this.get('deleteCandidate')) {
                            layer.getSource().removeFeature(feature);
                            this.get('holes').remove(feature);
                            this.set('hole', feature);
                        }
                    }, this
                );
                this.set('deleteCandidate', null);
                this.emitter.changed();
            }
        });
        this.setProperties({
            holes: opt_options.holes,
            deleteCandidate: null
        });
    };
    ol.inherits(ol.interaction.ChooseHole, ol.interaction.Pointer);
    ol.control.Interaction = function (opt_options) {
        var options = opt_options || {};
        var controlDiv = document.createElement('div');
        controlDiv.className = options.className || 'ol-unselectable ol-control';
        var controlButton = document.createElement('button');
        controlButton.textContent = options.label || 'I';
        controlButton.title = 'Add ' + options.feature_type || 'Custom interaction';
        controlDiv.appendChild(controlButton);

        var _this = this;
        controlButton.addEventListener('click', function () {
            if (_this.get('interaction').getActive()) {
                _this.set('active', false);
            } else {
                _this.set('active', true);
            }
        });
        ol.control.Control.call(this, {
            element: controlDiv,
            target: options.target
        });

        this.setDisabled = function (bool) {
            if (typeof bool === 'boolean') {
                controlButton.disabled = bool;
                return this;
            }
        };

        this.setProperties({
            interaction: options.interaction,
            active: false,
            button_type: 'radio',
            feature_type: options.feature_type,
            destroyFunction: function (evt) {
                if (evt.element === _this) {
                    this.removeInteraction(_this.get('interaction'));
                }
            }
        });
        this.on('change:active', function () {
            this.get('interaction').setActive(this.get('active'));
            if (this.get('active')) {
                controlButton.classList.add('active');
                $(document).on('keyup', function (evt) {
                    if (evt.keyCode === 189 || evt.keyCode === 109) {
                        _this.get('interaction').removeLastPoint();
                    } else if (evt.keyCode === 27) {
                        _this.set('active', false);
                    }
                });
            } else {
                $(document).off('keyup');
                controlButton.classList.remove('active');
            }
        }, this);
    };
    ol.inherits(ol.control.Interaction, ol.control.Control);
    ol.control.Interaction.prototype.setMap = function (map) {
        ol.control.Control.prototype.setMap.call(this, map);
        var interaction = this.get('interaction');
        if (map === null) {
            ol.Observable.unByKey(this.get('eventId'));
        } else if (map.getInteractions().getArray().indexOf(interaction) === -1) {
            map.addInteraction(interaction);
            interaction.setActive(false);
            this.set('eventId', map.getControls().on('remove', this.get('destroyFunction'), map));
        }
    };

    mainapp.init();
});
