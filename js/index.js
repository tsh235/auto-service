import {fetchData} from "./fetchData.js";

const form = document.querySelector('.form');
const formFieldsets = form.querySelectorAll('.form__fieldset');
const formBtnPrev = form.querySelector('.form__btn_prev');
const formBtnNext = form.querySelector('.form__btn_next');
const formBtnSubmit = form.querySelector('.form__btn_submit');
const formTime = form.querySelector('.form__time');
const formFieldsetType = form.querySelector('.form__fieldset_type');
const formFieldsetDate = form.querySelector('.form__fieldset_date');
const formFieldsetClient = form.querySelector('.form__fieldset_client');
const typeRadioWrapper = form.querySelector('.form__radio-wrapper_type');
const dayRadioWrapper = form.querySelector('.form__radio-wrapper_day');
const timeRadioWrapper = form.querySelector('.form__radio-wrapper_time');
const formMonthsWrapper = form.querySelector('.form__months');
const formInfoType = form.querySelector('.form__info_type');
const formInfoDate = form.querySelector('.form__info-date');

const currentMonth = new Intl.DateTimeFormat('ru-RU', {month: 'long'}).format(new Date());
let month = currentMonth;
let currentStep = 0;

const data = await fetchData();
const dataToWrite = {
  dataType: {},
  day: '',
  time: '',
};

const createRadioBtns = (wrapper, name, data) => {
  wrapper.textContent = '';
  data.forEach(item => {
    const radioDiv = document.createElement('div');
    radioDiv.className = 'radio';

    const radioInput = document.createElement('input');
    radioInput.className = 'radio__input';
    radioInput.type = 'radio';
    radioInput.name =  name;
    radioInput.id =  item.value;
    radioInput.value =  item.value;
    
    const radioLabel = document.createElement('label');
    radioLabel.className = 'radio__label btn';
    radioLabel.htmlFor = item.value;
    radioLabel.textContent = item.title;

    radioDiv.append(radioInput, radioLabel);
    wrapper.append(radioDiv);
  });
};

const allMonth = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

const showResultData = () => {
  const currentYear = new Date().getFullYear();
  const monthIndex = allMonth.findIndex(item => item === month);
  const dateString = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${dataToWrite.day.toString().padStart(2, '0')}T${dataToWrite.time}`

  formInfoDate.datetime = new Date(dateString).toISOString();
  formInfoType.textContent = dataToWrite.dataType.title;

  const dateObj = new Date(dateString);
  const formatedDate = dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });

  formInfoDate.innerHTML = `
    <span>${formatedDate}</span>
    <span>${dataToWrite.time}</span>
  `;
};

const updateFieldsetVisibillity = () => {
  for (let i = 0; i < formFieldsets.length; i++) {
    if (i === currentStep) {
      formFieldsets[i].classList.add('form__fieldset_active')
    } else {
      formFieldsets[i].classList.remove('form__fieldset_active')
    }
  }

  if (currentStep === 0) {
    formBtnPrev.style.display = 'none';
    formBtnNext.style.display = 'flex';
    formBtnSubmit.style.display = 'none';
  } else if (currentStep === formFieldsets.length - 1) {
    formBtnPrev.style.display = 'flex';
    formBtnNext.style.display = 'none';
    formBtnSubmit.style.display = 'flex';

    showResultData();
  } else {
    formBtnPrev.style.display = 'flex';
    formBtnNext.style.display = 'flex';
    formBtnSubmit.style.display = 'none';
  }
};

const createFormDay = (date) => {
  const objMonth = date.find(item => item.month === month);
  const days = Object.keys(objMonth.day);
  const typeData = days.map(item => ({
    value: item,
    title: item,
  }));
  createRadioBtns(dayRadioWrapper, 'day', typeData)
};

const createFormMonth = (months) => {
  formMonthsWrapper.textContent = '';
  const btnsMonth = months.map(item => {
    const btn = document.createElement('button');
    btn.className = 'form__btn-month';
    btn.type = 'button';
    btn.textContent = `${item[0].toUpperCase()}${item.substring(1).toLowerCase()}`;

    if (item === month) btn.classList.add('form__btn-month_active');

    return btn;
  })

  formMonthsWrapper.append(...btnsMonth);

  btnsMonth.forEach(btn => {
    btn.addEventListener('click', ({target}) => {
      if (target.classList.contains('form__btn-month_active')) {
        return;
      }

      btnsMonth.forEach(btn => {
        btn.classList.remove('form__btn-month_active');
      });

      target.classList.add('form__btn-month_active');

      month = target.textContent.toLowerCase();

      const date = data.find(item => item.type === dataToWrite.dataType.type).date;

      createFormDay(date);
    });
  });
};

const createFormTime = (date, day) => {
  const objMonth = date.find(item => item.month === month);
  const days = objMonth.day;
  const daysData = days[day].map(item => ({
    value: `${item}:00`,
    title: `${item}:00`,
  }));
  createRadioBtns(timeRadioWrapper, 'time', daysData);
  formTime.style.display = 'block';
};

const handleInputForm = ({currentTarget, target}) => {
  if (currentTarget.type.value && currentStep === 0) {
    formBtnNext.disabled = false;

    const typeObj = data.find(item => item.type === currentTarget.type.value);

    dataToWrite.dataType.type = typeObj.type;
    dataToWrite.dataType.title = typeObj.title;

    const date = typeObj.date;
    const months = date.map(item => item.month);

    createFormMonth(months);
    createFormDay(date);
  }

  if (currentStep === 1) {
    if (currentTarget.day.value && target.name === 'day') {
      dataToWrite.day = currentTarget.day.value;
      const date = data.find(item => item.type === dataToWrite.dataType.type).date;
      createFormTime(date, dataToWrite.day);
    }

    if (currentTarget.day.value && currentTarget.time.value && target.name === 'time') {
      dataToWrite.time = currentTarget.time.value;
      formBtnNext.disabled = false;
    } else {
      formBtnNext.disabled = true;
    }
  }

  if (currentStep === formFieldsets.length - 1) {
    const inputs = formFieldsetClient.querySelectorAll('.form__input');
    let allFilled = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        allFilled = false;
      }
    });

    formBtnSubmit.disabled = !allFilled;
  }
};

const renderTypeFieldset = () => {
  const typeData = data.map(item => ({
    value: item.type,
    title: item.title,
  }));

  createRadioBtns(typeRadioWrapper, 'type', typeData);
}

const init = () => {
  formBtnNext.disabled = true;
  formBtnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateFieldsetVisibillity();
      formBtnNext.disabled = false;
    }
  });

  formBtnNext.addEventListener('click', () => {
    if (currentStep < formFieldsets.length - 1) {
      currentStep += 1;
      updateFieldsetVisibillity();
      formBtnNext.disabled = true;
      formBtnSubmit.disabled = true;
    }
  });
  
  formBtnSubmit.addEventListener('click', async e => {
    e.preventDefault();

    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData);
    formDataObject.month = month;
    
    try {
      const response = await fetch('https://succinct-reliable-heron.glitch.me/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify(formDataObject),
      });

      if (response.ok) {
        form.innerHTML = `<h2>Данные успешно отправлены! Мастер свяжется с вами в ближайшее время</h2>`;
      } else {
        throw new Error(`Ошибка при отправке данных: ${response.status}`);
      }
    } catch (error) {
      console.error(`Ошибка при отправке запроса: ${error}`);
    }
  });

  form.addEventListener('input', handleInputForm);
  
  updateFieldsetVisibillity();
  renderTypeFieldset();
};

init();
