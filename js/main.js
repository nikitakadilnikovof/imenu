import { fetchDishesList } from './getStor.js'// Вызываем функцию fetchDishesList и обрабатываем возвращаемый Promise
import { words } from './words.js'
import { globalData } from './globalData.js'
let menuStore = [];
let basketListStore = [];
let orderListStore = [];
const userLang = document.documentElement.lang;
const mainLang = 'ru';
const valutaSimbol = '₽';
const categoryListDiv = document.querySelector('.category-list');
const basketBoxOpenButton = document.querySelector("#basketButtonOpen");
const basketBoxClouseButton = document.querySelector("#basketButtonClouse");
const basketBoxDiv = document.querySelector(".basket-box");
const buttonOpenOrderList = document.querySelector('#buttonOpenOrderList');
const orderNumberSpan = buttonOpenOrderList.querySelector("#orderIdToHTML");
const buttonSendOrder = document.querySelector("#buttonSendOrder");
const wrapperDiv = document.querySelector(".wrapper");
const dialogBoxDiv = document.querySelector('.dialog-box');
const orderListDiv = document.querySelector('.order-list');
const orderBoxDiv = document.querySelector('#orderBoxDiv');
const orderBoxTotalCostNumber = document.querySelector('#orderBoxTotalCostNumber');
const orderBoxButtonClouse = document.querySelector('.order-box__button-clouse');
const buttonPayOrder = document.querySelector('#buttonPayOrder');
let tableNumber = localStorage.getItem('tableNumber');
let orderNumberGlobal;
console.log(tableNumber)


function chengeSaveData() {
    const savedData = JSON.parse(localStorage.getItem(`userData-${globalData.cafeName}`));
    if (savedData) {
        basketListStore = savedData.basketListStore;
        orderListStore = savedData.orderListStore;
        orderNumberGlobal = savedData.orderNumberGlobal;
        if (basketListStore.length > 0) {
            basketBoxOpenButton.classList.add('puls');
            buttonSendOrder.classList.add('puls', 'active');
            basketCardRender()
        }
        if (orderListStore.length > 0) {
            buttonOpenOrderList.classList.add('active');
            orderNumberSpan.innerText = orderNumberGlobal.toSite;
            renderOrderList()
        }
    }
}
chengeSaveData()


//для заполненя строниц
function fillingPage() {
    const wordsUserLang = words[userLang];
    for (let key in wordsUserLang) {
        if (document.querySelector(`#${key}`)) {
            document.querySelector(`#${key}`).innerHTML = wordsUserLang[key];
        }
    }
}
fillingPage();
// функция для открытия и закрытия корзины
function openClouseBasketBox(action) {
    if (action == 'openClouse') {
        basketBoxOpenButton.classList.toggle('move_left');
        basketBoxClouseButton.classList.toggle('active');
        basketBoxDiv.classList.toggle('show');
    } else {
        basketBoxOpenButton.classList.remove('move_left');
        basketBoxClouseButton.classList.remove('active');
        basketBoxDiv.classList.remove('show');
    }
};

function chengeVersion() {
    if (globalData.version == 'basic') {
        buttonSendOrder.classList.add("display-none");
    }
}
chengeVersion()

basketBoxOpenButton.addEventListener('click', () => {
    openClouseBasketBox('openClouse');
});
basketBoxClouseButton.addEventListener('click', () => {
    openClouseBasketBox('clouse');
});


// функцыя для получения базы данных
fetchDishesList()
    .then(dishesList => {//когда меню из таблицы загузилось
        // Когда Promise разрешается, мы получаем массив dishesList
        // Выводим массив объектов блюд в консоль для проверки
        menuStore = dishesList;
        renderCategoryButton()

        document.querySelector('.plelouder').classList.add('none');
    })
    .catch(error => {
        // Если Promise отклоняется, выводим ошибку в консоль
        console.error('Ошибка при получении списка блюд:', error);
    });



