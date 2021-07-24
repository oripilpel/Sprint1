const MINE_IMG = '<img class="mine" src="img/mine.png"/>'
const MARKED_IMG = '<img class="flag" src="img/flag.png"/>'
const HINT_ON_IMG = '<img class="hint" onclick="onHintClick()" src="img/hinton.png"/>'
const HINT_OFF_IMG = '<img class="hint" onclick="onHintClick()" src="img/hintoff.png"/>'
const LIFE_IMG = '<img src="img/heart.png"/>'
const WRONG_IMG = '<img class="wrong" src="img/cross.png"/>'

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    markedCount: 0,
    secsPassed: 0,
    noOfLives: 2,
    nonMineCount: 0,
    timerInterval: 0,
    startTime: 0,
    minesLeft: 0,
    clickedFirstCell: false,
    hintsLeft: 3,
    isHintOn: false,
    boards: [],
    nonMineCounts: [],
    noOfLivesCounts: [],
    safeClickCounter: 0
};

function initGame() {
    buildBoard();
    renderBoard(gBoard);
    setMineCount()
    gGame.hintsLeft = 3;
    gGame.noOfLives = (gLevel.SIZE === 4) ? 2 : 3;
    gGame.safeClickCounter = 3;
    renderSafeClicksNum()
    renderLives()
    renderTimer(Date.now())
    renderHints()

}

function startGame(pos) {
    positionMineOnEmptyCells(pos);
    setMinesNegsCount();
    renderHints()
    gGame.nonMineCount = gLevel.SIZE ** 2 - gLevel.MINES
    gGame.minesLeft = gLevel.MINES
    gGame.startTime = Date.now();
    gGame.timerInterval = setInterval(renderTimer, 500, gGame.startTime);
    renderLives()
    renderBoard(gBoard);
}

function renderBoard(board) {
    var elBoard = document.querySelector('.board tbody')
    var html = ''
    for (var i = 0; i < board.length; i++) {
        html += '<tr>'
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine && !board[i][j].isMarked) {
                var str = MINE_IMG;
            } else if (board[i][j].isMarked) {
                var str = MARKED_IMG;
            } else if (board[i][j].isWrong) {
                var str = WRONG_IMG;
            } else {
                var str = (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : ''
            }
            html += `<td data-i="${i}" data-j="${j}" oncontextmenu="markCell(this,${i}, ${j},event)" onclick="cellClicked(this,${i}, ${j},true)" class="${(board[i][j].isShown) ? 'shown' : 'hidden'} ${(board[i][j].isMarked) ? 'marked' : ''}">${str}</td>`
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

function cellClicked(elCell, i, j, isUsrClicked) {
    if (!gGame.clickedFirstCell) {
        gGame.clickedFirstCell = true
        startGame({ i, j });
        gGame.isOn = true
    }

    if (gGame.isHintOn) {
        peekCellAndNegs({ i, j })
        gGame.isHintOn = false;
        return
    }

    var currCell = gBoard[i][j]
    if (currCell.isMarked || !gGame.isOn || currCell.isShown) return;
    if (isUsrClicked) {
        gGame.boards.push(getCopiedBoard(gBoard))
        gGame.noOfLivesCounts.push(gGame.noOfLives)
        gGame.nonMineCounts.push(gGame.nonMineCount)

    }

    if (!currCell.isShown) {
        if (currCell.isMine) {
            gGame.noOfLives--
            gGame.minesLeft--
            renderSmiley('blown')
            renderLives()
            revealCell(elCell, { i, j })
        } else if (!currCell.isMine) {
            revealCell(elCell, { i, j })
            if (currCell.minesAroundCount === 0) {
                clickOnEmptyNegs({ i, j })
            }
            renderSmiley('regular')
            revealCell(elCell, { i, j })
        }

    }
    if (checkGameOver()) endGame();

}

function markCell(elCell, i, j, event) {
    event.preventDefault();
    if (gBoard[i][j].isShown || !gGame.isOn) return
    elCell.classList.toggle('marked')
    gBoard[i][j].isMarked = elCell.classList.contains('marked')
    renderBoard(gBoard)
}

function setMineCount() {
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
}

function positionMineOnEmptyCells(pos) {
    var emptyPositions = getEmptyPositions(pos);
    for (var i = 0; i < gLevel.MINES; i++) {
        var rndIdx = getRandomInteger(0, emptyPositions.length - 1)
        var emptyPosition = emptyPositions.splice(rndIdx, 1)[0];
        gBoard[emptyPosition.i][emptyPosition.j].isMine = true;
    }
}

function checkGameOver() {
    return gGame.noOfLives === 0 || gGame.nonMineCount === 0;
}

function renderTimer(date) {
    var timePassedInSec = (Date.now() - date) / 1000;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = (formatTime(timePassedInSec));
}

function clickOnEmptyNegs(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i >= gLevel.SIZE || i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j >= gLevel.SIZE || j < 0) continue;
            if (i === pos.i && j === pos.j) continue;
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                cellClicked(elCell, i, j, false)
                revealCell(elCell, { i, j })
            }
        }
    }

}

