var PacketView = (function(){
    "use strict";

    var PacketView = extend(ThingView, function (subject, demoView) {
        
        ThingView.apply(this,arguments);
    
    
        subject.events('isOn').on(function( holder ){
    
            this.initDomFromTemplate(
                'packets',
                this.templateName(subject, holder),
                this.className(subject)
            );
    
            subject.events('move').on(this.movementAnimator(subject, holder).bind(this));
    
            subject.events('done').on(this.doneAction(subject, holder).bind(this));
        }.bind(this));
    
    });
    
    function distance(xy1, xy2){
        function sq(n){
            return Math.pow(n, 2);
        }
    
        return Math.sqrt(sq(xy2.x - xy1.x) + sq(xy2.y - xy1.y));
    }
    
    PacketView.prototype.className = function(subject){
        return [
            subject.name
            // since we only have categorical colours...
            ,   unitClass(subject)
        ].join(' ');
    };
    
    PacketView.prototype.movementAnimator = function(packet, holder){
        
        if( holder.medium == 'mobile' ) {
            
            return function( xyFrom, xyTo, duration ){
                var OVERHANG = 1.66,           
                    transmissionDistance = distance( xyFrom, xyTo),
                    jPacketInTransit = this.jDom;
                
                this.goToXy('translateX', 'translateY', xyFrom);
                
                jPacketInTransit.animate(
                    {   circleRadius: transmissionDistance * OVERHANG,
                        opacity: 0
                    },
                    {   duration:duration * OVERHANG,
                        queue:false,
                        complete:function(){
                            jPacketInTransit.remove();
                        }
                    }
                );
    
                // show indicator on start
                this.flashAerial(packet, xyFrom);
                
                // show indicator on complete
                window.setTimeout(this.flashAerial.bind(this, packet, xyTo), duration);
            };
        } else {
            
            return function( xyFrom, xyTo, duration ){
    
                this.animateXy('translateX', 'translateY', xyFrom, xyTo, duration)
            };
        }
    };
    
    PacketView.prototype.flashAerial = function(packet, location) {
    
        var FLASH_DURATION = 200,
            airwaveDoneTemplate = $('#airwaveDone'),
            jPacketAtDestination = stampFromTemplate(airwaveDoneTemplate, this.className(packet)),
            jPackets = this.find('.packets');
        
        jPackets.append(jPacketAtDestination);
    
        putAtXy(jPacketAtDestination, 'translateX', 'translateY', location);
    
        window.setTimeout(function(){
            jPacketAtDestination.remove();
        }, FLASH_DURATION);
    };
    
    PacketView.prototype.doneAction = function(packet, holder){
        if( holder.medium == 'mobile' ) {
            return function(){};
        } else {
            return function(){
                this.jDom.remove()
            }
        }
    };
    
    PacketView.prototype.templateName = function(packet, holder){
        if( holder.medium == 'mobile' ) {
            return 'airwavePacket';
        }
        
        switch(packet.type) {
            case 'GET':
                return 'getRequest';
            case 'JSON':
                return (   packet.ordering.isFirst
                    ?   'firstPacket'
                    :   (   packet.ordering.isLast
                        ?   'lastPacket'
                        :   'packet'
                        )
                    );
        }
    };
    
    return PacketView;
})();    
