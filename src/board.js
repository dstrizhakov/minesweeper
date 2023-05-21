import Cell from './cell.js';

class Board {
  constructor(size, bombs, cellSize) {
    this.rows = size;
    this.cols = size;
    this.cellSize = cellSize;
    this.bombs = bombs;
    this.counter = bombs;
    this.cells = [];
    this.gameOver = false;
    this.win = false;
    this.message = false;
    this.canvas = null;
    this.ctx = null;
    this.firstMove = true;
    this.timer = null;
    this.currentTime = 0;
    this.savedResults = [];
    this.mooves = 0;
    this.soundTimeouts = {};
    this.clickSound = new Audio('./assets/click.mp3');
    this.tickSound = new Audio('./assets/tick.mp3');
    this.looseSound = new Audio('./assets/lose.mp3');
    this.winSound = new Audio('./assets/win.mp3');
    this.checkThemeEl = document.getElementById('check-theme');
    this.theme = this.checkThemeEl.checked;
  }

  initBoard() {
    this.render();
    this.loadResults();
    this.showResults();

    this.checkThemeHandler = () => {
      this.theme = this.checkThemeEl.checked;
      this.setFieldTheme();
    };

    this.clickHandler = (event) => {
      this.countMoves();
      const x = event.offsetX;
      const y = event.offsetY;
      const row = Math.floor(y / this.cellSize);
      const col = Math.floor(x / this.cellSize);
      const cell = this.cells[row][col];
      if (this.firstMove) {
        this.startTime = Date.now();
        this.startTimer();
        this.countMines();
      }
      this.playSound('reveal');
      cell.reveal();
    };

    this.contextHandler = (event) => {
      event.preventDefault();
      this.countMoves();
      const x = event.offsetX;
      const y = event.offsetY;
      const row = Math.floor(y / this.cellSize);
      const col = Math.floor(x / this.cellSize);
      const cell = this.cells[row][col];
      if (this.firstMove) {
        this.startTime = Date.now();
        this.startTimer();
      }
      this.playSound('tick');
      cell.toggleFlag();
    };

    // добавляем обработчик события click на checkTheme
    this.checkThemeEl.addEventListener('change', this.checkThemeHandler);
    // добавляем обработчик события click на canvas
    this.canvas.addEventListener('click', this.clickHandler);
    // добавляем обработчик события contextmenu на canvas
    this.canvas.addEventListener('contextmenu', this.contextHandler);
  }

