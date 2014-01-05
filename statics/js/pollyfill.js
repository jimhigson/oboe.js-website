// ECMAScript6 Number.isFiniate

(function (global) {
   var global_isFinite = global.isFinite;

   Object.defineProperty(Number, 'isFinite', {
      value: function isFinite(value) {
         return typeof value === 'number' && global_isFinite(value);
      },
      configurable: true,
      enumerable: false,
      writable: true
   });
})(this);
