const FLAG = '🚩';
const MINE = '💥';

class Cell {
  constructor(row, col, board) {
    this.row = row;
    this.col = col;
    this.bomb = false;
    this.board = board;
    this.revealed = false;
    this.flagged = false;
    this.neighborBombCount = 0;
  }

  drawFlag() {
    const { cellSize, ctx } = this.board;
    if (this.flagged) {
      // рисуем флаг
      ctx.font = '28px Arial';
      if (cellSize < 35) {
        ctx.font = '20px Arial';
      }
      if (cellSize < 25) {
        ctx.font = '16px Arial';
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(FLAG, this.col * cellSize + cellSize / 2, this.row * cellSize + cellSize / 2);
    } else {
      // удаляем флаг
      ctx.strokeStyle = '#999';
      ctx.fillStyle = '#ccc';
      if (!this.board.theme) {
        ctx.fillStyle = '#abc';
      }
      ctx.clearRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
      ctx.fillRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
      ctx.strokeRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
    }
  }

  drawBomb(ctx) {
    const { cellSize } = this.board;
    if (this.bomb) {
      ctx.fillStyle = '#dd5511';
      ctx.fillRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#999';
      ctx.strokeRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
      // рисуем мину
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // ctx.fillStyle = '#000';
      ctx.fillText(MINE, this.col * cellSize + cellSize / 2, this.row * cellSize + cellSize / 2);
      // this.isFlagged = false;
    }
  }

  drawCell(ctx) {
    const { cellSize } = this.board;
    ctx.fillStyle = '#ddd';
    ctx.strokeStyle = '#999';
    ctx.fillRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
    ctx.strokeRect(this.col * cellSize, this.row * cellSize, cellSize, cellSize);
  }

  drawNeighborBombCount(ctx) {
    ctx.font = '18px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (this.neighborBombCount) {
      case 1:
        ctx.fillStyle = 'blue';
        break;
      case 2:
        ctx.fillStyle = 'green';
        break;
      case 3:
        ctx.fillStyle = 'red';
        break;
      case 4:
        ctx.fillStyle = 'orange';
        break;
      default:
        ctx.fillStyle = 'red';
        break;
    }
    ctx.fillText(
      this.neighborBombCount,
      this.col * this.board.cellSize + this.board.cellSize / 2,
      this.row * this.board.cellSize + this.board.cellSize / 2 + 2
    );
  }

  // Функция, которая открывает ячейку
  reveal() {
    const { ctx } = this.board;
    if (this.revealed || this.flagged) {
      return;
    }

    // на первом шаге расставляем мины
    if (this.board.firstMove) {
      this.board.generateMines(this);
      this.getNeighborBombCount();
      this.drawCell(ctx);
      this.drawNeighborBombCount(ctx);
      this.revealed = true;
      this.board.firstMove = false;
    }

    this.revealed = true;

    if (this.board.getWinner()) {
      this.board.endGame(true);
    }
    if (this.bomb) {
      this.drawBomb(ctx);
      this.board.gameOver = true;
      this.board.win = false;
      this.board.endGame(false);
    } else {
      this.board.playSound('reveal');
      this.drawCell(ctx);
      this.getNeighborBombCount();
    }
    if (!this.bomb && this.neighborBombCount > 0) {
      this.drawNeighborBombCount(ctx);
    } else if (!this.bomb && this.neighborBombCount === 0) {
      const adj = this.getAdjacentCells();
      adj.forEach((cell) => {
        if (!cell.revealed) cell.reveal();
      });
    }
  }

  // возвращает список ячеек, которые являются соседними
  getAdjacentCells() {
    const board = this.board.cells;
    const adj = [];
    const lastRow = board.length - 1;
    const lastCol = board[0].length - 1;
    if (this.row > 0 && this.col > 0) adj.push(board[this.row - 1][this.col - 1]);
    if (this.row > 0) adj.push(board[this.row - 1][this.col]);
    if (this.row > 0 && this.col < lastCol) adj.push(board[this.row - 1][this.col + 1]);
    if (this.col < lastCol) adj.push(board[this.row][this.col + 1]);
    if (this.row < lastRow && this.col < lastCol) adj.push(board[this.row + 1][this.col + 1]);
    if (this.row < lastRow) adj.push(board[this.row + 1][this.col]);
    if (this.row < lastRow && this.col > 0) adj.push(board[this.row + 1][this.col - 1]);
    if (this.col > 0) adj.push(board[this.row][this.col - 1]);
    return adj;
  }

  // Функция, которая переключает флаг на ячейке
  toggleFlag() {
    if (!this.revealed) {
      this.flagged = !this.flagged;
      this.drawFlag();
    }
    this.board.countMines();
  }

  // вычисляем количество бомб у соседних ячеек
  getNeighborBombCount() {
    let count = 0;
    for (let i = this.row - 1; i <= this.row + 1; i++) {
      for (let j = this.col - 1; j <= this.col + 1; j++) {
        if (i >= 0 && i < this.board.rows && j >= 0 && j < this.board.cols) {
          const neighbor = this.board.cells[i][j];
          if (neighbor.bomb) {
            count += 1;
          }
        }
      }
    }
    this.neighborBombCount = count;
  }
}

export default Cell;
