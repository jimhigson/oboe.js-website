var PacketView = extend(ThingView, function (subject, demoView) {
    "use strict";
    
    ThingView.apply(this,arguments);

    var className = [
        subject.name
        // since we only have categorical colours...
        ,   unitClass(subject)
    ].join(' ');

    subject.events('isOn').on(function( holder ){
        console.log(subject.name, 'on', holder.medium);

        this.initDomFromTemplate(
            'packets',
            this.templateName(subject, holder),
            className
        );

        subject.events('move').on(this.movementAnimator(subject, holder).bind(this));

    }.bind(this));
    
    subject.events('done').on(function(){
        this.jDom && this.jDom.remove();
    }.bind(this));
});

function distance(xy1, xy2){
    function sq(n){
        return Math.pow(n, 2);
    }

    return Math.sqrt(sq(xy2.x - xy1.x) + sq(xy2.y - xy1.y));
}

PacketView.prototype.movementAnimator = function(packet, holder){
    
    if( holder.medium == 'mobile' ) {
        
        return function( xyFrom, xyTo, duration ){
            var OVERHANG = 1.2,           
                transmissionDistance = distance( xyFrom, xyTo);
            
            this.goToXy('translateX', 'translateY', xyFrom);            
            this.jDom.animate(
                {   circleRadius: transmissionDistance * OVERHANG,
                    opacity: 0
                },
                {   duration:duration * OVERHANG,
                    queue:false}
            );
        };
    } else {
        
        return function( xyFrom, xyTo, duration ){

            this.animateXy('translateX', 'translateY', xyFrom, xyTo, duration)
        };
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
