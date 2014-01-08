
/* jQuery doesn't like adding classes to SVG elements */
function addClass(jEle, klass) {
    var ele = jEle[0],
        newClasses = ele.hasAttribute('class')
                   ? ele.getAttribute('class') + ' ' + klass 
                   : klass
                   ;
    ele.setAttribute('class', newClasses);
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
    var jCopy;
   
    if( !jTemplate.length )
        throw new Error('nothing in the template');
    
    if( jTemplate[0].content ) {

       jCopy = $( document.importNode(jTemplate[0].content, true) );
    } else {
   
       jCopy = jTemplate.children().clone();
    }
    // jQuery doesn't like addClass on SVG...
    if( klass )
        addClass(jCopy, klass);
    
    return jCopy;
}


function unitClass(packet) {
    return 'unit-' + (packet.ordering.i % 10);
}






