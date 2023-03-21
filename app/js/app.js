// Import vendor jQuery plugin example
// import '~/app/libs/mmenu/dist/mmenu.js'
import 'jquery';
import 'bootstrap/js/src/modal.js' // Optional Bootstrap Modal

// mobile menu

function burgerMenu(selector) {
    let menu = $(selector);
    let button = menu.find('.header__mobile_button', '.header__mobile-lines');
    let links = menu.find('.header__mobile-link');
    let overlay = menu.find('.header__mobile-overlay');

    button.on('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    links.on('click', () => toggleMenu());
    overlay.on('click', () => toggleMenu());

    function toggleMenu() {
        menu.toggleClass('header__mobile_active');

        if (menu.hasClass('header__mobile_active')) {
            $('body').css('overlow', 'hidden');
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'hidden';
            document.body.addEventListener('touchmove', function (e) {
                e.preventDefault();
            });
        } else {
            $('body').css('overlow', 'visible');
            document.body.style.overflow = 'hidden scroll';
            document.body.style.touchAction = 'scroll';
        }
    }
}

// get data shop

const url = 'http://localhost:3004/shops';

// add modal

const name = document.getElementById('name');
const domain = document.getElementById('domain');
const scheme = document.getElementById('scheme');

// edit modal

const nameEdit = document.getElementById('nameEdit');
const domainEdit = document.getElementById('domainEdit');
const schemeEdit = document.getElementById('schemeEdit');

const send = document.getElementById('send');
const edit = document.getElementById('edit');
const contentShop = document.querySelector('.shop__table-content');

send.disabled = true;
edit.disabled = true;

const state = {
    shops: []
}

const createShop = (index, name, domain) => `
<div class="shop__table-row">
    <div class="shop__table-row-cell-num">
        ${index}
    </div>
    <div class="shop__table-row-cell-name">
        ${name}
    </div>
    <div class="shop__table-row-cell-adress">
        ${domain}
    </div>
    <div class="shop__table-row-cell-action">
        <div class="shop__table-row-cell-action-btn shop__table-row-cell-action-btn_edit" onClick="dataEditShop(${index - 1})" data-bs-toggle="modal" data-bs-target="#editShop">
            <span>Редактировать</span>
        </div>
        <div class="shop__table-row-cell-action-btn shop__table-row-cell-action-btn_delete" onClick="deleteShop(${index - 1})">
            <span>Удалить</span>
        </div>
    </div>
</div>
`;

let status = function (response) {
    if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText))
    }
    return Promise.resolve(response)
}
let json = function (response) {
    return response.json()
}

function getShops() {
    fetch(url)
        .then(status)
        .then(json)
        .then(function (data) {
            contentShop.innerHTML = '';
            state.shops = data;
            for (let i = 0; i < state.shops.length; i++) {
                contentShop.innerHTML += createShop(i + 1, state.shops[i].name, state.shops[i].domain);
            }
        })
        .catch(function (error) {
            console.log('error', error);
        });
}

function postShop(method, requestUrl, body = null) {

    const headers = {
        'Content-Type': 'application/json'
    }

    return fetch(requestUrl, {
        method: method,
        body: JSON.stringify(body),
        headers: headers
    })
        .then(response => {
            return response.json()
        })
}

send.addEventListener("click", async () => {

    let data = {
        "id": Number(makeId()),
        "name": name.value,
        "domain": domain.value + '.work5.ru',
        "scheme": scheme.value
    }

    await postShop('POST', url, data)
        .then(response => console.log(response))
        .catch(err => console.log('err', err))


    cleanData();
    getShops();


});

window.deleteShop = async (index) => {

    const idShop = String(state.shops[index].id);

    await fetch(url + "/" + idShop, {
        method: "DELETE"
    });

    getShops();

}

window.dataEditShop = async (index) => {

    const valueSelect = state.shops[index].name; // for validation

    const editId = state.shops[index].id;
    nameEdit.value = state.shops[index].name;
    domainEdit.value = String(state.shops[index].domain).slice(0, -9);
    schemeEdit.value = state.shops[index].scheme;

    edit.addEventListener("click", async () => {

        const data = {
            "name": nameEdit.value,
            "domain": domainEdit.value + '.work5.ru',
            "scheme": schemeEdit.value
        }

        await postShop('PUT', url + '/' + String(editId), data)
            .then(response => console.log(response))
            .catch(err => console.log('err', err));

        getShops();

    });

    //validation edit modal

    let booleanDomain = false;
    let booleanName = false;

    nameEdit.addEventListener("click", () => {

        nameEdit.value != valueSelect ? booleanName = false : booleanName = true;

        booleanName != booleanDomain ? edit.disabled = true : edit.disabled = false;

    });

    domainEdit.addEventListener("click", () => {

        domainEdit.addEventListener("input", () => {

            domainEdit.value.length <= 6 ? booleanDomain = true : booleanDomain = false;

            domainEdit.onkeyup = function () {

                if (domainEdit.value.search(expr) !== -1) {

                    domainEdit.value = '';

                }

            }

            booleanName != booleanDomain ? edit.disabled = true : edit.disabled = false;

        });

    });

}

// validation required, minlength 6, delete work5 in input field modal

const blackList = ['work5', 'work-5'];

const expr = new RegExp(blackList.join('|'));

domain.addEventListener("click", () => {

    domain.addEventListener("input", () => {

        domain.value.length <= 6 ? send.disabled = true : send.disabled = false;

        domain.onkeyup = function () {

            if (domain.value.search(expr) !== -1) {

                domain.value = '';

            }

        }

    })
});

function makeId() {
    const chars = "123456789";
    const idLength = 6;
    let id = "";
    for (let i = 0; i <= idLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        id += chars.substring(randomNumber, randomNumber + 1);
    }
    return id;
}

function cleanData() {
    name.value = 'Стандартный';
    domain.value = '';
    scheme.value = 'Классическая';
}

burgerMenu('.header__mobile');
getShops();
