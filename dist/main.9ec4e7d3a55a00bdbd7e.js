/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/board.js":
/*!**********************!*\
  !*** ./src/board.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _cell_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cell.js */ "./src/cell.js");

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
    this.clickHandler = event => {
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
    this.contextHandler = event => {
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
        this.cells[i][j] = new _cell_js__WEBPACK_IMPORTED_MODULE_0__["default"](i, j, this);
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
    this.cells.forEach(row => {
      flagged += row.filter(cell => cell.flagged).length;
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
      win: this.winSound
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
    this.cells.forEach(rowArr => {
      rowArr.forEach(cell => {
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
    this.savedResults.reverse().forEach(result => {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Board);

/***/ }),

/***/ "./src/cell.js":
/*!*********************!*\
  !*** ./src/cell.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
    const {
      cellSize,
      ctx
    } = this.board;
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
    const {
      cellSize
    } = this.board;
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
    const {
      cellSize
    } = this.board;
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
    ctx.fillText(this.neighborBombCount, this.col * this.board.cellSize + this.board.cellSize / 2, this.row * this.board.cellSize + this.board.cellSize / 2 + 2);
  }

  // Функция, которая открывает ячейку
  reveal() {
    const {
      ctx
    } = this.board;
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
      adj.forEach(cell => {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Cell);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_index_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scss/index.scss */ "./src/scss/index.scss");
/* harmony import */ var _board_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./board.js */ "./src/board.js");


const createCheckbox = name => {
  // Создание элементов разметки checkbox
  const checkboxWrapper = document.createElement('p');
  checkboxWrapper.className = 'switch__title';
  checkboxWrapper.textContent = `${name}`;
  const checkboxInput = document.createElement('input');
  checkboxInput.type = 'checkbox';
  checkboxInput.className = 'checkbox';
  checkboxInput.id = `check-${name}`;
  checkboxInput.checked = true; // Установка флага "checked"

  const checkboxLabel = document.createElement('label');
  checkboxLabel.setAttribute('for', `check-${name}`);
  const container = document.createElement('div');
  container.classList.add('settings__switch');
  container.classList.add('switch');
  container.append(checkboxWrapper, checkboxInput, checkboxLabel);
  return container;
};
const createWrapper = () => {
  document.body.textContent = '';
  // создаем wrapper и общие элементы управления
  const wrapper = document.createElement('div');
  const field = document.createElement('div');
  const board = document.createElement('div');
  const heading = document.createElement('h2');
  const footer = document.createElement('footer');
  const gitLink = document.createElement('a');
  const rsschoolLink = document.createElement('a');
  const settings = document.createElement('div');
  const diffic = document.createElement('div');
  const statistics = document.createElement('div');
  const history = document.createElement('div');
  const results = document.createElement('ul');
  const info = document.createElement('div');
  const timerDisplay = document.createElement('h3');
  const mineDisplay = document.createElement('h3');
  const movesDisplay = document.createElement('h3');
  const historyTitle = document.createElement('h4');
  const diffTitle = document.createElement('h4');
  const restart = document.createElement('button');

  // Создаем select-size
  const selectSize = document.createElement('select');
  selectSize.classList.add('select-size');
  // Создаем и добавляем options
  const optionsSize = [{
    value: 10,
    text: '10x10'
  }, {
    value: 15,
    text: '15x15'
  }, {
    value: 20,
    text: '20x20'
  }];
  optionsSize.forEach(option => {
    const selectOption = document.createElement('option');
    selectOption.value = option.value;
    selectOption.text = option.text;
    selectSize.appendChild(selectOption);
  });
  // Создаем select-mines
  const selectMines = document.createElement('select');
  selectMines.classList.add('select-mines');

  // Создаем и добавляем options от 10 до 99 мин
  const optionsMines = [];
  for (let i = 10; i <= 99; i++) {
    optionsMines.push({
      value: i,
      text: String(i)
    });
  }
  optionsMines.forEach(option => {
    const selectOption = document.createElement('option');
    selectOption.value = option.value;
    selectOption.text = option.text;
    selectMines.appendChild(selectOption);
  });
  heading.textContent = 'Minesweeper';
  timerDisplay.textContent = 'Time: 0';
  mineDisplay.textContent = 'Mines:';
  movesDisplay.textContent = 'Moves: 0';
  historyTitle.textContent = 'Last 10 results:';
  diffTitle.textContent = 'Size/Mines';
  restart.textContent = 'New game';
  const gitLinkText = document.createTextNode('Github');
  gitLink.appendChild(gitLinkText);
  gitLink.title = 'Github';
  gitLink.href = 'https://github.com/dstrizhakov';
  gitLink.target = '_blank';
  const RssLinkText = document.createTextNode('Rsschool');
  rsschoolLink.appendChild(RssLinkText);
  rsschoolLink.title = 'Rsschool';
  rsschoolLink.href = 'https://rs.school/js/';
  rsschoolLink.target = '_blank';
  wrapper.classList.add('wrapper');
  footer.classList.add('footer');
  field.classList.add('field');
  board.classList.add('board');
  info.classList.add('info');
  settings.classList.add('settings');
  diffic.classList.add('settings__diffic');
  statistics.classList.add('statistics');
  history.classList.add('history');
  results.classList.add('results');
  timerDisplay.classList.add('timer');
  mineDisplay.classList.add('mines');
  movesDisplay.classList.add('moves');
  restart.classList.add('restart');
  statistics.append(timerDisplay, movesDisplay, mineDisplay);
  history.append(historyTitle, results);
  diffic.append(diffTitle, selectSize, selectMines);
  // diffic.append(selectMines);

  const sounds = createCheckbox('sounds');
  const theme = createCheckbox('theme');
  const switchers = document.createElement('div');
  switchers.classList.add('settings__switchers');
  switchers.append(sounds, theme);
  settings.append(diffic, switchers, restart);
  field.append(board, info);
  info.append(statistics, history, settings);
  footer.append(gitLink, rsschoolLink);
  wrapper.append(heading, field, footer);
  document.body.append(wrapper);
};
// создаем разметку, все кроме поля игры
createWrapper();

// Текущий вариант сложности игры
const variant = {
  size: 10,
  mines: 10,
  cSize: 46
};

// стартуем minesweeper сразу
const minesweeper = new _board_js__WEBPACK_IMPORTED_MODULE_1__["default"](variant.size, variant.mines, variant.cSize);
minesweeper.initBoard();
const minesDisplay = document.querySelector('.mines');
minesDisplay.textContent = `Mines: ${variant.mines}`;
const restartButton = document.querySelector('.restart');
let currentMinesweeper = minesweeper;
const selectSize = document.querySelector('.select-size');

// при изменении размеров поля
selectSize.addEventListener('change', () => {
  variant.size = selectSize.value;
  if (selectSize.value === '10') {
    variant.cSize = 46;
  } else if (selectSize.value === '15') {
    variant.cSize = 30.6666;
  } else if (selectSize.value === '20') {
    variant.cSize = 23;
  }
});
const selectMines = document.querySelector('.select-mines');
// при изменении количестка мин
selectMines.addEventListener('change', () => {
  variant.mines = selectMines.value;
});

// при нажатии кнопки Restart game
restartButton.addEventListener('click', () => {
  if (currentMinesweeper) {
    currentMinesweeper.destroy();
  }
  const newMinesweeper = new _board_js__WEBPACK_IMPORTED_MODULE_1__["default"](variant.size, variant.mines, variant.cSize);
  newMinesweeper.initBoard();
  const timerDisplay = document.querySelector('.timer');
  timerDisplay.textContent = 'Time: 0';
  // const minesDisplay = document.querySelector('.mines');
  minesDisplay.textContent = `Mines: ${variant.mines}`;
  currentMinesweeper = newMinesweeper;
});
const checkThemeEl = document.getElementById('check-theme');
checkThemeEl.addEventListener('change', () => {
  document.body.classList.toggle('theme-body');
  document.querySelector('footer').classList.toggle('theme-footer');
  document.querySelector('.info').classList.toggle('theme-info');
  document.querySelector('.field').classList.toggle('theme-field');
});

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./node_modules/sass-loader/dist/cjs.js!./src/scss/index.scss":
/*!********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./node_modules/sass-loader/dist/cjs.js!./src/scss/index.scss ***!
  \********************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Inter:100,100italic,300,300italic,regular,italic,500,500italic,700,700italic,900,900italic);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body {\n  font-family: \"Inter\", sans-serif;\n  background-color: rgb(0, 24, 36);\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\nh4 {\n  margin: 0;\n}\n\n.wrapper h2 {\n  text-align: center;\n}\n.wrapper .field {\n  margin: 3px;\n  color: black;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  box-shadow: 0px 0px 1000px 2px rgba(252, 252, 252, 0.8);\n}\n.wrapper .field .board {\n  position: relative;\n  margin: 10px;\n}\n.wrapper .field .board canvas {\n  border: 3px inset rgb(153, 45, 45);\n  border-radius: 10px;\n}\n.wrapper .field .board .loose {\n  position: absolute;\n  top: 45%;\n  left: 50%;\n  font-size: 20px;\n  width: 300px;\n  transform: translate(-50%, -50%);\n  background-color: rgb(172, 12, 12);\n  color: white;\n  opacity: 0.8;\n  padding: 50px;\n  border-radius: 10px;\n  box-shadow: 0px 0px 20px 0px rgb(0, 0, 0);\n}\n.wrapper .field .board .win {\n  position: absolute;\n  font-size: 20px;\n  width: 300px;\n  top: 45%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background-color: rgb(12, 172, 47);\n  color: white;\n  opacity: 0.8;\n  padding: 50px;\n  border-radius: 10px;\n  box-shadow: 0px 0px 20px 0px rgb(0, 0, 0);\n}\n.wrapper .field .info {\n  flex: 1 1 auto;\n  display: flex;\n  gap: 10px;\n  flex-direction: column;\n  height: 460px;\n  min-width: 200px;\n  margin: 10px;\n}\n.wrapper .field .info .statistics {\n  min-width: 320px;\n  display: flex;\n  justify-content: space-between;\n  border-radius: 4px;\n  background-color: #ddd;\n  padding: 10px;\n}\n.wrapper .field .info .statistics h3 {\n  flex: 0 0 100px;\n  font-size: 16px;\n  margin: 4px 0;\n}\n.wrapper .field .info .history {\n  flex: 1 1 auto;\n  border-radius: 4px;\n  background-color: #ddd;\n  padding: 10px;\n}\n.wrapper .field .info .history .results {\n  margin: 5px;\n}\n.wrapper .field .info .settings {\n  border-radius: 4px;\n  background-color: #ddd;\n  padding: 10px;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  gap: 8px;\n}\n.wrapper .field .info .settings__diffic {\n  align-self: center;\n  display: flex;\n  align-items: center;\n}\n.wrapper .field .info .settings__diffic h4 {\n  margin-right: 10px;\n}\n.wrapper .field .info .settings__diffic .select-size,\n.wrapper .field .info .settings__diffic .select-mines {\n  margin-right: 10px;\n  padding: 4px;\n  font-size: 14px;\n  border: 1px solid teal;\n  border-radius: 4px;\n}\n.wrapper .field .info .settings__switchers {\n  align-self: center;\n  display: flex;\n}\n.wrapper .field .info .settings__switch {\n  margin-right: 20px;\n}\n.wrapper .field .info .settings .restart {\n  cursor: pointer;\n  padding: 10px;\n  border: 1px solid teal;\n  border-radius: 4px;\n  font-size: 16px;\n  font-weight: 700;\n  transition: all 0.3s ease 0s;\n}\n.wrapper .field .info .settings .restart:hover {\n  background-color: teal;\n  color: white;\n}\n\nfooter {\n  margin: 15px 30px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\nfooter a {\n  font-size: 18px;\n  font-weight: 700;\n  color: #ddd;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: all 0.3s ease 0s;\n}\nfooter a:hover {\n  color: white;\n}\n\n.checkbox {\n  position: relative;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.checkbox + label {\n  position: relative;\n  padding: 0 0 0 50px;\n  cursor: pointer;\n}\n\n.checkbox + label::before {\n  content: \"\";\n  position: absolute;\n  top: -4px;\n  left: 0;\n  width: 50px;\n  height: 26px;\n  border-radius: 13px;\n  background-color: #aaaaaa;\n  box-shadow: inset 1 2px 3px rgba(0, 0, 0, 0.3);\n  transition: 0.2s;\n}\n\n.checkbox + label::after {\n  content: \"\";\n  position: absolute;\n  top: -2px;\n  left: 2px;\n  width: 22px;\n  height: 22px;\n  border-radius: 10px;\n  background-color: #ffffff;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n  transition: 0.2s;\n}\n\n.checkbox:checked + label::after {\n  left: 26px;\n}\n\n.checkbox:checked + label::before {\n  background-color: #138a44;\n}\n\n.switch {\n  padding: 8px 0;\n  display: flex;\n  border-bottom: 1px solid #dedada;\n}\n.switch p {\n  text-transform: capitalize;\n  margin: 0;\n  font-weight: 700;\n}\n\n.theme-body {\n  background-color: aliceblue;\n  color: teal;\n}\n\n.theme-footer a {\n  color: teal;\n}\n.theme-footer a:hover {\n  color: black;\n}\n\n.theme-info .statistics {\n  background-color: black;\n}\n\n.theme-field {\n  background-color: teal;\n  box-shadow: 0px 0px 1000px 2px rgba(0, 0, 0, 0.8);\n}", "",{"version":3,"sources":["webpack://./src/scss/index.scss"],"names":[],"mappings":"AAEA;EACE,gCAAA;EACA,gCAAA;EACA,YAAA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;AAAF;;AAGA;EACE,SAAA;AAAF;;AAIE;EACE,kBAAA;AADJ;AAGE;EACE,WAAA;EACA,YAAA;EACA,aAAA;EACA,eAAA;EACA,mBAAA;EACA,uBAAA;EACA,kBAAA;EACA,uDAAA;AADJ;AAEI;EACE,kBAAA;EACA,YAAA;AAAN;AACM;EACE,kCAAA;EACA,mBAAA;AACR;AACM;EACE,kBAAA;EACA,QAAA;EACA,SAAA;EACA,eAAA;EACA,YAAA;EACA,gCAAA;EACA,kCAAA;EACA,YAAA;EACA,YAAA;EACA,aAAA;EACA,mBAAA;EACA,yCAAA;AACR;AACM;EACE,kBAAA;EACA,eAAA;EACA,YAAA;EACA,QAAA;EACA,SAAA;EACA,gCAAA;EACA,kCAAA;EACA,YAAA;EACA,YAAA;EACA,aAAA;EACA,mBAAA;EACA,yCAAA;AACR;AAEI;EACE,cAAA;EACA,aAAA;EACA,SAAA;EACA,sBAAA;EACA,aAAA;EACA,gBAAA;EAqEA,YAAA;AApEN;AAAM;EACE,gBAAA;EACA,aAAA;EACA,8BAAA;EACA,kBAAA;EACA,sBAAA;EACA,aAAA;AAER;AAAQ;EACE,eAAA;EACA,eAAA;EACA,aAAA;AAEV;AACM;EACE,cAAA;EACA,kBAAA;EACA,sBAAA;EACA,aAAA;AACR;AAAQ;EACE,WAAA;AAEV;AACM;EACE,kBAAA;EACA,sBAAA;EACA,aAAA;EACA,aAAA;EACA,sBAAA;EACA,8BAAA;EACA,QAAA;AACR;AAAQ;EACE,kBAAA;EACA,aAAA;EACA,mBAAA;AAEV;AADU;EACE,kBAAA;AAGZ;AADU;;EAEE,kBAAA;EACA,YAAA;EACA,eAAA;EACA,sBAAA;EACA,kBAAA;AAGZ;AAAQ;EACE,kBAAA;EACA,aAAA;AAEV;AAAQ;EACE,kBAAA;AAEV;AAAQ;EACE,eAAA;EACA,aAAA;EACA,sBAAA;EACA,kBAAA;EACA,eAAA;EACA,gBAAA;EACA,4BAAA;AAEV;AADU;EACE,sBAAA;EACA,YAAA;AAGZ;;AAMA;EACE,iBAAA;EACA,aAAA;EACA,8BAAA;EACA,mBAAA;AAHF;AAIE;EACE,eAAA;EACA,gBAAA;EACA,WAAA;EACA,6BAAA;EAAA,qBAAA;EACA,4BAAA;AAFJ;AAGI;EACE,YAAA;AADN;;AAMA;EACE,kBAAA;EACA,UAAA;EACA,QAAA;EACA,SAAA;AAHF;;AAKA;EACE,kBAAA;EACA,mBAAA;EACA,eAAA;AAFF;;AAIA;EACE,WAAA;EACA,kBAAA;EACA,SAAA;EACA,OAAA;EACA,WAAA;EACA,YAAA;EACA,mBAAA;EACA,yBAAA;EACA,8CAAA;EACA,gBAAA;AADF;;AAGA;EACE,WAAA;EACA,kBAAA;EACA,SAAA;EACA,SAAA;EACA,WAAA;EACA,YAAA;EACA,mBAAA;EACA,yBAAA;EACA,wCAAA;EACA,gBAAA;AAAF;;AAEA;EACE,UAAA;AACF;;AACA;EACE,yBAAA;AAEF;;AACA;EACE,cAAA;EACA,aAAA;EACA,gCAAA;AAEF;AADE;EACE,0BAAA;EACA,SAAA;EACA,gBAAA;AAGJ;;AACA;EACE,2BAAA;EACA,WAAA;AAEF;;AACE;EACE,WAAA;AAEJ;AADI;EACE,YAAA;AAGN;;AAGE;EACE,uBAAA;AAAJ;;AAGA;EACE,sBAAA;EACA,iDAAA;AAAF","sourcesContent":["@import url(https://fonts.googleapis.com/css?family=Inter:100,100italic,300,300italic,regular,italic,500,500italic,700,700italic,900,900italic);\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background-color: rgb(0, 24, 36);\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\nh4 {\n  margin: 0;\n}\n\n.wrapper {\n  & h2 {\n    text-align: center;\n  }\n  & .field {\n    margin: 3px;\n    color: black;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    justify-content: center;\n    border-radius: 4px;\n    box-shadow: 0px 0px 1000px 2px rgba(252, 252, 252, 0.8);\n    & .board {\n      position: relative;\n      margin: 10px;\n      & canvas {\n        border: 3px inset rgb(153, 45, 45);\n        border-radius: 10px;\n      }\n      & .loose {\n        position: absolute;\n        top: 45%;\n        left: 50%;\n        font-size: 20px;\n        width: 300px;\n        transform: translate(-50%, -50%);\n        background-color: rgb(172, 12, 12);\n        color: white;\n        opacity: 0.8;\n        padding: 50px;\n        border-radius: 10px;\n        box-shadow: 0px 0px 20px 0px rgb(0, 0, 0);\n      }\n      & .win {\n        position: absolute;\n        font-size: 20px;\n        width: 300px;\n        top: 45%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        background-color: rgb(12, 172, 47);\n        color: white;\n        opacity: 0.8;\n        padding: 50px;\n        border-radius: 10px;\n        box-shadow: 0px 0px 20px 0px rgb(0, 0, 0);\n      }\n    }\n    & .info {\n      flex: 1 1 auto;\n      display: flex;\n      gap: 10px;\n      flex-direction: column;\n      height: 460px;\n      min-width: 200px;\n      & .statistics {\n        min-width: 320px;\n        display: flex;\n        justify-content: space-between;\n        border-radius: 4px;\n        background-color: #ddd;\n        padding: 10px;\n\n        & h3 {\n          flex: 0 0 100px;\n          font-size: 16px;\n          margin: 4px 0;\n        }\n      }\n      & .history {\n        flex: 1 1 auto;\n        border-radius: 4px;\n        background-color: #ddd;\n        padding: 10px;\n        & .results {\n          margin: 5px;\n        }\n      }\n      & .settings {\n        border-radius: 4px;\n        background-color: #ddd;\n        padding: 10px;\n        display: flex;\n        flex-direction: column;\n        justify-content: space-between;\n        gap: 8px;\n        &__diffic {\n          align-self: center;\n          display: flex;\n          align-items: center;\n          & h4 {\n            margin-right: 10px;\n          }\n          & .select-size,\n          .select-mines {\n            margin-right: 10px;\n            padding: 4px;\n            font-size: 14px;\n            border: 1px solid teal;\n            border-radius: 4px;\n          }\n        }\n        &__switchers {\n          align-self: center;\n          display: flex;\n        }\n        &__switch {\n          margin-right: 20px;\n        }\n        & .restart {\n          cursor: pointer;\n          padding: 10px;\n          border: 1px solid teal;\n          border-radius: 4px;\n          font-size: 16px;\n          font-weight: 700;\n          transition: all 0.3s ease 0s;\n          &:hover {\n            background-color: teal;\n            color: white;\n          }\n        }\n      }\n      margin: 10px;\n    }\n  }\n}\n\nfooter {\n  margin: 15px 30px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  & a {\n    font-size: 18px;\n    font-weight: 700;\n    color: #ddd;\n    text-decoration: none;\n    transition: all 0.3s ease 0s;\n    &:hover {\n      color: white;\n    }\n  }\n}\n\n.checkbox {\n  position: relative;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.checkbox + label {\n  position: relative;\n  padding: 0 0 0 50px;\n  cursor: pointer;\n}\n.checkbox + label::before {\n  content: '';\n  position: absolute;\n  top: -4px;\n  left: 0;\n  width: 50px;\n  height: 26px;\n  border-radius: 13px;\n  background-color: #aaaaaa;\n  box-shadow: inset 1 2px 3px rgba(0, 0, 0, 0.3);\n  transition: 0.2s;\n}\n.checkbox + label::after {\n  content: '';\n  position: absolute;\n  top: -2px;\n  left: 2px;\n  width: 22px;\n  height: 22px;\n  border-radius: 10px;\n  background-color: #ffffff;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n  transition: 0.2s;\n}\n.checkbox:checked + label::after {\n  left: 26px;\n}\n.checkbox:checked + label::before {\n  background-color: #138a44;\n}\n\n.switch {\n  padding: 8px 0;\n  display: flex;\n  border-bottom: 1px solid #dedada;\n  & p {\n    text-transform: capitalize;\n    margin: 0;\n    font-weight: 700;\n  }\n}\n\n.theme-body {\n  background-color: aliceblue;\n  color: teal;\n}\n.theme-footer {\n  & a {\n    color: teal;\n    &:hover {\n      color: black;\n    }\n  }\n}\n\n.theme-info {\n  & .statistics {\n    background-color: black;\n  }\n}\n.theme-field {\n  background-color: teal;\n  box-shadow: 0px 0px 1000px 2px rgba(0, 0, 0, 0.8);\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/scss/index.scss":
/*!*****************************!*\
  !*** ./src/scss/index.scss ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!../../node_modules/sass-loader/dist/cjs.js!./index.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./node_modules/sass-loader/dist/cjs.js!./src/scss/index.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkminesweeper"] = self["webpackChunkminesweeper"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["vendors-node_modules_babel_polyfill_lib_index_js-node_modules_css-loader_dist_runtime_api_js--b3e1e9"], () => (__webpack_require__("./node_modules/@babel/polyfill/lib/index.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_babel_polyfill_lib_index_js-node_modules_css-loader_dist_runtime_api_js--b3e1e9"], () => (__webpack_require__("./src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.9ec4e7d3a55a00bdbd7e.js.map