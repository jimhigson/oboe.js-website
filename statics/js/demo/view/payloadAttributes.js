function payloadAttributes(jEle, payload){

   for( var k in payload ) {
      jEle.attr('data-' + k, payload[k]);
   }
}
