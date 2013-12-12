var WireView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'wires', 'wire-' + subject.medium, subject.name);

    var positioners = {
            cable: function positionCable(jDom, upstreamLocation, downstreamLocation){
                jDom.css({
                    'lineX1': downstreamLocation.x,
                    'lineY1': downstreamLocation.y,
                    'lineX2': upstreamLocation.x,
                    'lineY2': upstreamLocation.y
                });
            },
            mobile: function positionMobile(jDom, upstreamLocation, downstreamLocation) {
                jDom.find('.upstream').css({
                    'translateX': upstreamLocation.x,
                    'translateY': upstreamLocation.y
                });
                jDom.find('.downstream').css({
                    'translateX': downstreamLocation.x,
                    'translateY': downstreamLocation.y
                });
            }
        },
        position = positioners[subject.medium];

    position( this.jDom, subject.locations.upstream, subject.locations.downstream);
});