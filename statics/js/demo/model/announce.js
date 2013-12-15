
function announceAll(things){
    things.forEach(function( thing ){
        thing.announce();
    });
}