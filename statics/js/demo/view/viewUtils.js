
/* jQuery doesn't like adding classes to SVG elements */
function addClass(jEle, klass) {
    var ele = jEle[0];
    ele.setAttribute('class', ele.getAttribute('class') + ' ' + klass);
}

function stampFromTemplate(jTemplate, klass) {
    if( !jTemplate.length )
        throw new Error('no template');
    
    var jCopy = jTemplate.children().clone();
    // jQuery doesn't like addClass on SVG...
    if( klass )
        addClass(jCopy, klass);
    
    return jCopy;
}


function unitClass(packet) {
    return 'unit-' + (packet.ordering.i % 10);
}

function goToXy( jDom, xProperty, yProperty, xy ) {
    var cssObject = {};
    
    cssObject[xProperty] = xy.x;
    cssObject[yProperty] = xy.y;

    jDom.css(cssObject);
}

function animateXy( jDom, xProperty, yProperty, xyFrom, xyTo, duration ) {

    goToXy(jDom, xProperty, yProperty, xyFrom);
    
    var toCssObject = {};
    toCssObject[xProperty]   = xyTo.x;
    toCssObject[yProperty]   = xyTo.y;

    jDom.animate(toCssObject, {duration:duration, queue:false});
}