function renderCategoryButton() {

    categoryListDiv.innerHTML = "";
    const categoryList = new Set();
    for (let i = 0; i < menuStore.length; i++) {
        if (!categoryList.has(menuStore[i][`${userLang}Category`]) && menuStore[i].inStock == 'yes') {//если кнопка с данной категорией еще не создовалвсь 
            const categoryButton = document.createElement("button");
            categoryButton.className = "category-button";
            categoryButton.innerText = menuStore[i][`${userLang}Category`];
            categoryListDiv.appendChild(categoryButton);
            categoryList.add(menuStore[i][`${userLang}Category`]);

            categoryButton.addEventListener('click', () => {
                categoryListDiv.querySelector(".active").classList.remove('active');
                categoryButton.classList.add("active");
                renderMenu(menuStore[i][`${userLang}Category`])
            })
        }
    }
    categoryListDiv.querySelector('button').classList.add('active');
    renderMenu(categoryListDiv.querySelector('button').innerText);

}




function renderMenu(category) {
    console.log(category)
    const menuListDiv = document.querySelector('.menu-list');
    menuListDiv.innerHTML = "";

    menuStore.forEach(menuStorItem => {
        if (menuStorItem[`${userLang}Category`] == category && menuStorItem.inStock == 'yes') {
            const menuCardDiv = document.createElement("div");
            menuCardDiv.className = 'menu-cart';
            menuCardDiv.dataset.id = menuStorItem.id;

            menuCardDiv.innerHTML = `
             <img src="${menuStorItem.img}" alt="">
                <div class="menu-cart__text">
                    <div class="menu-cart__info">
                        <h2>${menuStorItem[`${userLang}Name`]}</h2>
                        <p>${menuStorItem[`${userLang}Description`]}</p>
                    </div>
                </div>
            `;

            const menuCartTextDiv = menuCardDiv.querySelector(".menu-cart__text");
            const portionsContainer = document.createElement("div");
            portionsContainer.className = "menu-cart__portions";
            const portionsNames = [
                menuStorItem.portionName1,
                menuStorItem.portionName2,
                menuStorItem.portionName3
            ];
            portionsNames.forEach((portionName, index) => {
                if (portionName) {
                    const portionNumber = index + 1;
                    const portionCost = menuStorItem[`portionCost${portionNumber}`];

                    const portionItemDiv = document.createElement("div");
                    portionItemDiv.className = 'portions-item';
                    portionItemDiv.dataset.id = `${menuStorItem.id}-${portionCost}`;
                    const portionCardInBasket = basketListStore.find(item => item.portionId == `${menuStorItem.id}-${portionCost}`);
                    let numberPortions;
                    if (portionCardInBasket) {
                        numberPortions = portionCardInBasket.numberPortions;
                        menuCardDiv.classList.add("active");
                    } else {
                        numberPortions = 0;
                    }
                    portionItemDiv.innerHTML = `
                    <p class="portions-item__text">
                        <span class="portions-item__name">${portionName} — </span>
                        <span class="portions-item__price">${portionCost} ${valutaSimbol}</span>
                    </p>
                    <div class="portions-item__buttons">
                        <button class="portions-item__minus"><i class="fa-solid fa-minus"></i></button>
                        <span class="portions-item__number">${numberPortions}</span>
                        <button class="portions-item__plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    `;
                    const buttonMinus = portionItemDiv.querySelector('.portions-item__minus');
                    buttonMinus.addEventListener('click', () => {
                        updateBasket(
                            'menu',
                            'minus',
                            portionItemDiv.querySelector('.portions-item__number'),
                            menuStorItem[`${mainLang}Category`],
                            `${menuStorItem[`${userLang}Name`]}`,
                            `${menuStorItem[`${mainLang}Name`]}`,
                            portionName,
                            portionCost,
                            menuStorItem.img,
                            menuStorItem.id,
                            `${menuStorItem.id}-${portionCost}`,

                        );
                    });
                    const buttonPlus = portionItemDiv.querySelector('.portions-item__plus');
                    buttonPlus.addEventListener('click', () => {
                        updateBasket(
                            'menu',
                            'plus',
                            portionItemDiv.querySelector('.portions-item__number'),
                            menuStorItem[`${mainLang}Category`],
                            `${menuStorItem[`${userLang}Name`]}`,
                            `${menuStorItem[`${mainLang}Name`]}`,
                            portionName,
                            portionCost,
                            menuStorItem.img,
                            menuStorItem.id,
                            `${menuStorItem.id}-${portionCost}`
                        );
                    });
                    portionsContainer.appendChild(portionItemDiv);

                };
            });

            menuCartTextDiv.appendChild(portionsContainer);
            menuListDiv.appendChild(menuCardDiv);
        };
    });
    menuListDiv.scrollLeft = 0;
};



