var WireView = extend(ThingView, function(subject, demoView){

    MOBILE_AERIAL_FLASH_DURATION = 200;    
    
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
        var self = this,
            aerials = {
                upstream: this.jDom.find('.upstream'),
                downstream: this.jDom.find('.downstream')
            };
        
        function flashAerial( packet, resolveDirection ){
            var unit = unitClass(packet),
                name = packet.name;
            
            self.flash( aerials[ resolveDirection(packet.direction) ], unit, MOBILE_AERIAL_FLASH_DURATION );
            self.flash( aerials[ resolveDirection(packet.direction) ], name, MOBILE_AERIAL_FLASH_DURATION );
        }
        
        subject.events('deliveryStarted').on(function(packet){
            flashAerial(packet, oppositeDirectionTo);
        });
        subject.events('delivered').on(function(packet){
            flashAerial(packet, sameDirectionAs);
        });        
    }
});
