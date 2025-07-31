if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg))
            .catch(err => console.error('Ошибка регистрации Service Worker:', err));
    });
}

const airports = {
    "MIR": "DTMB/MIR - MONASTIR/HABIB BOU",
    "NBE": "DTNH/NBE - ENFIDHA / HAMMAMET",
    "KHN": "ZSCN/KHN - NANGHANG CHANGBEI IN",
    "KHV": "UHSS/KHV - Хабаровск (Новый)",
    "KJA": "UNKL/KJA - Красноярск (Емельяново)",
    "SVO": "UUEE/SVO - Москва (Шереметьево)",
    "KGD": "UMKK/KGD - Калининград (Храброво)"
};

const CACHE_DURATION = 20 * 60 * 1000; // 20 минут

function fetchFlightInfo(flightNumber, date) {
    return new Promise((resolve, reject) => {
        console.log("Дата:", date);
        console.log("Номер рейса:", flightNumber);

        const proxyUrl = `https://cocsr.na4u.ru/main.php?flightNumber=${encodeURIComponent(flightNumber)}&date=${encodeURIComponent(date)}`;

        console.log("Сформированный URL:", proxyUrl);

        fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Сырые данные от API:", data); // Вывод сырых данных
                if (!data || !data.data || !data.data.routes || data.error) {
                    console.error("Недостаточно данных или ошибка API:", data?.error || "Неизвестная ошибка");
                    resolve(null);
                } else {
                    console.log("Полученные данные:", data);
                    const cacheKey = `flightData_${flightNumber}_${date}`;
                    const cacheData = {
                        data: data,
                        timestamp: Date.now()
                    };
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

// Функция с задержкой (debounce) для предотвращения частых запросов
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
    console.log("Входные данные в displayFlightInfo:", flightData);
    if (!flightData || !flightData.data || !flightData.data.routes || flightData.data.routes.length === 0) {
        departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
        arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
        console.log("Нет данных о маршруте или маршруты отсутствуют");
        return null;
    }

    const flight = flightData.data.routes[0];
    const leg = flight.routeType === 'MultiLeg' && flight.legs ? flight.legs[0] : flight.leg || flight;

    if (!leg || !leg.departure || !leg.departure.times) {
        departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
        arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
        console.log("Ошибка: Данные о вылете отсутствуют, leg:", leg);
        return null;
    }

    const departureTimeStr = leg.departure.times.estimatedBlockOff?.localTime || leg.departure.times.scheduledDeparture?.localTime;
    const aircraftType = leg.equipment?.aircraft?.scheduled?.type || 'N/A';
    const flightDate = new Date(date);
    let departureDateTime;

    if (!departureTimeStr) {
        console.error("Время вылета не указано в данных API");
        return null;
    }

    const [hours, minutes] = departureTimeStr.split(':').map(Number);
    departureDateTime = new Date(flightDate);
    departureDateTime.setHours(hours, minutes, 0, 0);

    if (isNaN(departureDateTime.getTime())) {
        console.error("Некорректное время вылета:", departureTimeStr);
        return null;
    }

    const now = new Date();
    const moscowTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + 3 * 60 * 60 * 1000); // +3 для Москвы
    if (departureDateTime < moscowTime) {
        console.log("Время вылета рейса уже прошло, текущее московское время:", moscowTime);
        return null;
    }

    const depIata = leg.departure.scheduled.airportCode || 'N/A';
    const arrIata = leg.arrival.scheduled.airportCode || 'N/A';
    const depInfo = airports[depIata] || `${depIata} - Неизвестно`;
    const arrInfo = airports[arrIata] || `${arrIata} - Неизвестно`;

    departureAirport.innerHTML = `
        <div class="airport-code">${depIata}</div>
        <div class="airport-name">${depInfo.split(' - ')[1] || 'Неизвестно'}</div>
    `;
    arrivalAirport.innerHTML = `
        <div class="airport-code">${arrIata}</div>
        <div class="airport-name">${arrInfo.split(' - ')[1] || 'Неизвестно'}</div>
    `;

    const flightTimeDisplay = document.getElementById("flight-time-display");
    const spinner = document.getElementById("flight-time-spinner");
    if (spinner) spinner.classList.add("hidden"); // Прячем спinнер после загрузки
    if (flightTimeDisplay) {
        flightTimeDisplay.textContent = `${departureDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`; // Только время
    }

    // ✅ Активируем кнопку "Создать наряд"
    const createDutyBtn = document.getElementById('create-duty-btn');
    if (createDutyBtn) {
        createDutyBtn.disabled = false;
    }

    console.log("Аэропорт вылета:", depIata);
    console.log("Аэропорт прилета:", arrIata);
    console.log("Тип самолета:", aircraftType);
    return { departureDateTime, depIata, arrIata, aircraftType };
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
        if (spinner) spinner.classList.remove("hidden"); // Показываем спиннер
        if (flightTimeDisplay) flightTimeDisplay.textContent = ''; // Очищаем, спиннер будет виден

        const cacheKey = `flightData_${flightNumberFull}_${date}`;
        const cachedData = localStorage.getItem(cacheKey);
        let flightData = null;

        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            const currentTime = Date.now();
            if (currentTime - parsedData.timestamp < CACHE_DURATION && parsedData.data && parsedData.data.routes) {
                console.log("Используем кэшированные данные для", flightNumberFull, date);
                flightData = parsedData.data;
            } else {
                console.log("Кэш устарел, делаем новый запрос для", flightNumberFull, date);
                flightData = await fetchFlightInfo(flightNumberFull, date);
            }
        } else {
            console.log("Данные отсутствуют в кэше, делаем новый запрос для", flightNumberFull, date);
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

function createFlightBlock(departureDateTime, depIata, arrIata, aircraftType, flightNumberFull, date) {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayName = days[departureDateTime.getDay()];
    const formattedDate = departureDateTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const departureTime = departureDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const checkInTime = new Date(departureDateTime.getTime() - 2 * 60 * 60 * 1000); // За 2 часа до вылета
    const checkInTimeStr = checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const flightBlock = document.createElement('div');
    flightBlock.className = 'flight-block';
    flightBlock.innerHTML = `
        <div class="flight-info">
            <span>${dayName}, ${formattedDate} ${departureTime}</span>
            <span>${(airports[depIata]?.split(' - ')[1] || depIata)} → ${(airports[arrIata]?.split(' - ')[1] || arrIata)}</span>
            <span>Тип ВС: ${aircraftType}</span>
            <span>Явка: ${checkInTimeStr}</span>
        </div>
        <button class="remove-flight-btn" aria-label="Удалить рейс"><i class="fas fa-times"></i></button>
    `;

    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', flightBlock);

    // Сохранение данных в localStorage
    const flightData = {
        flightNumber: flightNumberFull,
        date: date,
        departureDateTime: departureDateTime.toISOString(),
        depIata: depIata,
        arrIata: arrIata,
        aircraftType: aircraftType
    };
    localStorage.setItem(`flight_${flightNumberFull}_${date}`, JSON.stringify(flightData));

    // Добавление обработчика для удаления блока
    const removeBtn = flightBlock.querySelector('.remove-flight-btn');
    removeBtn.addEventListener('click', () => {
        flightBlock.remove();
        localStorage.removeItem(`flight_${flightNumberFull}_${date}`);
    });
}

function loadExistingFlights() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('flight_')) {
            const flightData = JSON.parse(localStorage.getItem(key));
            const [_, flightNumberFull, date] = key.split('_');
            const departureDateTime = new Date(flightData.departureDateTime);
            createFlightBlock(departureDateTime, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadExistingFlights(); // Загружаем существующие наряды при старте

    const addFlightBtn = document.getElementById('add-flight-btn');
    const inputGroupModal = document.getElementById('input-group-modal');
    const dateInput = document.querySelector('.date-input');
    const flightPrefix = document.querySelector('.flight-prefix');
    const flightNumber = document.querySelector('.flight-number');
    const departureAirport = document.querySelector('.airports .airport:nth-child(1) .airport-info');
    const arrivalAirport = document.querySelector('.airports .airport:nth-child(2) .airport-info');

    // Обработчик открытия модального окна
    addFlightBtn.addEventListener('click', () => {
        inputGroupModal.classList.add('active');
        // Очистка полей
        dateInput.value = '';
        flightPrefix.value = 'SU'; // Сброс на значение по умолчанию
        flightNumber.value = '';
        const flightTimeDisplay = document.getElementById('flight-time-display');
        if (flightTimeDisplay) {
            flightTimeDisplay.textContent = 'Время вылета'; // Сброс текста
        }
    });

    inputGroupModal.addEventListener('click', (e) => {
        if (e.target === inputGroupModal) {
            inputGroupModal.classList.remove('active');
        }
    });

    // Функция для обработки и отправки запроса
    async function handleFlightSubmit() {
        const date = dateInput.value;
        const prefix = flightPrefix.value;
        const number = flightNumber.value.trim().replace(/[^0-9]/g, '');
        const flightNumberFull = `${prefix}${number}`.padStart(6, '0').toUpperCase();

        const createDutyBtn = document.getElementById('create-duty-btn');
        if (createDutyBtn) {
            createDutyBtn.disabled = true;
        }

        console.log("Собранные данные:", { date, prefix, number, flightNumberFull });

        if (date && flightNumberFull && number.length >= 3 && /^\d+$/.test(number)) {
            const flightData = await handleFlightInfoUpdate(date, flightNumberFull, departureAirport, arrivalAirport);
            if (flightData) {
                createDutyBtn.disabled = false; // Активируем только если данные получены
            }
        } else {
            departureAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
            arrivalAirport.innerHTML = `<div class="airport-code">---</div><div class="airport-name">-----</div>`;
            console.log("Условия не выполнены: заполните дату и номер рейса (минимум 3 цифры)");
        }
    }

    // Применяем debounce с задержкой 500мс
    const debouncedHandleFlightSubmit = debounce(handleFlightSubmit, 500);

    // Обработчики ввода с учетом debounce
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

    // Используем актуальные данные из кэша
    const cachedData = JSON.parse(localStorage.getItem(`flightData_${flightNumberFull}_${date}`));
    const flightData = displayFlightInfo(cachedData?.data || null,
        document.querySelector('.airports .airport:nth-child(1) .airport-info'),
        document.querySelector('.airports .airport:nth-child(2) .airport-info'),
        date
    );

    if (flightData) {
        createFlightBlock(flightData.departureDateTime, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date);
        document.getElementById('input-group-modal').classList.remove('active');
    } else {
        console.log("Данные рейса не найдены для создания наряда");
    }
});

function updateTimeDisplays() {
    const now = new Date();

    // Местное время
    const localTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Московское время (UTC+3)
    const moscowOffset = 3 * 60 + now.getTimezoneOffset(); // разница в минутах от текущей зоны до Москвы
    const moscowTime = new Date(now.getTime() + moscowOffset * 60 * 1000);
    const moscowTimeStr = moscowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Обновление HTML
    const localEl = document.getElementById('current-time');
    const moscowEl = document.getElementById('destination-time');
    if (localEl) localEl.textContent = localTimeStr;
    if (moscowEl) moscowEl.textContent = moscowTimeStr;
}

// Обновление раз в секунду
setInterval(updateTimeDisplays, 1000);
updateTimeDisplays(); // сразу при загрузке