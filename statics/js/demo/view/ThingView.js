function ThingView(subject, demoView) {
    this.subject = subject;
    this.demoView = demoView;
}

ThingView.prototype.initDomFromTemplate = function(containerName, templateName, className) {
    this.jDom = stampFromTemplate($('#' + templateName), className);

    var jContainer = this.demoView.jDom.find('.' + containerName);

    if( jContainer.length != 1 ) {
        throw new Error('no one place to put the thing');
    }
    jContainer.append(this.jDom);
    return this.jDom;
};

ThingView.prototype.moveTo = function(where) {
    this.jDom.css({
        translateX: where.x
        ,   translateY: where.y
    });

    return this; // chaining
};