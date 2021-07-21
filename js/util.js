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
        isMarked: false
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

function getEmptyPositions() {
    var emptyPositions = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            emptyPositions.push({ i, j })
        }
    }
    return emptyPositions;
}
