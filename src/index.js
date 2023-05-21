import './scss/index.scss';

import Board from './board.js';

const createCheckbox = (name) => {
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
  const optionsSize = [
    { value: 10, text: '10x10' },
    { value: 15, text: '15x15' },
    { value: 20, text: '20x20' },
  ];
  optionsSize.forEach((option) => {
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
    optionsMines.push({ value: i, text: String(i) });
  }

  optionsMines.forEach((option) => {
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
  cSize: 46,
};

// стартуем minesweeper сразу
const minesweeper = new Board(variant.size, variant.mines, variant.cSize);
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
  const newMinesweeper = new Board(variant.size, variant.mines, variant.cSize);
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
