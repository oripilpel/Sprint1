const MINE = '<img class="mine" src="img/mine.png"/>'
const MARKED = '<img class="flag" src="img/flag.png"/>'

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    noOfLives: 3,
    nonMineCount: gLevel.SIZE ** 2 - gLevel.MINES,
    timerInterval: 0,
    startTime: 0,
    minesLeft: gLevel.MINES,
    minesLeftInterval: 0,
    firstCellClicked: false
};

function initGame() {
    buildBoard();
    positionMineOnEmptyCells();
    setMinesNegsCount();
    renderMinesLeft();
    gGame.startTime = Date.now();
    gGame.timerInterval = setInterval(renderTimer, 500, gGame.startTime);
    renderBoard(gBoard);
}

function renderBoard(board) {
    var elBoard = document.querySelector('.board tbody')
    var html = ''
    for (var i = 0; i < board.length; i++) {
        html += '<tr>'
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine && !board[i][j].isMarked) {
                var str = MINE;
            } else if (board[i][j].isMarked) {
                var str = MARKED;
            } else {
                var str = (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : ''
            }
            html += `<td data-i="${i}" data-j="${j}" oncontextmenu="markCell(this,${i}, ${j},event)" onclick="cellClicked(this,${i}, ${j})" class="${(board[i][j].isShown) ? 'shown' : 'hidden'} ${(board[i][j].isMarked) ? 'marked' : ''}">${str}</td>`
        }
        html += '</tr>';
    }

    elBoard.innerHTML = html;
}

function buildBoard() {
    gBoard = createSqrMat(gLevel.SIZE)
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) continue
            gBoard[i][j].minesAroundCount = countNegsAroundCell({ i, j }, gBoard);
        }
    }
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (currCell.isMarked) return;
    if (currCell.isMine && !currCell.isShown) {
        gGame.noOfLives--
        gGame.minesLeft--
        renderMinesLeft()
    };
    if (!currCell.isMine && !currCell.isShown) {
        if (currCell.minesAroundCount === 0) {
            var locations = getEmptyNegsLocations({ i, j })
            revealEmptyNegs(locations);
            gGame.nonMineCount -= (locations.length === gGame.nonMineCount) ? locations.length - 1 : locations.length;
        }
        gGame.nonMineCount--
    }
    console.log(gGame.nonMineCount);
    currCell.isShown = true;
    elCell.classList.remove('hidden');
    elCell.classList.add('shown');
    if (checkGameOver()) endGame();
}

function markCell(elCell, i, j, event) {
    if (gBoard[i][j].isShown) {
        event.preventDefault();
        return
    }
    elCell.classList.toggle('marked')
    gBoard[i][j].isMarked = elCell.classList.contains('marked')
    event.preventDefault();
    renderBoard(gBoard)
}

function positionMineOnEmptyCells() {
    switch (gLevel.SIZE) {
        case 4:
            gLevel.MINES = 2;
            break;
        case 8:
            gLevel.MINES = 12;
            break;
        case 12:
            gLevel.MINES = 30;
            break;
    }
    var emptyPositions = getEmptyPositions(gBoard);
    for (var i = 0; i < gLevel.MINES; i++) {
        var rndIdx = getRandomInteger(0, emptyPositions.length - 1)
        var emptyPosition = emptyPositions.splice(rndIdx, 1)[0];
        gBoard[emptyPosition.i][emptyPosition.j].isMine = true;
    }

}

function checkGameOver() {
    if (gGame.noOfLives === 0) return true;
    if (gGame.nonMineCount === 0) return true;
    return false;
}

function renderTimer(date) {
    var timePassedInSec = (Date.now() - date) / 1000;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = parseInt(timePassedInSec);
}

function getEmptyNegsLocations(pos) {
    var locations = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i >= gLevel.SIZE || i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j >= gLevel.SIZE || j < 0) continue;
            if (i === pos.i && j === pos.j) continue;
            if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
                locations.push({ i, j });

            }
        }
    }

    return locations;
}

function revealEmptyNegs(locations) {
    for (var idx = 0; idx < locations.length; idx++) {
        currLocation = locations[idx];
        gBoard[currLocation.i][currLocation.j].isShown = true;
        var elNegCell = document.querySelector(`[data-i="${currLocation.i}"][data-j="${currLocation.j}"]`);
        elNegCell.classList.remove('hidden');
        elNegCell.classList.add('shown');
    }
}

function renderMinesLeft() {
    var elMinesLeft = document.querySelector('.mines-left')
    elMinesLeft.innerText = gGame.minesLeft;
}

function endGame() {
    clearInterval(gGame.timerInterval)
    clearInterval(gGame.minesLeftInterval)
}

function restart() {
    endGame()
    initGame()
}