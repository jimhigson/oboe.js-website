
function oppositeDirectionTo(dir) {
    switch(dir){
        case 'upstream':
            return 'downstream';
        case 'downstream':
            return 'upstream';
    }
    throw new Error('unknown direction' + dir);
}