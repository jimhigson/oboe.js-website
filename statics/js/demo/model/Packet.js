var Packet = (function(){ 
   var Super = Thing;
   
   var Packet = extend(Super,
       /**
        * @param name
        * @param type
        * @param direction
        * @param ordering
        * @param mode Number -> ('live'|'historic')
        * @constructor
        */
       function Packet(name, type, direction, ordering, mode){
           Super.apply(this, arguments);
       
           this.direction = direction;
           this.ordering = ordering;
           this.type = type;
           this.mode = mode;
           this.gotAlreadyUpTo = 0;
          
           this.events('reset').on(this.done.bind(this));
       }
   );
   
   Packet.newEvent = 'Packet';
   
   Packet.prototype.copy = function() {
   
       var orderingCopy = {
           i: this.ordering.i,
           isFirst: this.ordering.isFirst,
           isLast: this.ordering.isLast,
           expectedSize: this.ordering.expectedSize
       };
   
       return new Packet(
           this.name,
           this.type,
           this.direction,
           orderingCopy,
           this.mode
       )   
           .inDemo(this.demo)
           .startingAt(this.gotAlreadyUpTo)
           .withPayload(this.payload);
   };
   Packet.prototype.replayedCopy = function() {
       var copy = this.copy();
       copy.mode = functor('historic');
       return copy;
   };
   Packet.prototype.startingAt = function( firstPacketNumber ) {
       this.gotAlreadyUpTo = firstPacketNumber;
       return this; // chaining
   };
   Packet.prototype.withPayload = function( payload ) {
       this.payload = payload;
       return this; // chaining
   };
   Packet.prototype.startsRequest = function() {
      return (this.direction == Direction.upstream) && this.ordering.isFirst;
   };
   Packet.prototype.closesResponse = function() {
      return (this.direction == Direction.downstream) && this.ordering.isLast;
   };
   Packet.prototype.move = function(fromXY, toXY, latency){
       this.events('move').emit(fromXY, toXY, latency);
   };
   Packet.prototype.isOn = function(holder){
       this.events('isOn').emit(holder);
   };

   return Packet;
})();
