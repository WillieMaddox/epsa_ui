/**
 * Created by maddoxw on 7/23/16.
 */

define([], function () {
    var FID = (function () {
        /**
         * Feature Id Generator based on
         * Linear Congruential Generator
         *Variant of a Lehman Generator
         *m is chosen to be large (as it is the max period)
         *and for its relationships to a and c
         *Make sure...
         *1: a - 1 is divisible by all prime factors of m.
         *2: a - 1 is divisible by 4 if m is divisible by 4.
         *3: m and c are co-prime (i.e. No prime number divides both m and c).
         */
        var seed;
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // candidate char values
            chlength = chars.length, // number of candidate characters.
            idlength = 4, // number of chars to be put in the Id tag.
            idtag = "", // string to hold the id tag.
            t = 0, // dummy variable used in gen function.
            m = 14776336, // chars.length ** idlength --> 62**4
            a = 476657, // 62**3 + 1
            c = 1013904223, // offset. (prime number much larger than m.)
            z = seed = Math.round(Math.random() * m); // default random seed,
        return {
            setSeed: function (val) {
                z = seed = exists(val) ? val : Math.round(Math.random() * m);
            },
            getSeed: function () {
                return seed;
            },
            gen: function () {
                idtag = "";
                z = (a * z + c) % m;
                for (var i = 0; i < idlength; i++) {
                    t = Math.floor(z / Math.pow(chlength, i)) % chlength;
                    idtag += chars.charAt(t);
                }
                return idtag;
            }
        }
    })();

    return FID;

});