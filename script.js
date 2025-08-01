//js обновленный
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker зарегистрирован:', reg))
      .catch(err => console.error('Ошибка регистрации Service Worker:', err));
  });
}

const airports = {
  // ... (ваш объект airports остается без изменений)
};

const CACHE_DURATION = 20 * 60 * 1000; // 20 минут
let isAdditionalFlight = false;
let currentDutyGroup = null;

function fetchFlightInfo(flightNumber, date) {
  return new Promise((resolve, reject) => {
    // Явное формирование URL с проверкой параметров
    if (!flightNumber || !date) {
      console.error("Параметры flightNumber и date обязательны");
      resolve(null);
      return;
    }
    const encodedFlightNumber = encodeURIComponent(flightNumber);
    const encodedDate = encodeURIComponent(date);
    const proxyUrl = `https://cocsr.na4u.ru/main.php?flightNumber=${encodedFlightNumber}&date=${encodedDate}`;
    console.log("Отправляемый URL:", proxyUrl); // Для отладки

    fetch(proxyUrl, {
      method: 'GET', // Явно указываем метод
    })
    .then(response => {
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data || !data.data || !data.data.routes || data.error) {
        console.error("Недостаточно данных или ошибка API:", data?.error || "Неизвестная ошибка");
        resolve(null);
      } else {
        const cacheKey = `flightData_${flightNumber}_${date}`;
        const cacheData = { data, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        resolve(data);
      }
    })
    .catch(error => {
      console.error("Ошибка при запросе:", error);
      resolve(null);
    });
  });
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function showLoadingSpinner(departureAirport, arrivalAirport) {
  departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
  arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
}

function displayFlightInfo(flightData, departureAirport, arrivalAirport, date) {
  if (!flightData || !flightData.data || !flightData.data.routes || flightData.data.routes.length === 0) {
    departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    return null;
  }
  const flight = flightData.data.routes[0];
  const leg = flight.routeType === 'MultiLeg' && flight.legs ? flight.legs[0] : flight.leg || flight;
  if (!leg || !leg.departure || !leg.departure.times || !leg.arrival || !leg.arrival.times) {
    departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    return null;
  }
  const departureTimeStr = leg.departure.times.scheduledDeparture?.localTime || leg.departure.times.estimatedBlockOff?.localTime;
  const arrivalTimeStr = leg.arrival.times.scheduledArrival?.localTime || leg.arrival.times.estimatedBlockOn?.localTime;
  const aircraftType = leg.equipment?.aircraft?.scheduled?.type || 'N/A';
  const flyingTime = flight.flyingTime || 'N/A';
  const flightDate = new Date(date);
  const [depHours, depMinutes] = departureTimeStr.split(':').map(Number);
  const departureDateTime = new Date(flightDate);
  departureDateTime.setHours(depHours, depMinutes, 0, 0);

  const depIata = leg.departure.scheduled.airportCode || 'N/A';
  const arrIata = leg.arrival.scheduled.airportCode || 'N/A';
  const depInfo = airports[depIata] || `${depIata} - Неизвестно`;
  const arrInfo = airports[arrIata] || `${arrIata} - Неизвестно`;

  departureAirport.innerHTML = `<div class="airport-code">${depIata}</div><div class="airport-name">${depInfo.split(' - ')[1] || 'Неизвестно'}</div>`;
  arrivalAirport.innerHTML = `<div class="airport-code">${arrIata}</div><div class="airport-name">${arrInfo.split(' - ')[1] || 'Неизвестно'}</div>`;

  const flightTimeDisplay = document.getElementById("flight-time-display");
  const spinner = document.getElementById("flight-time-spinner");
  if (spinner) spinner.classList.add("hidden");
  if (flightTimeDisplay) flightTimeDisplay.textContent = `${departureDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const createDutyBtn = document.getElementById('create-duty-btn');
  if (createDutyBtn) createDutyBtn.disabled = false;

  return { departureDateTime, arrivalTimeStr, depIata, arrIata, aircraftType, flyingTime };
}

async function handleFlightInfoUpdate(date, flightNumberFull, departureAirport, arrivalAirport) {
  try {
    if (!date || !flightNumberFull || !flightNumberFull.match(/^[A-Z]{2}\d{3,5}$/)) {
      departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
      arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
      return null;
    }
    showLoadingSpinner(departureAirport, arrivalAirport);
    const spinner = document.getElementById("flight-time-spinner");
    const flightTimeDisplay = document.getElementById("flight-time-display");
    if (spinner) spinner.classList.remove("hidden");
    if (flightTimeDisplay) flightTimeDisplay.textContent = '';

    const cacheKey = `flightData_${flightNumberFull}_${date}`;
    const cachedData = localStorage.getItem(cacheKey);
    let flightData = null;
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const currentTime = Date.now();
      if (currentTime - parsedData.timestamp < CACHE_DURATION && parsedData.data && parsedData.data.routes) {
        flightData = parsedData.data;
      } else {
        flightData = await fetchFlightInfo(flightNumberFull, date);
      }
    } else {
      flightData = await fetchFlightInfo(flightNumberFull, date);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return displayFlightInfo(flightData, departureAirport, arrivalAirport, date);
  } catch (error) {
    console.error("Ошибка в handleFlightInfoUpdate:", error);
    departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    return null;
  }
}

function createFlightBlock(departureDateTime, arrivalTimeStr, depIata, arrIata, aircraftType, flightNumberFull, date, flyingTime) {
  const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayName = daysShort[departureDateTime.getDay()];
  const formattedDate = departureDateTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const departureTime = departureDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = arrivalTimeStr;
  const arrFormattedDate = new Date(departureDateTime.getTime()).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const arrDayName = daysShort[new Date(departureDateTime.getTime()).getDay()];
  const depCity = airports[depIata]?.split(' - ')[1]?.split('/')[0] || depIata;
  const arrCity = airports[arrIata]?.split(' - ')[1]?.split('/')[0] || arrIata;

  const flightBlock = document.createElement('div');
  flightBlock.className = 'flight-block';
  flightBlock.innerHTML = `
    <div class="flight-card" data-flight-number="${flightNumberFull}" data-date="${date}">
      <div class="flight-column">
        <div class="flight-date-row">
          <span>${formattedDate}, ${dayName}</span>
          <span class="iata-code">${depIata}</span>
        </div>
        <div class="flight-time-row">
          <span class="flight-time">${departureTime}</span>
          <span class="city">${depCity}</span>
        </div>
      </div>
      <div class="flight-icon">✈</div>
      <div class="flight-column">
        <div class="flight-date-row">
          <span>${arrFormattedDate}, ${arrDayName}</span>
          <span class="iata-code">${arrIata}</span>
        </div>
        <div class="flight-time-row">
          <span class="flight-time">${arrivalTime}</span>
          <span class="city">${arrCity}</span>
        </div>
      </div>
      <div class="flight-info-row">
        <span>${flightNumberFull}</span>
        <span>${flyingTime || 'N/A'}</span>
        <span>${aircraftType}</span>
      </div>
    </div>
  `;

  const dashboard = document.querySelector('.dashboard');
  if (!currentDutyGroup) {
    currentDutyGroup = document.createElement('div');
    currentDutyGroup.className = 'duty-group visible';
    currentDutyGroup.setAttribute('data-duty-id', Date.now());
    const existingFlightBlocks = document.querySelectorAll('.flight-block, .duty-group');
    if (existingFlightBlocks.length > 0) {
      existingFlightBlocks[existingFlightBlocks.length - 1].insertAdjacentElement('afterend', currentDutyGroup);
    } else {
      const header = document.querySelector('.header');
      if (header) {
        header.insertAdjacentElement('afterend', currentDutyGroup);
      } else {
        dashboard.appendChild(currentDutyGroup);
      }
    }
  }
  currentDutyGroup.appendChild(flightBlock);

  setTimeout(() => {
    flightBlock.classList.add('visible');
    currentDutyGroup.classList.add('visible');
  }, 0);

  const flightData = {
    flightNumber: flightNumberFull,
    date: date,
    departureDateTime: departureDateTime.toISOString(),
    arrivalTime: arrivalTimeStr,
    depIata,
    arrIata,
    aircraftType,
    flyingTime: flyingTime || 'N/A',
    depCity,
    arrCity,
    isAdditional: isAdditionalFlight,
    dutyGroupId: currentDutyGroup.getAttribute('data-duty-id')
  };
  localStorage.setItem(`flight_${flightNumberFull}_${date}`, JSON.stringify(flightData));
  localStorage.setItem(`duty_${flightData.dutyGroupId}`, JSON.stringify({ flights: [flightData] }));

  flightBlock.addEventListener('click', () => openEditModal(flightBlock, flightData));
}

function loadExistingFlights() {
  const keys = Object.keys(localStorage);
  let dutyGroups = {};
  keys.sort().forEach(key => {
    if (key.startsWith('flight_')) {
      const flightData = JSON.parse(localStorage.getItem(key));
      const [_, flightNumberFull, date] = key.split('_');
      const departureDateTime = new Date(flightData.departureDateTime);
      const flyingTime = flightData.flyingTime || 'N/A';
      isAdditionalFlight = flightData.isAdditional || false;
      const dutyGroupId = flightData.dutyGroupId;

      if (dutyGroupId) {
        if (!dutyGroups[dutyGroupId]) {
          const dutyGroup = document.createElement('div');
          dutyGroup.className = 'duty-group visible';
          dutyGroup.setAttribute('data-duty-id', dutyGroupId);
          const existingFlightBlocks = document.querySelectorAll('.flight-block, .duty-group');
          const dashboard = document.querySelector('.dashboard');
          if (existingFlightBlocks.length > 0) {
            existingFlightBlocks[existingFlightBlocks.length - 1].insertAdjacentElement('afterend', dutyGroup);
          } else {
            const header = document.querySelector('.header');
            if (header) {
              header.insertAdjacentElement('afterend', dutyGroup);
            } else {
              dashboard.appendChild(dutyGroup);
            }
          }
          dutyGroups[dutyGroupId] = dutyGroup;
        }
        createFlightBlock(departureDateTime, flightData.arrivalTime, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date, flyingTime);
        if (dutyGroups[dutyGroupId]) {
          const flightBlock = document.querySelector(`[data-flight-number="${flightNumberFull}"][data-date="${date}"]`)?.closest('.flight-block');
          if (flightBlock) dutyGroups[dutyGroupId].appendChild(flightBlock);
        }
      }
    }
  });
  // Удаление пустых .duty-group
  Object.values(dutyGroups).forEach(group => {
    if (group.querySelectorAll('.flight-block').length === 0) group.remove();
  });
  isAdditionalFlight = false;
  currentDutyGroup = null;
}

function showAddAnotherModal() {
  const addAnotherModal = document.getElementById('add-another-modal');
  addAnotherModal.classList.add('active');
  const yesBtn = document.getElementById('add-another-yes');
  const noBtn = document.getElementById('add-another-no');

  const yesHandler = () => {
    isAdditionalFlight = true;
    if (!currentDutyGroup) {
      currentDutyGroup = document.querySelector('.duty-group.visible:last-child');
      if (!currentDutyGroup) {
        currentDutyGroup = document.createElement('div');
        currentDutyGroup.className = 'duty-group visible';
        currentDutyGroup.setAttribute('data-duty-id', Date.now());
        const existingFlightBlocks = document.querySelectorAll('.flight-block, .duty-group');
        const dashboard = document.querySelector('.dashboard');
        if (existingFlightBlocks.length > 0) {
          existingFlightBlocks[existingFlightBlocks.length - 1].insertAdjacentElement('afterend', currentDutyGroup);
        } else {
          const header = document.querySelector('.header');
          if (header) {
            header.insertAdjacentElement('afterend', currentDutyGroup);
          } else {
            dashboard.appendChild(currentDutyGroup);
          }
        }
      }
    }
    addAnotherModal.classList.remove('active');
    const inputGroupModal = document.getElementById('input-group-modal');
    inputGroupModal.classList.add('active');
    document.querySelector('.date-input').value = '';
    document.querySelector('.flight-prefix').value = 'SU';
    document.querySelector('.flight-number').value = '';
    document.getElementById('flight-time-display').textContent = 'Время вылета';
    document.getElementById('create-duty-btn').disabled = true;
    yesBtn.removeEventListener('click', yesHandler);
  };

  const noHandler = () => {
    isAdditionalFlight = false;
    currentDutyGroup = null;
    addAnotherModal.classList.remove('active');
    document.getElementById('input-group-modal').classList.remove('active');
    noBtn.removeEventListener('click', noHandler);
  };

  yesBtn.addEventListener('click', yesHandler);
  noBtn.addEventListener('click', noHandler);
}

document.addEventListener("DOMContentLoaded", function () {
  loadExistingFlights();
  const addFlightBtn = document.getElementById('add-flight-btn');
  const inputGroupModal = document.getElementById('input-group-modal');
  const dateInput = document.querySelector('.date-input');
  const flightPrefix = document.querySelector('.flight-prefix');
  const flightNumber = document.querySelector('.flight-number');
  const departureAirport = document.querySelector('.airports .airport:nth-child(1) .airport-info');
  const arrivalAirport = document.querySelector('.airports .airport:nth-child(2) .airport-info');

  addFlightBtn.addEventListener('click', () => {
    isAdditionalFlight = false;
    currentDutyGroup = null;
    currentDutyGroup = document.createElement('div');
    currentDutyGroup.className = 'duty-group visible';
    currentDutyGroup.setAttribute('data-duty-id', Date.now());
    const existingFlightBlocks = document.querySelectorAll('.flight-block, .duty-group');
    const dashboard = document.querySelector('.dashboard');
    if (existingFlightBlocks.length > 0) {
      existingFlightBlocks[existingFlightBlocks.length - 1].insertAdjacentElement('afterend', currentDutyGroup);
    } else {
      const header = document.querySelector('.header');
      if (header) {
        header.insertAdjacentElement('afterend', currentDutyGroup);
      } else {
        dashboard.appendChild(currentDutyGroup);
      }
    }
    inputGroupModal.classList.add('active');
    dateInput.value = '';
    flightPrefix.value = 'SU';
    flightNumber.value = '';
    const flightTimeDisplay = document.getElementById('flight-time-display');
    if (flightTimeDisplay) flightTimeDisplay.textContent = 'Время вылета';
  });

  inputGroupModal.addEventListener('click', (e) => {
    if (e.target === inputGroupModal) inputGroupModal.classList.remove('active');
  });

  async function handleFlightSubmit() {
    const date = dateInput.value;
    const prefix = flightPrefix.value;
    const number = flightNumber.value.trim().replace(/[^0-9]/g, '');
    const flightNumberFull = `${prefix}${number}`.padStart(6, '0').toUpperCase();
    const createDutyBtn = document.getElementById('create-duty-btn');
    if (createDutyBtn) createDutyBtn.disabled = true;
    if (date && flightNumberFull && number.length >= 3 && /^\d+$/.test(number)) {
      const flightData = await handleFlightInfoUpdate(date, flightNumberFull, departureAirport, arrivalAirport);
      if (flightData) createDutyBtn.disabled = false;
    } else {
      departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
      arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
    }
  }
  const debouncedHandleFlightSubmit = debounce(handleFlightSubmit, 500);
  dateInput.addEventListener('input', debouncedHandleFlightSubmit);
  flightPrefix.addEventListener('change', debouncedHandleFlightSubmit);
  flightNumber.addEventListener('input', debouncedHandleFlightSubmit);
});

const createDutyBtn = document.getElementById('create-duty-btn');
createDutyBtn.addEventListener('click', () => {
  const dateInput = document.querySelector('.date-input');
  const flightPrefix = document.querySelector('.flight-prefix');
  const flightNumber = document.querySelector('.flight-number');
  const prefix = flightPrefix.value;
  const number = flightNumber.value.trim().replace(/[^0-9]/g, '');
  const flightNumberFull = `${prefix}${number}`.padStart(6, '0').toUpperCase();
  const date = dateInput.value;
  const cachedData = JSON.parse(localStorage.getItem(`flightData_${flightNumberFull}_${date}`));
  const flightData = displayFlightInfo(cachedData?.data || null, document.querySelector('.airports .airport:nth-child(1) .airport-info'), document.querySelector('.airports .airport:nth-child(2) .airport-info'), date);
  if (flightData) {
    createFlightBlock(flightData.departureDateTime, flightData.arrivalTimeStr, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date, flightData.flyingTime);
    showAddAnotherModal();
  }
});

function updateTimeDisplays() {
  const now = new Date();
  const localTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const moscowOffset = 3 * 60 + now.getTimezoneOffset();
  const moscowTime = new Date(now.getTime() + moscowOffset * 60 * 1000);
  const moscowTimeStr = moscowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const localEl = document.getElementById('current-time');
  const moscowEl = document.getElementById('destination-time');
  if (localEl) localEl.textContent = localTimeStr;
  if (moscowEl) moscowEl.textContent = moscowTimeStr;
}
setInterval(updateTimeDisplays, 1000);
updateTimeDisplays();

function openEditModal(flightBlock, flightData) {
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <div class="edit-modal-content">
      <h3>Редактирование наряда</h3>
      <div class="input-group">
        <input type="date" id="edit-date" value="${new Date(flightData.departureDateTime).toISOString().split('T')[0]}">
        <div class="flight-number-wrapper">
          <select id="edit-flight-prefix">
            <option value="SU" ${flightData.flightNumber.startsWith('SU') ? 'selected' : ''}>SU</option>
            <option value="EVENT" ${flightData.flightNumber.startsWith('EVENT') ? 'selected' : ''}>Событие</option>
          </select>
          <input type="text" id="edit-flight-number" value="${flightData.flightNumber.replace(/^[A-Z]+/, '')}" pattern="[0-9]*" inputmode="numeric">
        </div>
        <input type="time" id="edit-departure-time" value="${new Date(flightData.departureDateTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}">
        <input type="time" id="edit-arrival-time" value="${flightData.arrivalTime}">
        <select id="edit-dep-iata">
          ${Object.keys(airports).map(iata => `<option value="${iata}" ${iata === flightData.depIata ? 'selected' : ''}>${iata} - ${airports[iata].split(' - ')[1]}</option>`).join('')}
        </select>
        <select id="edit-arr-iata">
          ${Object.keys(airports).map(iata => `<option value="${iata}" ${iata === flightData.arrIata ? 'selected' : ''}>${iata} - ${airports[iata].split(' - ')[1]}</option>`).join('')}
        </select>
        <input type="text" id="edit-flying-time" value="${flightData.flyingTime}">
        <input type="text" id="edit-aircraft-type" value="${flightData.aircraftType}">
      </div>
      <div class="buttons">
        <button class="delete-btn" id="delete-edit">Удалить</button>
        <button class="cancel-btn" id="cancel-edit">Отмена</button>
        <button class="save-btn" id="save-edit">Сохранить</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('active');

  const saveBtn = modal.querySelector('#save-edit');
  const cancelBtn = modal.querySelector('#cancel-edit');
  const deleteBtn = modal.querySelector('#delete-edit');

  saveBtn.addEventListener('click', () => saveEdit(modal, flightBlock, flightData));
  cancelBtn.addEventListener('click', () => modal.remove());
  deleteBtn.addEventListener('click', () => deleteFlight(modal, flightBlock, flightData));
}

function saveEdit(modal, flightBlock, flightData) {
  const date = new Date(document.getElementById('edit-date').value);
  const prefix = document.getElementById('edit-flight-prefix').value;
  const number = document.getElementById('edit-flight-number').value.trim().replace(/[^0-9]/g, '');
  const flightNumberFull = `${prefix}${number}`.padStart(6, '0').toUpperCase();
  const departureTime = document.getElementById('edit-departure-time').value;
  const arrivalTime = document.getElementById('edit-arrival-time').value;
  const [hours, minutes] = departureTime.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  const depIata = document.getElementById('edit-dep-iata').value;
  const arrIata = document.getElementById('edit-arr-iata').value;
  const flyingTime = document.getElementById('edit-flying-time').value;
  const aircraftType = document.getElementById('edit-aircraft-type').value;
  const depCity = airports[depIata]?.split(' - ')[1]?.split('/')[0] || depIata;
  const arrCity = airports[arrIata]?.split(' - ')[1]?.split('/')[0] || arrIata;

  const newFlightData = {
    flightNumber: flightNumberFull,
    date: date.toISOString().split('T')[0],
    departureDateTime: date.toISOString(),
    arrivalTime,
    depIata,
    arrIata,
    aircraftType,
    flyingTime,
    depCity,
    arrCity,
    isAdditional: flightData.isAdditional,
    dutyGroupId: flightData.dutyGroupId
  };
  localStorage.removeItem(`flight_${flightData.flightNumber}_${flightData.date}`);
  localStorage.setItem(`flight_${flightNumberFull}_${date.toISOString().split('T')[0]}`, JSON.stringify(newFlightData));

  const flightCard = flightBlock.querySelector('.flight-card');
  flightCard.setAttribute('data-flight-number', flightNumberFull);
  flightCard.setAttribute('data-date', date.toISOString().split('T')[0]);
  const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayName = daysShort[date.getDay()];
  const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const departureTimeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrFormattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const arrDayName = daysShort[date.getDay()];

  flightBlock.querySelector('.flight-date-row:first-child span:first-child').textContent = `${formattedDate}, ${dayName}`;
  flightBlock.querySelector('.flight-date-row:first-child .iata-code').textContent = depIata;
  flightBlock.querySelector('.flight-time-row:first-child .flight-time').textContent = departureTimeStr;
  flightBlock.querySelector('.flight-time-row:first-child .city').textContent = depCity;
  flightBlock.querySelector('.flight-date-row:last-child span:first-child').textContent = `${arrFormattedDate}, ${arrDayName}`;
  flightBlock.querySelector('.flight-date-row:last-child .iata-code').textContent = arrIata;
  flightBlock.querySelector('.flight-time-row:last-child .flight-time').textContent = arrivalTime;
  flightBlock.querySelector('.flight-time-row:last-child .city').textContent = arrCity;
  flightBlock.querySelector('.flight-info-row span:first-child').textContent = flightNumberFull;
  flightBlock.querySelector('.flight-info-row span:nth-child(2)').textContent = flyingTime;
  flightBlock.querySelector('.flight-info-row span:nth-child(3)').textContent = aircraftType;

  modal.remove();
}

function deleteFlight(modal, flightBlock, flightData) {
  if (confirm('Вы уверены, что хотите удалить этот наряд?')) {
    localStorage.removeItem(`flight_${flightData.flightNumber}_${flightData.date}`);
    const parentDutyGroup = flightBlock.closest('.duty-group');
    flightBlock.remove();
    if (parentDutyGroup && parentDutyGroup.querySelectorAll('.flight-block').length === 0) {
      parentDutyGroup.remove();
      localStorage.removeItem(`duty_${flightData.dutyGroupId}`);
      if (currentDutyGroup === parentDutyGroup) currentDutyGroup = null;
    }
    modal.remove();
  }
}