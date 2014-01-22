(function(){

/* allow svg properties to be set like css by jQuery. Apply a simple
 * idea of SVG transforms that ignores order and other transforms */
var cssHooks = $.cssHooks;
var cssNumber = $.cssNumber;
   
cssHooks.translateX = {
    get: function( elem, computed, extra ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            return 0;
        }
        return baseVal.getItem(0).matrix.e;
    },
    set: function( elem, value ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            elem.setAttribute('transform', 'translate(0,0)')
        }
        baseVal.getItem(0).matrix.e = value;
    }
};
cssHooks.translateY = {
    get: function( elem, computed, extra ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            return 0;
        }
        return baseVal.getItem(0).matrix.f;
    },
    set: function( elem, value ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            elem.setAttribute('transform', 'translate(0,0)')
        }
        baseVal.getItem(0).matrix.f = value;
    }
};
function getOrSetAttributeCssHook(attributeName) {
    return {
        get: function( elem, computed, extra ) {
            return elem.getAttribute(attributeName);
        },
        set: function( elem, value ) {
            elem.setAttribute(attributeName, value);
        }
    };
}
   
jQuery.extend(
   cssHooks,
   {  lineX1       : getOrSetAttributeCssHook('x1'),
      lineY1       : getOrSetAttributeCssHook('y1'),
      lineX2       : getOrSetAttributeCssHook('x2'),
      lineY2       : getOrSetAttributeCssHook('y2'),
      circleX      : getOrSetAttributeCssHook('cx'),
      circleY      : getOrSetAttributeCssHook('cy'),
      circleRadius : getOrSetAttributeCssHook('r')
   }
);

// Setting cssNumber.foo to true tells jquery not to put 'px' on the
// end of these properties when animating them:
cssNumber.translateX = 
cssNumber.translateY = 
cssNumber.lineX1 = 
cssNumber.lineY1 = 
cssNumber.lineX2 = 
cssNumber.lineY2 =
cssNumber.circleX =
cssNumber.circleY =    
cssNumber.circleRadius = 
        true;

}());
