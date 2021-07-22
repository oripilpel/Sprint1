'use strict'

function createBoard(size = 4, firstClickLocation = { i: 0, j: 0 }) {
    var board = [];
    var firstI = firstClickLocation.i
    var firstJ = firstClickLocation.j
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            if (firstI === i && firstJ === j) {
                board[i][j] = {
                    minesAroundCount: 0,
                    isShown: false,
                    isMine: false,
                    isMarked: false,
                    isFirstclick: true,
                };
                console.log(i, j);
            } else {
                board[i][j] = {
                    minesAroundCount: 0,
                    isShown: false,
                    isMine: false,
                    isMarked: false,
                    isFirstclick: false
                };

            }
        }
    }
    console.log(board);
    return board;
}
function renderBoard(board) {

   var strHTML='';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getCellClass({ i, j })
            strHTML += `\t <td class="cell ${cellClass}" oncontextmenu="markCell(this,${i},${j});return false;" onclick="cellClicked(this,${i},${j})" >\n`;
            if(currCell.isMine){
                strHTML+='\t<img class="hidden" src="img/mine.png" />\n'
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elTable = document.querySelector('.gameBoard');
    elTable.innerHTML = strHTML;
}
function getEmptyRandCell(board = gBoard) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isFirstclick && !board[i][j].isMine) {
                emptyCells.push({ i, j })
            } if (board[i][j].isFirstclick) {
                var firstClickLocation = { i, j }
                console.log(firstClickLocation);
            }
        }
    }
    // to make sure first cell is empty!
    var selectedCell = emptyCells.splice(getRandom(0, emptyCells.length))[0]
    var clickNeighbours = getNeighbors(firstClickLocation);
    for (var i = 0; i < clickNeighbours.length; i++) {
        if (clickNeighbours[i].i === selectedCell.i && clickNeighbours[i].j === selectedCell.j) {
            selectedCell = getEmptyRandCell();
        }
    }
    console.log(selectedCell);
    return selectedCell;
}
function getNeighbors(pos) {
    var neighbors = [];
    for (var i = pos.i - 1; i <= pos.i + 1 && i < gBoard.length; i++) {
        if (i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1 && j < gBoard.length; j++) {
            if (j < 0 || (i === pos.i && j === pos.j)) continue;
            neighbors.push({ i, j });
        }
    }
    return neighbors;
}
function getCellClass(location) {
    var strClass = `cell-${location.i}-${location.j}`;
    return strClass;
}
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