function endGame() {
    clearInterval(gGame.timerInterval)
    if (gGame.noOfLives === 0) {
        doForAllMines('reveal')
    } else if (gGame.nonMineCount === 0) {
        doForAllMines('mark')
        renderSmiley('sunglasses')
    }
    gGame.isOn = false;

}

function doForAllMines(action) {
    var strAction = 'is'
    var strOtherAction = 'is'
    if (action === 'reveal') {
        strAction += 'Shown'
        strOtherAction += 'Marked'
    } else {
        strOtherAction += 'Shown'
        strAction += 'Marked'
    }

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currPos = gBoard[i][j]
            if (currPos.isMine && !currPos[strAction] && !currPos[strOtherAction]) { currPos[strAction] = true }
            if (currPos.isMarked && !currPos.isMine) {
                currPos.isMarked = false
                currPos.isShown = true
                currPos.isWrong = true
            }
        }
    }
    renderBoard(gBoard)
}

function restart() {
    gGame.clickedFirstCell = false;
    endGame()
    renderSmiley('regular')
    initGame()
}

function renderSmiley(smiley) {
    var elSmiley = document.querySelector('.smiley')
    switch (smiley) {
        case 'sunglasses':
            elSmiley.innerText = '😎'
            break;
        case 'blown':
            elSmiley.innerText = '🤯'
            break;
        case 'regular':
            elSmiley.innerText = '😀'
            break;
    }
}

function renderLives() {
    var elLives = document.querySelector('.lives');
    var html = ''
    for (var i = 0; i < gGame.noOfLives; i++) {
        html += LIFE_IMG
    }
    elLives.innerHTML = html
}

function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 'hard':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'extreme':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    restart()
}

function onHintClick() {
    if (!gGame.hintsLeft || !gGame.isOn || gGame.isHintOn) return;
    gGame.isHintOn = true;
    gGame.hintsLeft--
    renderHints()
}

function peekCellAndNegs(pos) {
    var positions = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
            gBoard[i][j].isShown = true;
            positions.push({ i, j })
        }
    }
    renderBoard(gBoard)
    setTimeout(function () {
        for (var index = 0; index < positions.length; index++) {
            currPos = positions[index]
            gBoard[currPos.i][currPos.j].isShown = false
        }
        renderBoard(gBoard)
    }, 1000)

}

function renderHints() {
    var elHints = document.querySelector('.hints')
    var html = ''
    for (var i = 0; i < gGame.hintsLeft; i++) {
        html += HINT_OFF_IMG
    }
    while (i < 3) {
        html += HINT_ON_IMG
        i++
    }
    elHints.innerHTML = html
}

function formatTime(time) {
    var timeInMins = parseInt(time / 60);
    var timeLeft = parseInt(time - (timeInMins * 60));
    timeInMins = ((timeInMins + '').length > 1) ? timeInMins + '' : '0' + timeInMins
    timeLeft = ((timeLeft + '').length > 1) ? timeLeft + '' : '0' + timeLeft
    return timeInMins + ":" + timeLeft
}

function onUndo() {
    if (gGame.boards.length === 0 || !gGame.isOn) return
    gBoard = gGame.boards.pop()
    gGame.noOfLives = gGame.noOfLivesCounts.pop()
    gGame.nonMineCount = gGame.nonMineCounts.pop()
    renderLives()
    renderBoard(gBoard)
}

function onSafeClick() {
    var locations = getEmptyPositions();
    if (!gGame.safeClickCounter || !locations.length) return
    var rndIdx = getRandomInteger(0, locations.length - 1);
    var rndPos = locations[rndIdx];
    var elRndPos = document.querySelector(`[data-i="${rndPos.i}"][data-j="${rndPos.j}"]`)
    var elPosColor = elRndPos.style.backgroundColor
    elRndPos.style.backgroundColor = 'blue'
    gGame.safeClickCounter--;
    renderSafeClicksNum()
    setTimeout(function () {
        elRndPos.style.backgroundColor = elPosColor
    }, 2000)
}

function renderSafeClicksNum() {
    var elSafeClickCnt = document.querySelector('span');
    elSafeClickCnt.innerText = gGame.safeClickCounter
}

