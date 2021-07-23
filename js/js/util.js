function createSqrMat(size) {
    var mat = [];
    for (var i = 0; i < size; i++) {
        mat.push([])
        for (var j = 0; j < size; j++) {
            mat[i].push(createCell());
        }
    }
    return mat;
}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isWrong:false

    }
}

function copyCell(cell) {
    return {
        minesAroundCount: cell.minesAroundCount,
        isShown: cell.isShown,
        isMine: cell.isMine,
        isMarked: cell.isMarked,
        isWrong:false
    }
}

function countNegsAroundCell(pos, board) {
    var count = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i >= board.length || i < 0) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j >= board.length || j < 0) continue
            if (board[i][j].isMine) count++;
        }
    }
    return count;
}

function getRandomInteger(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return parseInt(Math.random() * (max - min + 1) + min);
}

function getEmptyPositions(pos) {
    var emptyPositions = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (pos.i === i && pos.j === j) continue;
            emptyPositions.push({ i, j })
        }
    }
    return emptyPositions;
}

function revealCell(elCell, pos) {
    if (gBoard[pos.i][pos.j].isShown) return
    var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`);
    elCell.classList.remove('hidden')
    elCell.classList.add('shown')
    gBoard[pos.i][pos.j].isShown = true
    if (!gBoard[pos.i][pos.j].isMine) gGame.nonMineCount--
}

function getCopiedBoard(board) {
    var copiedBoard = []
    for (var i = 0; i < board.length; i++) {
        copiedBoard.push([])
        for (var j = 0; j < board.length; j++) {
            copiedBoard[i].push(copyCell(board[i][j]));
        }
    }
    return copiedBoard;
}
