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
    "TUN": "DTTA/TUN - TUNIS/CARTHAGE",
    "TLL": "EETN/TLL - TALLINN/LENNART ME",
    "HEL": "EFHK/HEL - HELSINKI/VANTAA",
    "ARN": "ESSA/ARN - STOCKHOLM/ARLANDA",
    "RIX": "EVRA/RIX - RIGA",
    "VNO": "EYVI/VNO - VILNIUS INTL",
    "CAI": "HECA/CAI - CAIRO INTL",
    "HRG": "HEGN/HRG - HURGHADA INTL",
    "LXR": "HELX/LXR - LUXOR INTL",
    "SSH": "HESH/SSH - SHARM EL SHEIKH IN",
    "LCA": "LCLK/LCA - LARNAKA INTL",
    "PFO": "LCPH/PFO - PAFOS INTL",
    "TLV": "LLBG/TLV - TEL AVIV/BEN GURIO",
    "ESB": "LTAC/ESB - ANKARA/ESENBOGA IN",
    "ADA": "LTAF/ADA - ADANA",
    "AYT": "LTAI/AYT - ANTALYA INTL",
    "ISL": "LTBA/ISL - ISTANBUL/ATATURK I",
    "ADB": "LTBJ/ADB - IZMIR/ADNAN MENDER",
    "DLM": "LTBS/DLM - MUGLA/DALAMAN",
    "BJV": "LTFE/BJV - MILAS/BODRUM",
    "GZP": "LTFG/GZP - GAZIPASA/ALANYA",
    "SAW": "LTFJ/SAW - ISTANBUL/SABIHA GO",
    "IST": "LTFM/IST - ISTANBUL AIRPORT",
    "KBL": "OAKB/KBL - HAMID KARZAI INTL/",
    "BAH": "OBBI/BAH - BAHRAIN INTL",
    "BUZ": "OIBB/BUZ - BUSHEHR",
    "IFN": "OIFM/IFN - ESFAHAN/SHAHID BEH",
    "IKA": "OIIE/IKA - TEHRAN/IMAM KHOMAI",
    "THR": "OIII/THR - TEHRAN/MEHRABAD IN",
    "SYZ": "OISS/SYZ - SHIRAZ/SHAHID DAST",
    "AMM": "OJAI/AMM - AMMAN/QUEEN ALIA I",
    "ADJ": "OJAM/ADJ - AMMAN MARKA INTL",
    "AQJ": "OJAQ/AQJ - AQABA/KING HUSSEIN",
    "BEY": "OLBA/BEY - BEIRUT/RAFIC HARIR",
    "AUH": "OMAA/AUH - ABU DHABI INTL",
    "AAN": "OMAL/AAN - AL AIN INTL",
    "DXB": "OMDB/DXB - DUBAI INTL",
    "DWC": "OMDW/DWC - DUBAI/AL MAKTOUM I",
    "FJR": "OMFJ/FJR - FUJAIRAH INTL",
    "RKT": "OMRK/RKT - RAS AL KHAIMAH INT",
    "SHJ": "OMSJ/SHJ - SHARJAH INTL",
    "MCT": "OOMS/MCT - MUSCAT INTL",
    "KHI": "OPKC/KHI - KARACHI/JINNAH INT",
    "LHE": "OPLA/LHE - LAHORE/ALLAMA IQBA",
    "PEW": "OPPS/PEW - BACHA KHAN INTL",
    "BGW": "ORBI/BGW - BAGHDAD INTL",
    "BSR": "ORMM/BSR - BASRAH INTL",
    "DIA": "OTBD/DIA - DOHA INTL",
    "DOH": "OTHH/DOH - DOHA/HAMAD INTL",
    "CJU": "RKPC/CJU - JEJU INTL",
    "PUS": "RKPK/PUS - BUSAN/GIMHAE INTL",
    "ICN": "RKSI/ICN - SEOUL/INCHEON INTL",
    "GMP": "RKSS/GMP - SEOUL/GIMPO INTL",
    "ALA": "UAAA/ALA - ALMATY",
    "NQZ": "UACC/NQZ - NUR-SULTAN/N. NAZA",
    "CIT": "UAII/CIT - SHYMKENT",
    "HSA": "UAIT/HSA - TURKISTAN",
    "KGF": "UAKK/KGF - KARAGANDA",
    "BXY": "UAOL/BXY - KRAINIY",
    "KZO": "UAOO/KZO - KYZYLORDA",
    "URA": "UARR/URA - URALSK",
    "SCO": "UATE/SCO - AKTAU",
    "GUW": "UATG/GUW - ATYRAU",
    "AKX": "UATT/AKX - AKTOBE/AKTOBE",
    "KSN": "UAUU/KSN - KOSTANAY",
    "GYD": "UBBB/GYD - BAKU/HEYDAR ALIYEV",
    "GNJ": "UBBG/GNJ - GANJA",
    "IKU": "UCFL/IKU - ISSYK-KUL",
    "FRU": "UCFM/FRU - BISHKEK/MANAS",
    "OSS": "UCFO/OSS - OSH",
    "LWN": "UDSG/LWN - GYUMRI/SHIRAK",
    "EVN": "UDYZ/EVN - YEREVAN/ZVARTNOTS",
    "TLK": "UECT/TLK - TALAKAN",
    "YKS": "UEEE/YKS - YAKUTSK",
    "NER": "UELL/NER - NERYUNGRI CHULMAN",
    "PYJ": "UERP/PYJ - POLYARNY",
    "MJZ": "UERR/MJZ - MIRNY",
    "BUS": "UGSB/BUS - BATUMI",
    "TBS": "UGTB/TBS - TBILISI/TBILISI",
    "BQS": "UHBB/BQS - BLAGOVESCHENSK/IGN",
    "KHV": "UHHH/KHV - KHABAROVSK NOVY",
    "XKD": "UHKD/XKD - KOMSOMOLSK NA AMUR",
    "DYR": "UHMA/DYR - ANADYR/UGOLNY",
    "GDX": "UHMM/GDX - MAGADAN/SOKOL",
    "PKC": "UHPP/PKC - PETROPAVLOVSK-KAMC",
    "UUS": "UHSS/UUS - YUZHNO-SAKHALINSK",
    "VVO": "UHWW/VVO - VLADIVOSTOK",
    "HTA": "UIAA/HTA - CHITA",
    "BTK": "UIBB/BTK - BRATSK",
    "IKT": "UIII/IKT - IRKUTSK",
    "UUD": "UIUU/UUD - ULAN-UDE/MUKHINO",
    "ARH": "ULAA/ARH - ARCHANGELSK",
    "NNM": "ULAM/NNM - NARYAN MAR",
    "LED": "ULLI/LED - SANKT-PETERBURG/PU",
    "KVK": "ULMK/KVK - APATITY/KHIBINY",
    "MMK": "ULMM/MMK - MURMANSK",
    "PKV": "ULOO/PKV - PSKOV",
    "PES": "ULPB/PES - PETROZAVODSK",
    "CEE": "ULWC/CEE - CHEREPOVETS",
    "KGD": "UMKK/KGD - KALININGRAD",
    "MSQ": "UMMS/MSQ - MINSK-2",
    "ABA": "UNAA/ABA - ABAKAN",
    "BAX": "UNBB/BAX - BARNAUL/MIKHAYLOVK",
    "RGK": "UNBG/RGK - GORNO-ALTAISK",
    "KEJ": "UNEE/KEJ - KEMEROVO/ALEXEY LE",
    "KJA": "UNKL/KJA - KRASNOYARSK",
    "OVB": "UNNT/OVB - NOVOSIBIRSK/TOLMAC",
    "OMS": "UNOO/OMS - OMSK TSENTRALNY",
    "TOF": "UNTT/TOF - TOMSK",
    "NOZ": "UNWW/NOZ - NOVOKUZNETSK",
    "HTG": "UOHH/HTG - KHATANGA",
    "IAA": "UOII/IAA - IGARKA",
    "NSK": "UOOO/NSK - NORILSK ALYKEL",
    "SIP": "URFF/SIP - SIMFEROPOL INTL",
    "AAQ": "URKA/AAQ - ANAPA",
    "GDZ": "URKG/GDZ - GELENDZHIK",
    "KRR": "URKK/KRR - KRASNODAR PASHKOVS",
    "GRV": "URMG/GRV - GROZNY/SEVERNY",
    "MCX": "URML/MCX - MAKHACHKALA/UYTASH",
    "MRV": "URMM/MRV - MINERALNYYE VODY",
    "NAL": "URMN/NAL - NALCHIK",
    "OGZ": "URMO/OGZ - VLADIKAVKAZ",
    "IGT": "URMS/IGT - MAGAS",
    "STW": "URMT/STW - STAVROPOL SHPAKOVS",
    "ROV": "URRP/ROV - ROSTOV NA DONU/PLA",
    "AER": "URSS/AER - SOCHI",
    "ASF": "URWA/ASF - ASTRAKHAN",
    "ESL": "URWI/ESL - ELISTA",
    "VOG": "URWW/VOG - VOLGOGRAD",
    "CEK": "USCC/CEK - CHELYABINSK BALAND",
    "MQF": "USCM/MQF - MAGNITOGORSK",
    "SBT": "USDA/SBT - SABETTA",
    "SLY": "USDD/SLY - SALEKHARD",
    "HMA": "USHH/HMA - KHANTY-MANSIYSK/KH",
    "EYK": "USHQ/EYK - BELOYARSKIY",
    "IJK": "USII/IJK - IZHEVSK",
    "KVX": "USKK/KVX - KIROV",
    "NYM": "USMM/NYM - NADYM",
    "YMB": "USMQ/YMB - YAMBURG",
    "NUX": "USMU/NUX - NOVY URENGOY",
    "NJC": "USNN/NJC - NIZHNEVARTOVSK",
    "PEE": "USPP/PEE - PERM/BOLSHOE SAVIN",
    "KGP": "USRK/KGP - KOGALYM",
    "NOJ": "USRO/NOJ - NOYABRSK",
    "SGC": "USRR/SGC - SURGUT",
    "SVX": "USSS/SVX - YEKATERINBURG/KOLT",
    "RMZ": "USTJ/RMZ - TOBOLSK/REMEZOV",
    "TJM": "USTR/TJM - TYUMEN/ROSHCHINO",
    "KRO": "USUU/KRO - KURGAN",
    "ASB": "UTAA/ASB - ASHGABAT",
    "KRW": "UTAK/KRW - TURKMENBASHI",
    "DYU": "UTDD/DYU - DUSHANBE",
    "TJU": "UTDK/TJU - KULOB",
    "LBD": "UTDL/LBD - KHUJAND",
    "AZN": "UTFA/AZN - ANDIZHAN",
    "FEG": "UTFF/FEG - FERGANA",
    "NMA": "UTFN/NMA - NAMANGAN",
    "NCU": "UTNN/NCU - NUKUS",
    "UGC": "UTNU/UGC - URGENCH",
    "NVI": "UTSA/NVI - NAVOI",
    "BHK": "UTSB/BHK - BUKHARA",
    "KSQ": "UTSK/KSQ - KARSHI",
    "SKD": "UTSS/SKD - SAMARKAND",
    "TAS": "UTTT/TAS - TASHKENT INTL/ISLA",
    "BZK": "UUBP/BZK - BRYANSK",
    "ZIA": "UUBW/ZIA - RAMENSKOYE",
    "DME": "UUDD/DME - MOSCOW/DOMODEDOVO",
    "IAR": "UUDL/IAR - YAROSLAVL / TUNOSH",
    "SVO": "UUEE/SVO - MOSCOW/SHEREMETYEV",
    "EGO": "UUOB/EGO - BELGOROD",
    "URS": "UUOK/URS - KURSK VOSTOCHNY",
    "LPK": "UUOL/LPK - LIPETSK",
    "VOZ": "UUOO/VOZ - VORONEZH",
    "VKO": "UUWW/VKO - MOSCOW/VNUKOVO",
    "UCT": "UUYH/UCT - UKHTA",
    "USK": "UUYS/USK - USINSK",
    "VKT": "UUYW/VKT - VORKUTA",
    "SCW": "UUYY/SCW - SYKTYVKAR",
    "GOJ": "UWGG/GOJ - NIZHNY NOVGOROD/ST",
    "KZN": "UWKD/KZN - KAZAN",
    "NBC": "UWKE/NBC - NIZHNEKAMSK/BEGISH",
    "JOK": "UWKJ/JOK - YOSHKAR-OLA",
    "CSY": "UWKS/CSY - CHEBOKSARY",
    "ULV": "UWLL/ULV - ULYANOVSK-BARATAEW",
    "ULY": "UWLW/ULY - ULYANOVSK/VOSTOCHN",
    "REN": "UWOO/REN - ORENBURG",
    "OSW": "UWOR/OSW - ORSK",
    "PEZ": "UWPP/PEZ - PENZA",
    "SKX": "UWPS/SKX - SARANSK",
    "GSV": "UWSG/GSV - SARATOV/GAGARIN",
    "UFA": "UWUU/UFA - UFA",
    "KUF": "UWWW/KUF - SAMARA/KURUMOCH",
    "AMD": "VAAH/AMD - AHMEDABAD/VALLABH",
    "BOM": "VABB/BOM - MUMBAI/CHHATRAPATI",
    "CMB": "VCBI/CMB - KATUNAYAKE/BAN. IN",
    "HRI": "VCRI/HRI - MATTALA RAJAPAKSA",
    "PNH": "VDPP/PNH - PHNOM PENH",
    "CCU": "VECC/CCU - KOLKATA INTL",
    "DAC": "VGHS/DAC - DHAKA/HAZRAT SHAHJ",
    "HKG": "VHHH/HKG - HONG KONG INTL",
    "ATQ": "VIAR/ATQ - AMRITSAR/SRI GURU",
    "DEL": "VIDP/DEL - DELHI/INDIRA GANDH",
    "LKO": "VILK/LKO - CHAUDHARY CHARAN S",
    "VTE": "VLVT/VTE - VIENTIANE WATTAY",
    "MFM": "VMMC/MFM - MACAO INTL",
    "BLR": "VOBL/BLR - BENGALURU/KEMPEGOW",
    "GOI": "VOGO/GOI - GOA/DABOLIM NAVY",
    "HYD": "VOHS/HYD - HYDERABAD/RAJIV GA",
    "MAA": "VOMM/MAA - CHENNAI INTL",
    "TRV": "VOTV/TRV - THIRUVANANTHAPURAM",
    "MLE": "VRMM/MLE - MALE/VELANA INTL",
    "BKK": "VTBS/BKK - BANGKOK/SUVARNABHU",
    "UTP": "VTBU/UTP - RAYONG/U-TAPAO PAT",
    "HKT": "VTSP/HKT - PHUKET INTL",
    "CXR": "VVCR/CXR - KHANH HOA/CAM RANH",
    "DAD": "VVDN/DAD - DANANG INTL",
    "HAN": "VVNB/HAN - HANOI/NOIBAI INTL",
    "SGN": "VVTS/SGN - HO CHI MINH/TAN SO",
    "MDL": "VYMD/MDL - MANDALAY INTL",
    "RGN": "VYYY/RGN - YANGON INTL",
    "KUL": "WMKK/KUL - KUALA LUMPUR/SEPAN",
    "SIN": "WSSS/SIN - SINGAPORE/CHANGI",
    "PEK": "ZBAA/PEK - BEIJING/CAPITAL",
    "PKX": "ZBAD/PKX - BEIJING/DAXING",
    "HET": "ZBHH/HET - HOHHOT/BAITA",
    "SJW": "ZBSJ/SJW - SHIJIAZHUANG/ZHENG",
    "TSN": "ZBTJ/TSN - TIANJIN/BINHAI INT",
    "TYN": "ZBYN/TYN - TAIYUAN/WUSU",
    "CAN": "ZGGG/CAN - GUANGZHOU/BAIYUN",
    "CSX": "ZGHA/CSX - CHANGSHA/HUANGHUA",
    "SZX": "ZGSZ/SZX - SHENZHEN/BAOAN",
    "CGO": "ZHCC/CGO - ZHENGZHOU/XINZHENG",
    "WUH": "ZHHH/WUH - WUHAN/TIANHE",
    "HAK": "ZJHK/HAK - HAIKOU/MEILAN",
    "SYX": "ZJSY/SYX - SANYA/PHOENIX INTL",
    "LHW": "ZLLL/LHW - LANZHOU/ZHONGCHUAN",
    "XIY": "ZLXY/XIY - XI AN XIANYANG",
    "UBN": "ZMCK/UBN - ULAANBAATAR/CHINGG",
    "XMN": "ZSAM/XMN - XIAMEN/GAOQI",
    "HGH": "ZSHC/HGH - HANGZHOU/XIAOSHAN",
    "TNA": "ZSJN/TNA - JINAN/YAOQIANG",
    "NKG": "ZSNJ/NKG - NANJING/LUKOU",
    "HFE": "ZSOF/HFE - HEFEI/XINQIAO",
    "PVG": "ZSPD/PVG - SHANGHAI/PUDONG",
    "TAO": "ZSQD/TAO - QINGDAO/JIAODONG",
    "SHA": "ZSSS/SHA - SHANGHAI/HONGQIAO",
    "CKG": "ZUCK/CKG - CHONGQING/JIANGBEI",
    "CTU": "ZUUU/CTU - CHENGDU/SHUANGLIU",
    "URC": "ZWWW/URC - URUMQI/DIWOPU",
    "DLC": "ZYTL/DLC - DALIAN/ZHOUSHUIZI",
    "SHE": "ZYTX/SHE - SHENYANG/TAOXIAN",
    "GOX": "VOGA/GOX - MOPA",
    "KLF": "UUBC/KLF - KALUGA",
    "CGQ": "ZYCC/CGQ - CHANGCHUN LONGJIA",
    "TFU ": "ZUTF/TFU  - TIANFU ",
    "KYZ": "UNKY/KYZ - KYZYL",
    "BAT": "UMBB/BAT - BREST",
    "BVJ": "USDB/BVJ - BOVANENKOVO",
    "DJE": "DTTJ/DJE - DJERBA",
    "JAI": "VIJP/JAI - JAIPUR INTL",
    "NIL": "UIIR/NIL - VOSTOCHNY",
    "UKK": "UASK/UKK - UST-KAMENOGORSK",
    "KHN": "ZSCN/KHN - NANGHANG CHANGBEI IN"
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
                console.log("Сырые данные от API:", data);
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

    const departureTimeStr = leg.departure.times.scheduledDeparture?.localTime || leg.departure.times.estimatedBlockOff?.localTime;
    const aircraftType = leg.equipment?.aircraft?.scheduled?.type || 'N/A';
    const flyingTime = flight.flyingTime || 'N/A'; // Извлекаем flyingTime
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
    if (spinner) spinner.classList.add("hidden"); // Прячем спиннер после загрузки
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
    console.log("Время в полете:", flyingTime);
    return { departureDateTime, depIata, arrIata, aircraftType, flyingTime };
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