function updateBasket(
    buttonType,
    action,
    portionsItemNumberSpan,
    mainLangCategory,
    nameDishesUserLang,
    nameDishesMainLang,
    portionName,
    portionCost,
    imgSrc,
    dishesId,
    portionId
) {
    console.log(portionId, dishesId,)
    const menuCardDiv = document.querySelector(`[data-id='${dishesId}']`);
    if (action == 'plus') {

        if (menuCardDiv) {
            menuCardDiv.classList.add('active');
            if (buttonType == 'basket') {
                const portionItemDiv = menuCardDiv.querySelector(`[data-id='${portionId}']`);
                console.log(portionItemDiv)
                if (portionItemDiv) {
                    portionItemDiv.querySelector('.portions-item__number').innerText = parseInt(portionItemDiv.querySelector('.portions-item__number').innerText) + 1
                }
            }
        }
        portionsItemNumberSpan.innerText = parseInt(portionsItemNumberSpan.innerText) + 1;
        const numberPortions = parseInt(portionsItemNumberSpan.innerText);
        if (basketListStore.find(item => item.portionId === portionId)) {
            console.log(dishesId)
            basketListStore.forEach(item => {
                if (item.portionId === portionId) {
                    item.numberPortions = numberPortions;
                }
            })
        } else {
            const portionInfo = {
                mainLangCategory: mainLangCategory,
                nameDishesUserLang: nameDishesUserLang,
                nameDishesMainLang: nameDishesMainLang,
                portionName: portionName,
                portionCost: portionCost,
                imgSrc: imgSrc,
                dishesId: dishesId,
                portionId: portionId,
                numberPortions: numberPortions
            }
            basketListStore.unshift(portionInfo)
        }
        basketBoxOpenButton.classList.add('puls')
        buttonSendOrder.classList.add("active")

    } else {//если нажали на минус
        basketListStore.forEach(item => {
            if (item.portionId === portionId) {
                if (menuCardDiv) {
                    if (buttonType == 'basket') {
                        const portionItemDiv = menuCardDiv.querySelector(`[data-id='${portionId}']`);
                        console.log(portionItemDiv)
                        if (portionItemDiv) {
                            portionItemDiv.querySelector('.portions-item__number').innerText = parseInt(portionItemDiv.querySelector('.portions-item__number').innerText) - 1
                        }
                    }
                }
                portionsItemNumberSpan.innerText = parseInt(portionsItemNumberSpan.innerText) - 1;
                const numberPortions = parseInt(portionsItemNumberSpan.innerText);
                item.numberPortions = numberPortions;
                console.log(basketListStore)
                if (numberPortions == 0) {
                    basketListStore = basketListStore.filter(item => item.numberPortions != "0");
                    if (!basketListStore.some(item => item.nameDishesUserLang == nameDishesUserLang)) {
                        const menuCardDiv = document.querySelector(`[data-id='${dishesId}']`);
                        if (menuCardDiv) {
                            menuCardDiv.classList.remove('active');
                        }
                    }
                    if (basketListStore.length == 0) {
                        basketBoxOpenButton.classList.remove('puls')
                        buttonSendOrder.classList.remove("active")

                    }
                }
            }
        })

    }
    saveData()
    basketCardRender()
}



