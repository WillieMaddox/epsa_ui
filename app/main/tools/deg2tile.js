/**
 * Created by maddoxw on 7/23/16.
 */

define([], function () {
    function toRad(x) {
        return x * Math.PI / 180.0
    }

    function toInt(x) {
        return ~~x
    }

    function mod(n, m) {
        return ((n % m) + m) % m
    }

    return function (lon_deg, lat_deg, zoom) {
        var lat_rad = toRad(lat_deg);
        var n = Math.pow(2, zoom);
        var xtile = toInt(mod((lon_deg + 180.0) / 360.0, 1) * n);
        var ytile = toInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
        return [xtile, ytile]
    };
});