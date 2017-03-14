/**
 * Created by maddoxw on 11/1/16.
 */

define(["jquery"], function ($) {
   return function (callback) {
       $.getJSON({
           url: "data/default_sensors.json"
       }).done(function (data) {
           if(callback) callback(data);
       });
   }
});