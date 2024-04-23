let sizeX = 800;
let sizeY = 800;
let N = 10;
let blockSize = sizeX / N;
let currentRotation = 0
let selected = null;
let board = [];
let remove = [];
let gameArea;

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

function isAdjacent(selected, element) {
    let selectedPos = selected.position();
    let elementPos = element.position();

    return (Math.abs(selectedPos.top - elementPos.top) === blockSize && selectedPos.left === elementPos.left) ||
        (Math.abs(selectedPos.left - elementPos.left) === blockSize && selectedPos.top === elementPos.top);
}

function moveBoth(first, second) {
    return new Promise((resolve) => {
        let firstPos = first.position();
        let secondPos = second.position();
        first.removeClass('selected');

        let firstIndex = board.findIndex(item => item.id === first.attr('id'));
        let secondIndex = board.findIndex(item => item.id === second.attr('id'));

        let temp = board[firstIndex];
        board[firstIndex] = board[secondIndex];
        board[secondIndex] = temp;

        console.log("first animate");
        first.animate({
            top: secondPos.top,
            left: secondPos.left
        }, {
            duration: 500,
            complete: function () {
                console.log("first animate end");

                console.log("second animate");
                second.animate({
                    top: firstPos.top,
                    left: firstPos.left
                }, {
                    duration: 500,
                    complete: function () {
                        console.log("in second animate");
                        first.off('click');
                        second.off('click');

                        let firstClone = first.clone(true);
                        let secondClone = second.clone(true);

                        first.replaceWith(secondClone);
                        second.replaceWith(firstClone);

                        firstClone.click(onClick);
                        secondClone.click(onClick);

                        resolve();
                    }
                });
                console.log("second animate end");
            }
        });
    });
}

function checkMatch(){
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if(j < N - 2 && board[i][j].cat === board[i][j + 1].cat && board[i][j].cat === board[i][j + 2].cat){
                console.log("remove: " + board[i][j].id)
                remove[i][j] = board[i][j];
                console.log("remove: " + board[i][j+1].id)
                remove[i][j+1] = board[i][j+1];
                console.log("remove: " + board[i][j+2].id)
                remove[i][j+2] = board[i][j+2];
                j = j + 2;
                while (j < N - 1 && board[i][j].cat === board[i][j+1].cat){
                    console.log("remove: " + board[i][j+1].id);
                    remove[i][j+1] = board[i][j+1];
                    j += 1;
                }
            }
            if(i < N - 2 && board[i][j].cat === board[i + 1][j].cat && board[i][j].cat === board[i + 2][j].cat){
                console.log("remove: " + board[i][j].id)
                remove[i][j] = board[i][j];
                console.log("remove: " + board[i+1][j].id)
                remove[i+1][j] = board[i+1][j];
                console.log("remove: " + board[i+2][j].id)
                remove[i+2][j] = board[i+2][j];
                let k = i + 2
                while (k < N - 1 && board[k][j].cat === board[k+1][j].cat){
                    console.log("remove: " + board[k+1][j].id);
                    remove[k+1][j] = board[k+1][j];
                    k += 1;
                }
            }
        }
    }
}

function removeMatchedCells() {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (remove[i][j]) {
                console.log('#' + i * 10 + j)
                $('#gameArea [id="' + (i * 10 + j) + '"]').remove();
                board[i][j] = null;
                remove[i][j] = null;
            }
        }
    }
}

async function onClick() {
    let element = $(this);
    if (selected === null) {
        selected = element;
        selected.addClass('selected');
        animate(selected);
        element = null;
    } else {
        if(isAdjacent(selected, element)) {
            await moveBoth(selected, element);

            console.log(selected);
            console.log(element);
            checkMatch();
            console.log(remove);
        } else {
            selected.removeClass('selected');
            selected = element;
            selected.addClass('selected');
            animate(selected);
            element = null;
        }
        selected = null;
        element = null;
    }
}

function drawSquares() {
    for (let i = 0; i < N; i++){
        board[i] = [];
        remove[i] = [];
        for (let j = 0; j < N; j++) {
            let number = Math.floor(Math.random() * 10);

            let block = $('<div></div>').addClass('square').css({
                width: blockSize,
                height: blockSize,
                top: i * blockSize,
                left: j * blockSize,
                position: 'absolute',
                zIndex: 0
            }).attr(
                'id', i * 10 + j
            );

            let img = $('<img />').attr({
                'src': number + '.png',
                'cat': number
            }).css({
                width: '100%',
                height: '100%'
            });

            board[i][j] = {
                id: i * 10 + j,
                cat: number
            };


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
    console.log(board);
    checkMatch();
    console.log(remove);
    removeMatchedCells();
});