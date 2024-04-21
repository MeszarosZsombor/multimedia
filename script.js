let sizeX = 800;
let sizeY = 800;
let N = 10;
let blockSize = sizeX / N;
let currentRotation = 0
let selected = null;

function rotate(element, degree) {
    currentRotation += degree;
    element.animate({  borderSpacing: currentRotation }, {
        step: function(now,fx) {
            $(this).css('transform','rotate('+now+'deg)');
        },
        duration: 50
    },'linear');
}


function animate(element) {
    element.addClass('selected').animate({opacity: 0.5}, 200, function() {
        element.animate({opacity: 1}, 400);
    });

    rotate(element, -10);

    setTimeout(function (){
        rotate(element, 20);
    }, 100);

    setTimeout(function (){
        rotate(element, -10);
    }, 150);
}

function isAdjacent(first, second) {
    let id = parseInt(first.find('img').attr('id'));
    let secId = parseInt(second.find('img').attr('id'));
    return id + 1 === secId || id - 1 === secId || id + 10 === secId || id - 10 === secId;
}

function moveBoth(first, second) {
    let firstPos = first.position();
    let secondPos = second.position();

    first.animate({
        top: secondPos.top,
        left: secondPos.left
    }, 500);

    setTimeout( function () {
        second.animate({
            top: firstPos.top,
            left: firstPos.left
        }, 500, function() {
            let firstClone = first.clone(true);
            let secondClone = second.clone(true);

            first.replaceWith(secondClone);
            second.replaceWith(firstClone);

            first = secondClone;
            second = firstClone;

            console.log(first.find('img').attr('id'));
            console.log(second.find('img').attr('id'));

            first.find('img').attr('id', secondClone.find('img').attr('id'));
            second.find('img').attr('id', firstClone.find('img').attr('id'));

            console.log(first.find('img').attr('id'))
            console.log(second.find('img').attr('id'))
        });
    }, 500);

    /*TODO Globalisan adja vissza*/
}

function onClick() {
    let element = $(this);
    if (selected === null) {
        selected = element;
        selected.addClass('selected');
        animate(element);
    } else if (selected === element){
        selected.removeClass('selected');
        selected = null;
    } else {
        if(isAdjacent(selected, element)) {
            moveBoth(selected, element);

            selected.removeClass('selected');
            selected = null;
        } else {
            selected.removeClass('selected');
            selected = element;
            selected.addClass('selected');
            animate(element);
        }
    }
}

function drawSquares() {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++) {
            let number = Math.floor(Math.random() * 10);

            let block = $('<div></div>').addClass('square').css({
                width: blockSize,
                height: blockSize,
                top: i * blockSize,
                left: j * blockSize,
                position: 'absolute',
                zIndex: 0
            });

            let img = $('<img />').attr({
                'src': number + '.png',
                'id': i * 10 + j
            }).css({
                width: '100%',
                height: '100%'
            });


            img.appendTo(block);
            block.click(onClick);

            block.appendTo(gameArea);
        }
    }
}

$(function(){
    gameArea = $('<div></div>').attr('id', 'gameArea').css({
        width: sizeX,
        height: sizeY,
        border: '1px solid black',
        top: '50%',
        left: '50%',
        marginLeft: '-350px',
        marginTop: '-400px',
        position: 'absolute'
    }).appendTo('body');

    drawSquares();
});