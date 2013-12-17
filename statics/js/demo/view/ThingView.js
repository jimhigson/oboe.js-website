function ThingView(subject, demoView) {
    this.subject = subject;
    this.demoView = demoView;
    subject.hasView(this);
}

ThingView.prototype.find = function(selector) {
    return this.demoView.jDom.find(selector);
};

ThingView.prototype.stampContentsFromTemplate = function(containerName, templateName, className) {
    var jDom = stampFromTemplate($('#' + templateName), className);

    var jContainer = this.find('.' + containerName);

    if( jContainer.length != 1 ) {
        throw new Error('no one place to put the thing');
    }
    jContainer.append(jDom);
    return jDom;
}

ThingView.prototype.initDomFromTemplate = function(containerName, templateName, className) {
    this.jDom = this.stampContentsFromTemplate(containerName, templateName, className);
    return this.jDom;
};

ThingView.prototype.moveTo = function(where) {
    this.jDom.css({
        translateX: where.x
    ,   translateY: where.y
    });

    return this; // chaining
};

function putAtXy(jDom, xProperty, yProperty, xy){
    var cssObject = {};

    cssObject[xProperty] = xy.x;
    cssObject[yProperty] = xy.y;

    jDom.css(cssObject);
}

ThingView.prototype.goToXy = function( xProperty, yProperty, xy ) {
    putAtXy(this.jDom, xProperty, yProperty, xy);
};

ThingView.prototype.animateXy = function( xProperty, yProperty, xyFrom, xyTo, duration ) {

    this.goToXy(xProperty, yProperty, xyFrom);

    var toCssObject = {};
    toCssObject[xProperty]   = xyTo.x;
    toCssObject[yProperty]   = xyTo.y;

    this.jDom.animate(toCssObject, {duration:duration, queue:false});
};