function basketCardRender() {
    const basketListDiv = document.querySelector('.basket-list');
    basketListDiv.innerHTML = '';
    let basketTotalCost = 0;
    basketListStore.forEach(item => {
        const basketCardDiv = document.createElement('div');
        basketCardDiv.className = 'basket-card';
        basketCardDiv.setAttribute('id', item.portionId);
        basketCardDiv.innerHTML = `
                <div class="basket-card__head">
                    <img src="${item.imgSrc}" alt="">
                    <div class="basket-card__manager">
                        <div class="basket-card__buttons">
                            <button class="minus"><i class="fa-solid fa-minus"></i></button>
                            <span class="basket-card__quantity">${item.numberPortions}</span>
                            <button class="plus"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <span class="basket-card__total-cost">${item.portionCost * item.numberPortions} ${valutaSimbol}</span>
                    </div>
                </div>
                <div class="basket-card__info">
                    <h3>${item.nameDishesUserLang}</h3>
                    <h4>${item.nameDishesMainLang} (${item.mainLangCategory})</h4>
                    <p> 
                        <span class="portion-name">${item.portionName}</span>
                        —
                        <span class="portion-cost">${item.portionCost} ${valutaSimbol}</span>
                    </p>
                </div>
        `;
        basketTotalCost += parseInt(item.portionCost * item.numberPortions);

        const portionsItemNumberSpan = basketCardDiv.querySelector('.basket-card__quantity');
        const buttonMinus = basketCardDiv.querySelector(".minus");
        buttonMinus.addEventListener('click', () => {
            updateBasket(
                'basket',
                'minus',
                portionsItemNumberSpan,
                item.mainLangCategory,
                item.nameDishesUserLang,
                item.nameDishesMainLang,
                item.portionName,
                item.portionCost,
                item.imgSrc,
                item.dishesId,
                item.portionId
            )
        })
        const buttonPlus = basketCardDiv.querySelector(".plus");
        buttonPlus.addEventListener('click', () => {
            updateBasket(
                'basket',
                'plus',
                portionsItemNumberSpan,
                item.mainLangCategory,
                item.nameDishesUserLang,
                item.nameDishesMainLang,
                item.portionName,
                item.portionCost,
                item.imgSrc,
                item.dishesId,
                item.portionId
            )
        })
        basketListDiv.appendChild(basketCardDiv);
    })
    document.querySelector("#basketBoxTotalCostNumber").innerText = `${basketTotalCost} ${valutaSimbol}`
}


//функция отправки заказа
buttonSendOrder.addEventListener('click', sendOrder)
function sendOrder() {
    if (tableNumber != 'door' && tableNumber != null && tableNumber != "" && tableNumber != 'null') {
        if (orderListStore.length == 0) {//если заказ отправляеися впервый раз
            const orderNumber = createOrderNumber().toTg;
            let dishesListMessage = ``;
            let dishesNumber = 0;
            let totalCostOrder = 0
            basketListStore.forEach(basketItem => {
                dishesNumber++;
                totalCostOrder += basketItem.portionCost * basketItem.numberPortions;
                dishesListMessage += `
${dishesNumber}. ${basketItem.nameDishesMainLang} (${basketItem.mainLangCategory})
    *${basketItem.portionName} × ${basketItem.numberPortions}* = ${basketItem.portionCost * basketItem.numberPortions}${valutaSimbol}.
    ${basketItem.nameDishesUserLang}.
                `
            })

            const messageText = `
${words[mainLang].newOrderTitle}
${words[mainLang].userLang} ${userLang}
${words[mainLang].tableNumber} ${tableNumber}    
${words[mainLang].orderNumber}
${orderNumber}

${words[mainLang].dishesList}
${dishesListMessage}

${words[mainLang].totalCost} ${totalCostOrder}${valutaSimbol}.*
            `
            console.log(messageText)
            sendMassageToTg(messageText)
        }
        else {//если человек добовляет что то к заказу 
            const orderNumber = orderNumberGlobal.toTg;
            let dishesListMessageOld = ``;
            let dishesListMessageNew = ``;
            let dishesNumber = 0;
            let totalCostOrder = 0;
            orderListStore.forEach(basketItem => {
                dishesNumber++;
                totalCostOrder += basketItem.portionCost * basketItem.numberPortions;
                dishesListMessageOld += `
${dishesNumber}. ${basketItem.nameDishesMainLang} (${basketItem.mainLangCategory})
    *${basketItem.portionName} × ${basketItem.numberPortions}* = ${basketItem.portionCost * basketItem.numberPortions}${valutaSimbol}.
    ${basketItem.nameDishesUserLang}.
                `
            })

            basketListStore.forEach(basketItem => {
                dishesNumber++;
                totalCostOrder += basketItem.portionCost * basketItem.numberPortions;
                dishesListMessageNew += `
${dishesNumber}. ${basketItem.nameDishesMainLang} (${basketItem.mainLangCategory})
    *${basketItem.portionName} × ${basketItem.numberPortions}* = ${basketItem.portionCost * basketItem.numberPortions}${valutaSimbol}.
    ${basketItem.nameDishesUserLang}.
                `
            })
            const messageText = `
${words[mainLang].addOrderTitle}
${words[mainLang].userLang} ${userLang}
${words[mainLang].tableNumber} ${tableNumber}    
${words[mainLang].orderNumber}
${orderNumber}

${words[mainLang].oldDishes}
${dishesListMessageOld}  
---------------------------

${words[mainLang].newDishes}
${dishesListMessageNew}

${words[mainLang].totalCost} ${totalCostOrder}${valutaSimbol}.*
            `
            sendMassageToTg(messageText)
        }

    } else {
        renderDialogBox('tableNumber', `${words[userLang].requestTableNumber}`)
    }

}


