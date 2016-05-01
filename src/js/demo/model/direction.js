
var Direction = {
    upstream: 'upstream',
    downstream: 'downstream'
}

function oppositeDirectionTo(dir) {
    switch(dir){
        case 'upstream':
            return 'downstream';
        case 'downstream':
            return 'upstream';
    }
    throw new Error('unknown direction' + dir);
}
function sameDirectionAs(dir) {
    return dir;
}