  render() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.cols * this.cellSize;
    this.canvas.height = this.rows * this.cellSize;
    this.ctx = this.canvas.getContext('2d');
    const board = document.querySelector('.board');
    board.append(this.canvas);
    this.createField();
  }

  createField() {
    // создаем пустое поле
    for (let i = 0; i < this.rows; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j] = new Cell(i, j, this);
      }
    }
    this.setFieldTheme();
  }

  setFieldTheme() {
    // рисуем ячейки поля
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = this.cells[i][j];
        this.ctx.fillStyle = '#abc';
        this.ctx.strokeStyle = '#999';
        if (this.theme) {
          this.ctx.fillStyle = '#ccc';
        }
        if (!cell.revealed) {
          this.ctx.fillRect(j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
          this.ctx.strokeRect(j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
        }
        if (cell.flagged) {
          cell.drawFlag();
        }
      }
    }
  }

  // создаем мины в ячейках кроме opened
  generateMines(opened) {
    let bombsPlaced = 0;
    while (bombsPlaced < this.bombs) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      const cell = this.cells[row][col];
      if (cell !== opened && cell.bomb === false) {
        cell.bomb = true;
        bombsPlaced += 1;
      }
    }
  }

  startTimer() {
    const timerDisplay = document.querySelector('.timer');
    timerDisplay.textContent = 'Time: 0';
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.currentTime = currentTime;
      timerDisplay.textContent = `Time: ${currentTime}`;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  countMines() {
    const minesDisplay = document.querySelector('.mines');
    if (this.firstMove) {
      minesDisplay.textContent = `Mines: ${this.bombs}`;
    }
    let flagged = 0;
    this.cells.forEach((row) => {
      flagged += row.filter((cell) => cell.flagged).length;
    });
    this.counter = this.bombs - flagged;
    minesDisplay.textContent = `Mines: ${this.counter}`;
  }

  countMoves() {
    this.mooves += 1;
    const movesEl = document.querySelector('.moves');
    movesEl.textContent = `Moves: ${this.mooves}`;
  }

  endGame(result) {
    if (!result) {
      this.stopTimer();
      this.canvas.removeEventListener('click', this.clickHandler);
      this.canvas.removeEventListener('contextmenu', this.contextHandler);
      this.revealAll();
    } else if (result) {
      this.stopTimer();
      this.canvas.removeEventListener('click', this.clickHandler);
      this.canvas.removeEventListener('contextmenu', this.contextHandler);
    }
    if (!this.win && this.gameOver) {
      this.playSound('loose');
      this.showMessage(false);
      this.win = false;
      this.gameOver = false;
    }
    if (this.win && !this.gameOver) {
      this.savedResults.push([this.currentTime, this.mooves, this.rows, this.bombs]);
      this.saveResults();
      this.showResults();

      this.playSound('win');
      const minesDisplay = document.querySelector('.mines');
      minesDisplay.textContent = 'Mines: 0';
      this.showMessage(true);
      this.win = false;
      this.gameOver = false;
    }
  }

  playSound(type) {
    const checkSound = document.getElementById('check-sounds');

    const soundMap = {
      reveal: this.clickSound,
      tick: this.tickSound,
      loose: this.looseSound,
      win: this.winSound,
    };

    if (checkSound.checked) {
      // Звук включен
      if (this.soundTimeouts[type]) {
        clearTimeout(this.soundTimeouts[type]);
      } else {
        soundMap[type].play();
      }

      this.soundTimeouts[type] = setTimeout(() => {
        delete this.soundTimeouts[type];
      }, 10);
    }
  }

  revealAll() {
    this.cells.forEach((rowArr) => {
      rowArr.forEach((cell) => {
        cell.reveal();
      });
    });
  }

  getWinner() {
    if (!this.gameOver) {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const cell = this.cells[row][col];
          if (!cell.revealed && !cell.bomb) return false;
        }
      }
      this.win = true;
      return true;
    }
    return false;
  }

  showMessage(result) {
    if (!this.message) {
      const board = document.querySelector('.board');
      const message = document.createElement('h2');
      if (result) {
        message.classList.add('win');
        message.innerText = `Hooray! You found all mines in ${this.currentTime} seconds and ${this.mooves} moves!`;
      } else {
        message.classList.add('loose');
        message.innerText = 'Game over. Try again';
      }
      board.append(message);
    }

    this.message = true;
  }

  // сохраняем результаты в localStorage
  saveResults() {
    this.savedResults = this.savedResults.slice(-10);
    localStorage.setItem('results', JSON.stringify(this.savedResults));
  }

  // получаем сохраненные результаты из localStorage
  loadResults() {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    this.savedResults = results.slice(-10);
  }

  showResults() {
    const movesEl = document.querySelector('.moves');
    movesEl.textContent = `Moves: ${this.mooves}`;
    const resultsEl = document.querySelector('.results');
    resultsEl.textContent = '';
    this.savedResults.reverse().forEach((result) => {
      const li = document.createElement('li');
      li.textContent = `Size:${result[2]}, Mines:${result[3]}, ${result[0]} s, ${result[1]} moves`;
      resultsEl.append(li);
    });
  }

  destroy() {
    this.stopTimer();
    this.canvas.removeEventListener('click', this.clickHandler);
    this.canvas.removeEventListener('contextmenu', this.contextHandler);
    this.checkThemeEl.removeEventListener('change', this.checkThemeHandler);
    this.canvas.remove();
    document.querySelector('.board').textContent = '';
  }
}

export default Board;