//функция для отправки сообщения в тг
async function sendMassageToTg(text, type = 'order', totalCost = '') {
    try {
        fetch('https://send-message-to-tg.nikitakadilnikovof.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: globalData.chatId,
                messageText: text,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    if (type == "order") {
                        renderDialogBox('info', `${words[userLang].sendOk}`);
                        updateOrderList();
                        saveData();
                        basketBoxOpenButton.classList.remove('puls');
                        buttonSendOrder.classList.remove("active");
                        buttonOpenOrderList.classList.add('active');
                        orderNumberSpan.innerText = orderNumberGlobal.toSite;
                    }
                    if (type == 'paymentRequest') {
                        orderListStore = [];
                        basketListStore = [];
                        orderNumberGlobal = '';
                        tableNumber = '';
                        saveData();
                        renderOrderList();
                        renderMenu(categoryListDiv.querySelector('button').innerText);
                        basketCardRender();
                        orderBoxDiv.classList.remove('show')
                        buttonOpenOrderList.classList.remove('active');

                        renderDialogBox('info', `${words[userLang].finalMessage}${totalCost}<br><a target="_blank" href="${globalData.feedBackLink}">${words[userLang].footerReviewText}</a>`);
                    }
                }else{
                       renderDialogBox('info', `${words[userLang].messageError}`);
                }
            })
    }
    catch (error) {
        renderDialogBox('info', `${words[userLang].messageError}`);
        return 'error';
    }
}


//функция для рендара картачек заказа
function renderOrderList() {
    orderListDiv.innerHTML = 'orderBoxTotalCostNumber';
    let orderListTotalCost = 0;
    orderListStore.forEach(orderItem => {
        const orderCardDiv = document.createElement('div');
        orderCardDiv.className = 'order-card';
        const itemTotalCost = `${parseInt(orderItem.numberPortions) * parseInt(orderItem.portionCost)}`;
        orderListTotalCost += parseInt(itemTotalCost);
        orderCardDiv.innerHTML = `
            <div class="order-card__head">
                <img src="${orderItem.imgSrc}" alt="">
                <div class="order-card__total-cost">
                    <span id="orderCardAmountNumber">${orderItem.numberPortions}</span>
                    <span id="orderCardTotalCost">${itemTotalCost}${valutaSimbol}</span>
                </div>
            </div>
            <div class="order-card__info">
                <h2>${orderItem.nameDishesUserLang}</h2>
                <h3>${orderItem.nameDishesMainLang}</h3>
                <p class="order-card__portion">
                    <span id="orderCardPortionName">${orderItem.portionName}</span>
                    <span id="orderCardPortionCost">${orderItem.portionCost}${valutaSimbol}</span>
                </p>
                <span id="orderCardTime"><i class="fa-regular fa-clock"></i> ${orderItem.orderTime}</span>
            </div>
        `;
        orderListDiv.appendChild(orderCardDiv)
    })
    orderBoxTotalCostNumber.innerHTML = `${orderListTotalCost}${valutaSimbol}`
}

//функция для сохронения данных
function saveData() {
    const userData = {
        basketListStore,
        orderListStore,
        orderNumberGlobal,
    }
    localStorage.setItem(`userData-${globalData.cafeName}`, JSON.stringify(userData))
    localStorage.setItem('tableNumber', tableNumber)
}


