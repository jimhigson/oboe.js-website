var WireView = extend(ThingView, function(subject, demoView){
    "use strict";
    
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

   
    if( subject.medium == 'mobile' ){
        this.flashOnMessageStartAndEnd();
    }
   
    this.initHiding();
});

WireView.prototype.flashOnMessageStartAndEnd = function(){
    
    var aerials = {
            upstream: this.jDom.find('.upstream'),
            downstream: this.jDom.find('.downstream')
        };

    function flashAerial( packet, resolveDirection ){
        var unit = unitClass(packet),
            name = packet.name;

        ThingView.flash( aerials[ resolveDirection(packet.direction) ], unit );
        ThingView.flash( aerials[ resolveDirection(packet.direction) ], name );
    }

    this.subject.events('deliveryStarted').on(function(packet){
        flashAerial(packet, oppositeDirectionTo);
    });
    this.subject.events('delivered').on(function(packet){
        flashAerial(packet, sameDirectionAs);
    });
};
