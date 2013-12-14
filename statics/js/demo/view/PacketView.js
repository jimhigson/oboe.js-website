var PacketView = extend(ThingView, function (subject, demoView) {
    ThingView.apply(this,arguments);

    var className = [
        subject.name
        // since we only have categorical colours...
        ,   unitClass(subject)
    ].join(' ');

    function distance(xy1, xy2){
        function sq(n){
            return Math.pow(n, 2);
        }
        
        return Math.sqrt(sq(xy2.x - xy1.x) + sq(xy2.x - xy1.x));
    }

    subject.events('isOn').on(function( holder ){
        console.log(subject.name, 'on', holder.medium);

        this.initDomFromTemplate(
            'packets',
            this.templateName(subject, holder),
            className
        );

        if( holder.medium == 'mobile' ) {

            var locations = holder.locations,
                transmissionDistance = distance( locations.downstream, locations.downstream );

            
            
        } else {

            subject.events('move').on(function( xyFrom, xyTo, duration ){

                this.animateXy('translateX', 'translateY', xyFrom, xyTo, duration)

            }.bind(this));
        }
    }.bind(this));
    
    subject.events('done').on(function(){
        this.jDom && this.jDom.remove();
    }.bind(this));
});

PacketView.prototype.templateName = function(packet, holder){
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