//функция для диалоговых окан
function renderDialogBox(type, text) {
    dialogBoxDiv.innerHTML = '';
    switch (type) {
        case 'tableNumber':
            dialogBoxDiv.innerHTML = `
            <p>${text}</p>
            <input type="number" placeholder="№">
            <div class="dialog-box__buttons">
                <button class="button_ok">Ок</button>
                <button class="button_clouse">${words[userLang].cancel}</button>
            </div>
            `;
            const buttonOk = dialogBoxDiv.querySelector('.button_ok');
            buttonOk.addEventListener('click', () => {
                const inputText = dialogBoxDiv.querySelector('input').value;
                if (inputText == 'null' || inputText == '' || isNaN(inputText) || inputText === null) {
                    dialogBoxDiv.querySelector('p').innerText = `${words[userLang].tableNumberError}`
                } else {
                    tableNumber = parseInt(inputText);
                    sendOrder();
                    wrapperDiv.classList.remove('wrapper_active');
                }

            })
            const buttonClouse = dialogBoxDiv.querySelector('.button_clouse');
            buttonClouse.addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            wrapperDiv.classList.add('wrapper_active');
            break;

        case 'info':
            dialogBoxDiv.innerHTML = `
            <p>${text}</p>
            <div class="dialog-box__buttons">
                <button class="button_ok">Ок</button>
            </div>
            `;
            const buttonInfoOk = dialogBoxDiv.querySelector('.button_ok');
            buttonInfoOk.addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            wrapperDiv.classList.add('wrapper_active');
            break;

        case "selectPayMethod":
            dialogBoxDiv.innerHTML = `
            <p>${text}</p>
           
            <div class="dialog-box__buttons">
                <button id='cash' class="button_ok">${words[userLang].cash}</button>
                <button id='cart' class="button_ok">${words[userLang].card}</button>
                <button class="button_clouse">${words[userLang].cancel}</button>
            </div>
            `;
            const buttonCash = dialogBoxDiv.querySelector('#cash');
            const buttonCart = dialogBoxDiv.querySelector('#cart');
            const buttonClouseinPay = dialogBoxDiv.querySelector('.button_clouse');
            buttonClouseinPay.addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });

            buttonCash.addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
                sendPaymentRequest('cash')
            });

            buttonCart.addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
                sendPaymentRequest('cart')
            });

            wrapperDiv.classList.add('wrapper_active');
            break;
    }
}


//фунлция обновления блюд в заказе
function updateOrderList() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0'); // Часы
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Минуты
    const orderTime = `${hours} : ${minutes}`
    basketListStore.forEach(basketCard => {
        basketCard.orderTime = orderTime;
        orderListStore.push(basketCard)
    })
    console.log(orderListStore)
    basketListStore = [];
    renderMenu(categoryListDiv.querySelector('button').innerText);
    basketCardRender();
    renderOrderList();
}

//функция для отпрпрвке сообщения о оплате
function sendPaymentRequest(payMethod) {
    let dishesListMessage = ``;
    let dishesNumber = 0;
    let totalCostOrder = 0
    orderListStore.forEach(orderItem => {
        dishesNumber++;
        totalCostOrder += orderItem.portionCost * orderItem.numberPortions;
        dishesListMessage += `
${dishesNumber}. ${orderItem.nameDishesMainLang} (${orderItem.mainLangCategory})
    *${orderItem.portionName} × ${orderItem.numberPortions}* = ${orderItem.portionCost * orderItem.numberPortions}${valutaSimbol}.
    ${orderItem.nameDishesUserLang}.
        `
    })
    const messageText = `
${words[mainLang].orderPay}
${words[mainLang].userLang} ${userLang}
${words[mainLang].tableNumber} ${tableNumber}    
${words[mainLang].payMethod} ${payMethod}
${words[mainLang].orderNumber}
${orderNumberGlobal.toTg}

${words[mainLang].dishesList}
${dishesListMessage}

${words[mainLang].totalCost} ${totalCostOrder}${valutaSimbol}.*
    `
    sendMassageToTg(messageText, 'paymentRequest', `${totalCostOrder}${valutaSimbol}`)
}

//функция для создания номера заказа
function createOrderNumber() {

    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0'); // День
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяц
    const year = now.getFullYear(); // Год
    const hours = String(now.getHours()).padStart(2, '0'); // Часы
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Минуты
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Секунды

    const orderNumber = {
        toTg: `#N${day}\\_${month}\\_${year}\\_\\_${hours}\\_${minutes}\\_${seconds}\\_\\_${tableNumber}`,
        toSite: `${day}.${month}.${year} ${hours}:${minutes}:${seconds}-${tableNumber}`
    }
    orderNumberGlobal = orderNumber;
    return orderNumber;
}

buttonOpenOrderList.addEventListener("click", () => {
    orderBoxDiv.classList.add('show')
})
orderBoxButtonClouse.addEventListener("click", () => {
    orderBoxDiv.classList.remove('show')
})

buttonPayOrder.addEventListener("click", () => {
    renderDialogBox("selectPayMethod", `${words[userLang].selectPayMethod}`);
})

