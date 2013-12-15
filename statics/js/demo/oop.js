function extend(Sup, Sub) {
    Sub.prototype = Object.create(Sup.prototype);
    Sub.prototype.constructor = Sub;
    return Sub;
}
function abstract(){
    throw new Error('don\'t call me, I\'m abstract');
}