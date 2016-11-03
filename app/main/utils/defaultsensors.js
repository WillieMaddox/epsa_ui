/**
 * Created by maddoxw on 11/1/16.
 */
define(["jquery"], function ($) {
    var json = (function () {
        var json = null;
        $.getJSON({
            url: "data/default_sensors.json",
            // TODO: This needs to be asynchronous.
            async: false
        }).done(function (data) {
            json = data;
        });
        return json;
    })();
    return json;
});