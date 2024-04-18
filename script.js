let sizeX = 800;
let sizeY = 800;

$(document).ready(function(){
    gameArea = $('<div></div>').attr('id', 'gameArea').css({
        width: sizeX,
        height: sizeY,
        border: '1px solid black',
        margin: '0 auto',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        alignContent: 'center'
    }).appendTo('body');

    label = $('<p></p>').css({
        width: '100%',
        height: '100%',
        color: 'white',
        'font-size': '50px',
        position: 'absolute',
        'text-align': 'center'
    }).appendTo(gameArea);

});