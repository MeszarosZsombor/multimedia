let sizeX = 800;
let sizeY = 800;
let N = 10;
let blockSize = sizeX / N;
let currentRotation = 0;
let selected = null;
let board = [];
let remove = [];
let gameArea;

function rotate(element, degree) {
    currentRotation += degree;
    element.animate({  borderSpacing: degree }, {
        step: function(now) {
            $(this).css('transform','rotate('+now+'deg)');
        },
        duration: 50
    },'linear');
}

function error(first, second){
    rotate(first, -10);

    setTimeout(function (){
        rotate(first, 20);
    }, 50);

    setTimeout(function (){
        rotate(first, 0);
    }, 100);
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
        rotate(element, 0);
    }, 150);
}

function isAdjacent(selected, element) {
    let selectedPos = selected.position();
    let elementPos = element.position();

    return (Math.abs(selectedPos.top - elementPos.top) === blockSize && selectedPos.left === elementPos.left) ||
        (Math.abs(selectedPos.left - elementPos.left) === blockSize && selectedPos.top === elementPos.top);
}

function searchById(id) {
    let item;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j].id === parseInt(id)) {
                item = board[i][j];
            }
        }
    }

    return item;
}

function swapInArray(firstId, secondId) {
    let firstItem = searchById(firstId);
    let secondItem = searchById(secondId);

    let firstRow = board.findIndex(row => row.includes(firstItem));
    let firstCol = board[firstRow].indexOf(firstItem);

    let secondRow = board.findIndex(row => row.includes(secondItem));
    let secondCol = board[secondRow].indexOf(secondItem);

    let tmp = board[firstRow][firstCol];
    board[firstRow][firstCol] = board[secondRow][secondCol];
    board[secondRow][secondCol] = tmp;
}

function moveBoth(first, second) {
    return new Promise((resolve) => {

        let firstPos = first.position();
        let secondPos = second.position();
        first.removeClass('selected');

        let firstId = first.attr('id');
        let secondId = second.attr('id');
        swapInArray(firstId, secondId);

        let firstImg = first.find('img');
        let secondImg = second.find('img');

        let firstImgSrc = firstImg.attr('src');
        let secondImgSrc = secondImg.attr('src');

        firstImg.css({position: 'relative', top: 0, left: 0});
        secondImg.css({position: 'relative', top: 0, left: 0});

        firstImg.animate({
            top: secondPos.top - firstPos.top,
            left: secondPos.left - firstPos.left
        }, {
            duration: 500,
            complete: function () {
                secondImg.animate({
                    top: firstPos.top - secondPos.top,
                    left: firstPos.left - secondPos.left
                }, {
                    duration: 500,
                    complete: function () {
                        firstImg.attr('src', secondImgSrc);
                        secondImg.attr('src', firstImgSrc);

                        firstImg.css({position: '', top: '', left: ''});
                        secondImg.css({position: '', top: '', left: ''});

                        resolve();
                    }
                });
            }
        });
    });
}

function checkMatch(){
    let bool = false;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if(j < N - 2 && board[i][j].cat === board[i][j + 1].cat && board[i][j].cat === board[i][j + 2].cat){
                remove[i][j] = board[i][j];
                remove[i][j+1] = board[i][j+1];
                remove[i][j+2] = board[i][j+2];
                j = j + 2;
                while (j < N - 1 && board[i][j].cat === board[i][j+1].cat){
                    remove[i][j+1] = board[i][j+1];
                    j += 1;
                }
                bool = true;
            }
            if(i < N - 2 && board[i][j].cat === board[i + 1][j].cat && board[i][j].cat === board[i + 2][j].cat){
                remove[i][j] = board[i][j];
                remove[i+1][j] = board[i+1][j];
                remove[i+2][j] = board[i+2][j];
                let k = i + 2
                while (k < N - 1 && board[k][j].cat === board[k+1][j].cat){
                    remove[k+1][j] = board[k+1][j];
                    k += 1;
                }
                bool = true;
            }
        }
    }
    return bool;
}

function checkEmpty() {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++) {
            if(board[i][j].cat == null) {
                let number = Math.floor(Math.random() * 10);

                let img = $('<img/>').attr({
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

                let block = $('#gameArea [id="' + (i * 10 + j) + '"]');
                img.appendTo(block);
            }
        }
    }
    console.log(board);
    checkMatch();
}

function removeMatchedCells() {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (remove[i][j]) {
                $('#gameArea [id="' + (i * 10 + j) + '"]').empty();
                board[i][j].cat = null;
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

            if(checkMatch()) {
                await removeMatchedCells();
                await goDown();
            }else{
                error(selected);
                error(element);
                await moveBoth(selected, element);
            }
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

                block.appendTo(gameArea);
            }
    }
    checkMatch();
}

async function goDown() {
    for (let i = N-1; i > 0; i--) {
        for (let j = N-1; j > 0; j--) {
            if (board[i][j].cat == null) {
                let k = i - 1;
                while (k >= 0 && board[k][j].cat == null){
                    k--;
                }
                if(k >= 0){
                    let upper = $('#gameArea [id="' + (i * 10 + j) + '"]');
                    let lower = $('#gameArea [id="' + (k * 10 + j) + '"]');

                    let firstPos = upper.position();
                    let secondPos = lower.position();

                    board[i][j].cat = board[k][j].cat;
                    board[k][j].cat = null;

                    let upperImg = upper.find('img').attr('src');
                    let secondImg = lower.find('img');

                    let secondImgSrc = secondImg.attr('src');

                    secondImg.css({position: 'relative', top: 0, left: 0});


                    secondImg.animate({
                        top: firstPos.top - secondPos.top,
                        left: firstPos.left - secondPos.left
                    }, {
                        duration: 500,
                        complete: function () {
                            lower.find('img').attr('src', upperImg);
                        }
                    });
                }
            }
        }
    }
    console.log(board);

    /*TODO ne maradjon az oszlop tetejen az img tag*/
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
    removeMatchedCells();
    checkEmpty();

    $('.square').click(onClick);
});