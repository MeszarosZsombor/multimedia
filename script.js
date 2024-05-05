let sizeX = 800;
let sizeY = 800;
let N = 10;
let blockSize = sizeX / N;
let currentRotation = 0;
let selected = null;
let board = [];
let remove = [];
let points = 0;
let multiplier = 1;
let gameArea;
let musicButton
let pointText;
let toplist;
let game;
let scores;
let time;
let resetButton;
let tc = null;
let timeleft = 50;
let clickAudio = document.createElement('audio');
let music = document.createElement('audio');
let pop = document.createElement('audio');
let playing = false;
let padding = 6;

function refreshpoint(){
    pointText.text("Jelenlegi pontszámod: " + points.toFixed(0))
}

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
    console.log(firstItem, secondItem);

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
        $('.square').removeClass('selected');

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
                points += 50 * multiplier;
                multiplier += 0.1;
                j = j + 2;
                while (j < N - 1 && board[i][j].cat === board[i][j+1].cat){
                    remove[i][j+1] = board[i][j+1];
                    points += 60 * multiplier;
                    j += 1;
                }
                bool = true;
            }
            if(i < N - 2 && board[i][j].cat === board[i + 1][j].cat && board[i][j].cat === board[i + 2][j].cat){
                remove[i][j] = board[i][j];
                remove[i+1][j] = board[i+1][j];
                remove[i+2][j] = board[i+2][j];
                points += 50 * multiplier;
                multiplier += 0.1;
                let k = i + 2
                while (k < N - 1 && board[k][j].cat === board[k+1][j].cat){
                    remove[k+1][j] = board[k+1][j];
                    points += 60 * multiplier;
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
    $('.square').removeClass('selected');
    let element = $(this);
    if (selected === null) {
        selected = element;
        selected.addClass('selected');
        animate(selected);
        await clickAudio.play();
    } else if(isAdjacent(selected, element)) {
            let first = selected;
            let second = element;

            first.off('click');
        second.off('click');

            selected = null;
            await moveBoth(first, second);

            let matchFound = checkMatch();

            while(matchFound) {
                pop.currentTime = 0;
                pop.play();
                console.log(board);
                first.click(onClick);
                second.click(onClick);
                first = null;
                await removeMatchedCells();
                await goDown();
                checkEmpty();
                matchFound = checkMatch();
            }
            console.log(points)
            refreshpoint();
            multiplier = 1;

            if(!matchFound && first) {
                console.log(board);
                error(first);
                error(second);
                await moveBoth(first, second);
                first.click(onClick);
                second.click(onClick);
            }
    } else {
        selected = null;
        selected = element;
        selected.addClass('selected');
        animate(selected);
        clickAudio.play();
    }
    if(tc === null){
        tc = setInterval(time_count, 1000);
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
                    top: i * blockSize + padding,
                    left: j * blockSize + padding,
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
}

async function goDown() {
    return new Promise((resolve) => {
        for (let i = N-1; i > 0; i--) {
            for (let j = N-1; j >= 0; j--) {
                if (board[i][j].cat == null) {
                    let k = i - 1;
                    while (k >= 0 && board[k][j].cat == null){
                        k--;
                    }
                    if(k >= 0){
                        let upper = $('#gameArea [id="' + (k * 10 + j) + '"]');
                        let lower = $('#gameArea [id="' + (i * 10 + j) + '"]');

                        let firstPos = upper.position();
                        let secondPos = lower.position();

                        board[i][j].cat = board[k][j].cat;
                        board[k][j].cat = null;

                        let upperImg = upper.find('img');

                        upperImg.css({position: 'relative', top: 0, left: 0});


                        upperImg.animate({
                            top: secondPos.top - firstPos.top,
                            left: secondPos.left - firstPos.left
                        }, {
                            duration: 500,
                            complete: function () {
                                /*TODO neha rossz cat-et kap, nem talal match-et*/
                                let img = $('<img/>').attr({
                                    'src': upperImg.attr('src'),
                                    'cat': upperImg.attr('cat')
                                }).css({
                                        width: '100%',
                                        height: '100%'
                                    });
                                img.appendTo(lower);
                                upper.empty();
                            }
                        });
                    }
                }
            }
        }
        setTimeout(resolve, 550);
    });
}

function fill_toplist() {
    $('#list').empty();
    let data = [];
    for (let i = 0; i < localStorage.length; i++) {
        data[i] = [localStorage.key(i), parseInt(localStorage.getItem(localStorage.key(i)))];
    }

    data.sort(function (a, b) {
        return b[1] - a[1];
    });

    for (let act_data of data.keys()) {
        if (act_data < 10) {
            $('#list').append(data[act_data][0] + ' - ' + data[act_data][1] + '<br><hr>');
        }
    }
}

function time_count() {
    timeleft--;
    $('#time').text("Hátralévő idő: " + timeleft + " mp");
    if (timeleft === 0) {
        clearInterval(tc);
        let person = prompt("Adja meg a nevét:", "anonymous");

        if(person == null){
            person = "anonymous"
        }

        localStorage.setItem(person, points);

        fill_toplist();
    }
}

$(document).ready(function(){
    game = $('<div></div>').attr('id', 'game').appendTo('body');
    scores = $('<div></div>').attr('id', 'score').appendTo(game);
    musicButton = $('<div></div>').attr('id', 'music').appendTo(scores);
    time = $('<div></div>').attr('id', 'time').appendTo(scores);
    toplist = $('<div></div>').attr('id', 'toplist').appendTo(scores);
    pointText = $('<div></div>').attr('id', 'pointText').appendTo(scores);
    resetButton = $('<div></div>').attr('id', 'reset').appendTo(scores);

    $('body').css("background-image", "url('nyan.gif')");

    clickAudio.setAttribute('src', 'click.wav');
    clickAudio.volume = 0.1;

    pop.setAttribute('src', 'pop.mp3');
    pop.volume = 0.1;

    music.setAttribute('src', 'music.mp3');
    music.volume = 0.05;

    $('<button>Zene lejátszása</button>').attr('id', 'musicButton').appendTo(musicButton);

    $('#musicButton').click(function (){
        if(!playing){
            music.play();
            $('#musicButton').text('Zene megállítása');
            playing = true;
            music.addEventListener('ended', function () {
                this.play();
            }, false);
        }else{
            music.pause();
            $('#musicButton').text('Zene lejátszása');
            playing = false;
        }
    });

    $('<button>Játék újraindítása</button>').attr('id', 'resetButton').click(function () {
        location.reload();
    }).appendTo(resetButton);



    $('<h3>Toplista</h3>').appendTo(toplist);

    $('<p></p>').attr('id', 'list').appendTo(toplist);

    time.text("Hátralévő idő: " + timeleft + " mp");

    refreshpoint();
    fill_toplist();


    gameArea = $('<div></div>').attr('id', 'gameArea').css({
        width: sizeX,
        height: sizeY,
        top: '50%',
        left: '50%',
        padding: padding,
        marginLeft: '-350px',
        marginTop: '-400px',
        position: 'absolute',
        float: 'right'
    }).appendTo(game);

    drawSquares();
    checkMatch();
    removeMatchedCells();
    checkEmpty();
    while (checkMatch()){
        checkEmpty();
    }

    $('.square').click(onClick);
    points = 0;
});