function createFlightBlock(departureDateTime, depIata, arrIata, aircraftType, flightNumberFull, date, flyingTime) {
    const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayName = daysShort[departureDateTime.getDay()];
    const formattedDate = departureDateTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const departureTime = departureDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const arrivalDateTime = new Date(departureDateTime.getTime());
    // Используем значение по умолчанию, если flyingTime отсутствует или некорректно
    const [hours = 0, minutes = 0, seconds = 0] = (flyingTime && flyingTime.split(':').map(Number)) || [0, 0, 0];
    arrivalDateTime.setHours(arrivalDateTime.getHours() + hours, arrivalDateTime.getMinutes() + minutes, arrivalDateTime.getSeconds() + seconds);
    const arrivalTime = arrivalDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrFormattedDate = arrivalDateTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const arrDayName = daysShort[arrivalDateTime.getDay()];

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

            <div class="flight-icon">
                ✈
            </div>

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
                <span>${flyingTime || 'N/A'}</span> <!-- Значение по умолчанию, если flyingTime отсутствует -->
                <span>${aircraftType}</span>
            </div>
        </div>
    `;

    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', flightBlock);

    setTimeout(() => {
        flightBlock.classList.add('visible');
    }, 0);

    const flightData = {
        flightNumber: flightNumberFull,
        date: date,
        departureDateTime: departureDateTime.toISOString(),
        depIata: depIata,
        arrIata: arrIata,
        aircraftType: aircraftType,
        flyingTime: flyingTime || 'N/A', // Значение по умолчанию, если отсутствует
        depCity: depCity,
        arrCity: arrCity
    };
    localStorage.setItem(`flight_${flightNumberFull}_${date}`, JSON.stringify(flightData));

    // Добавляем обработчик клика для открытия меню редактирования
    flightBlock.addEventListener('click', () => openEditModal(flightBlock, flightData));
}

function loadExistingFlights() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('flight_')) {
            const flightData = JSON.parse(localStorage.getItem(key));
            const [_, flightNumberFull, date] = key.split('_');
            const departureDateTime = new Date(flightData.departureDateTime);
            // Используем flyingTime из flightData, с запасным значением 'N/A', если отсутствует
            const flyingTime = flightData.flyingTime || 'N/A';
            createFlightBlock(departureDateTime, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date, flyingTime);
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
        createFlightBlock(flightData.departureDateTime, flightData.depIata, flightData.arrIata, flightData.aircraftType, flightNumberFull, date, flightData.flyingTime);
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
                <select id="edit-dep-iata">
                    ${Object.keys(airports).map(iata => `<option value="${iata}" ${iata === flightData.depIata ? 'selected' : ''}>${iata} - ${airports[iata].split(' - ')[1]}</option>`).join('')}
                </select>
                <select id="edit-arr-iata">
                    ${Object.keys(airports).map(iata => `<option value="${iata}" ${iata === flightData.arrIata ? 'selected' : ''}>${iata} - ${airports[iata].split(' - ')[1]}</option>`).join('')}
                </select>
                <input type="text" id="edit-flying-time" value="${flightData.flyingTime}"> <!-- Поле для редактирования flyingTime -->
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
    const [hours, minutes] = departureTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    const depIata = document.getElementById('edit-dep-iata').value;
    const arrIata = document.getElementById('edit-arr-iata').value;
    const flyingTime = document.getElementById('edit-flying-time').value; // Получаем обновленное flyingTime
    const aircraftType = document.getElementById('edit-aircraft-type').value;

    const depCity = airports[depIata]?.split(' - ')[1]?.split('/')[0] || depIata;
    const arrCity = airports[arrIata]?.split(' - ')[1]?.split('/')[0] || arrIata;

    const newFlightData = {
        flightNumber: flightNumberFull,
        date: date.toISOString().split('T')[0],
        departureDateTime: date.toISOString(),
        depIata,
        arrIata,
        aircraftType,
        flyingTime, // Сохраняем flyingTime
        depCity,
        arrCity
    };

    // Обновляем данные в localStorage
    localStorage.removeItem(`flight_${flightData.flightNumber}_${flightData.date}`);
    localStorage.setItem(`flight_${flightNumberFull}_${date.toISOString().split('T')[0]}`, JSON.stringify(newFlightData));

    // Обновляем отображение
    const flightCard = flightBlock.querySelector('.flight-card');
    flightCard.setAttribute('data-flight-number', flightNumberFull);
    flightCard.setAttribute('data-date', date.toISOString().split('T')[0]);
    const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayName = daysShort[date.getDay()];
    const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const departureTimeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrivalDateTime = new Date(date.getTime());
    const [flyHours, flyMinutes] = flyingTime.split(':').map(Number);
    arrivalDateTime.setHours(arrivalDateTime.getHours() + flyHours, arrivalDateTime.getMinutes() + flyMinutes, 0);
    const arrivalTime = arrivalDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrFormattedDate = arrivalDateTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const arrDayName = daysShort[arrivalDateTime.getDay()];

    flightBlock.querySelector('.flight-date-row:first-child span:first-child').textContent = `${formattedDate}, ${dayName}`;
    flightBlock.querySelector('.flight-date-row:first-child .iata-code').textContent = depIata;
    flightBlock.querySelector('.flight-time-row:first-child .flight-time').textContent = departureTimeStr;
    flightBlock.querySelector('.flight-time-row:first-child .city').textContent = depCity;
    flightBlock.querySelector('.flight-date-row:last-child span:first-child').textContent = `${arrFormattedDate}, ${arrDayName}`;
    flightBlock.querySelector('.flight-date-row:last-child .iata-code').textContent = arrIata;
    flightBlock.querySelector('.flight-time-row:last-child .flight-time').textContent = arrivalTime;
    flightBlock.querySelector('.flight-time-row:last-child .city').textContent = arrCity;
    flightBlock.querySelector('.flight-info-row span:first-child').textContent = flightNumberFull;
    flightBlock.querySelector('.flight-info-row span:nth-child(2)').textContent = flyingTime; // Обновляем flyingTime
    flightBlock.querySelector('.flight-info-row span:nth-child(3)').textContent = aircraftType;

    modal.remove();
}

function deleteFlight(modal, flightBlock, flightData) {
    if (confirm('Вы уверены, что хотите удалить этот наряд?')) {
        localStorage.removeItem(`flight_${flightData.flightNumber}_${flightData.date}`);
        flightBlock.remove();
        modal.remove();
    }
}