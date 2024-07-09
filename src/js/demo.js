let currentLevelPos = 0;
let currentTapPoints = 15;

const currentProgress = {};

Object.defineProperty(currentProgress, 'scale', {
  set(newValue) {
    const scaleEl = document.querySelector('.progress-bar-scale');
    console.log(scaleEl);
    if (!scaleEl) {
      throw new Error('Нет элемента .progress-bar-scale');
    }
    scaleEl.style.width = `${newValue}%`;
  },
});

Object.defineProperty(currentProgress, 'level', {
  set(newValue) {
    const levelEl = document.querySelector('.level-name');
    if (!levelEl) {
      throw new Error('Нет элемента .level-name');
    }
    levelEl.textContent = `${newValue}`;
  },
});

const calcProgressBar = () => {
  const level = levels[currentLevelPos];
  const percentage = (totalPoints.getValue() / level.points) * 100;

  if (percentage > 99.99) {
    const newLevelPos = currentLevelPos + 1;

    const levelEl = document.querySelector('.level-number');
    if (!levelEl) {
      throw new Error('Нет элемента .level-number');
    }

    if (!levels[newLevelPos]) {
      currentProgress.scale = 0;
      currentProgress.level = levels[0].name;
      totalPoints.reset();
      window.alert('Вы такой сильный, вау!');
    } else {
      currentLevelPos = newLevelPos;
      currentProgress.level = levels[newLevelPos].name;
      const newPercentage =
        (totalPoints.getValue() / levels[newLevelPos].points) * 100;
      currentProgress.scale = newPercentage;
    }

    return;
  }
  currentProgress.scale = percentage;
};

let totalPoints;

function assignResetBtnListeners() {
  const totalCounter = document.getElementById('total');
  if (!totalCounter) {
    throw new Error('Нет элемента total');
  }
  refs.totalCounter = totalCounter;

  totalPoints = new TotalPoints();

  // set span and progressbar default value
  refs.totalCounter.innerHTML = totalPoints.getValue();
  calcProgressBar();

  totalPoints.onValueChange((newValue) => {
    console.log(refs.totalCounter);
    refs.totalCounter.innerHTML = newValue;
  });

  const mainEl = document.getElementsByTagName('main')[0];
  if (!mainEl) {
    throw new Error('Нет элемента main');
  }
  mainEl.addEventListener('click', (ev) => {
    const { clientX, clientY } = ev;

    const newPointsEl = document.createElement('span');
    newPointsEl.textContent = `+${currentTapPoints}`;
    newPointsEl.style.left = `${clientX}px`;
    newPointsEl.style.top = `${clientY - 20}px`;
    newPointsEl.className = 'new-points';
    newPointsEl.onanimationend = (evt) => {
      if (evt.currentTarget) {
        evt.currentTarget.parentNode.removeChild(evt.currentTarget);
      }
    };
    totalPoints.increment(15);
    calcProgressBar();
    mainEl.appendChild(newPointsEl);
  });

  const resetBtn = document.getElementById('reset-btn');
  if (!resetBtn) {
    throw new Error('Нет элемента resetBtn');
  }
  refs.resetBtn = resetBtn;
  resetBtn.addEventListener('click', (evt) => {
    evt.stopPropagation();
    // eslint-disable-next-line no-alert
    const isConfirmed = window.confirm('Вы действительно хотите начать заново');

    if (isConfirmed) {
      totalPoints.reset();
    }
  });
}

const refs = {
  resetBtn: null,
  main: null,
};

const levels = [
  {
    name: 'Салага',
    points: 500,
  },
  {
    name: 'Бывалый',
    points: 1000,
  },
];

class TotalPoints {
  #value = 0;
  #subscribers = [];

  // set default value
  constructor() {
    // get saved score from localStorage
    const savedScore = parseInt(localStorage.getItem('score'));

    // check if it was not saved => assign it to 0
    if (savedScore === NaN) {
      savedScore = 0;
    }

    this.#value = savedScore;
  }

  getValue() {
    return this.#value;
  }

  increment(nextValue) {
    this.#value += nextValue;

    // this will save current score to localStorage
    localStorage.setItem('score', this.getValue().toString());

    this.#invkokeSubscribers(this.#value);
  }

  #invkokeSubscribers(passValue) {
    for (let index = 0; index < this.#subscribers.length; index += 1) {
      const item = this.#subscribers[index];
      item(passValue);
    }
  }

  reset() {
    this.#value = 0;
    this.#invkokeSubscribers(this.#value);
    localStorage.setItem('score', this.getValue().toString());
  }

  onValueChange(callback) {
    this.#subscribers.push(callback);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  assignResetBtnListeners();
  currentProgress.level = levels[currentLevelPos].name;
  currentProgress.level = levels[currentLevelPos].name;
});
