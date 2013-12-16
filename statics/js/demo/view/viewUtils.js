
/* jQuery doesn't like adding classes to SVG elements */
function addClass(jEle, klass) {
    var ele = jEle[0];
    ele.setAttribute('class', ele.getAttribute('class') + ' ' + klass);
}
function removeClass(jEle, klass) {
    var ele = jEle[0];
    ele.setAttribute('class', 
            ele.getAttribute('class')
                .split(' ')
                .filter(function(c){return c != klass})
                .join(' ')
    );
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






