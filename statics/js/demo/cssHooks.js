/* allow svg properties to be set like css by jQuery. Apply a simple
 * idea of SVG transforms that ignores order and other transforms */
$.cssHooks.translateX = {
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
$.cssHooks.translateY = {
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
$.cssHooks.lineX1 = getOrSetAttributeCssHook('x1');
$.cssHooks.lineY1 = getOrSetAttributeCssHook('y1');
$.cssHooks.lineX2 = getOrSetAttributeCssHook('x2');
$.cssHooks.lineY2 = getOrSetAttributeCssHook('y2');
$.cssHooks.circleX = getOrSetAttributeCssHook('cx');
$.cssHooks.circleY = getOrSetAttributeCssHook('cy');
$.cssHooks.circleRadius = getOrSetAttributeCssHook('r');

// Setting cssNumber.foo to true tells jquery not to put 'px' on the
// end of these properties when animating them:
$.cssNumber.translateX = 
$.cssNumber.translateY = 
$.cssNumber.x1 = 
$.cssNumber.y1 = 
$.cssNumber.x2 = 
$.cssNumber.y2 =
$.cssNumber.circleX =
$.cssNumber.circleY =    
$.cssNumber.circleRadius = 
        true;