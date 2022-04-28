
const file = getFile('https://www.monogo.pl/competition/input.txt')

file.then(parseHttpResponse)
    .then(response => groupProduts(response, ['colors', 'sizes']))
    .then(response => filterProducts(response, ['colors', 'sizes'], 200))
    .then(response => getValueOfHighestAndLowestPrice(response))
    .then(response => getAlaFibonacciPrice(response))
    .then(response => console.log(response))

// START - HELPER FUNCTIONS //
function handleError(err) {
    console.warn(err);
    return new Response(JSON.stringify({
        sizes: [], products: [], colors: [], selectedFilters: {}
    }));
};

function parseHttpResponse(response) {
    try {
        console.log(response);
        if (response) {
            return response;
        } else {
            throw Error(response);
        }
    } catch (e) {
        return Promise.reject(response);
    }
}

async function getFile(url) {
    const file = await (fetch(url).catch(handleError));
    const response = await file.json();
    return response;
}

function convertNumberFromString(str) {
    return parseInt(str)
}

// END - HELPER FUNCTIONS //


function groupProduts(response, groupNames = []) {
    let { products, selectedFilters } = response
    products = products.map((product) => {
        const productId = parseInt(product.id);
        const params = groupNames.map((param) => ({ [param]: groupById(response[param], productId) }));
        const objParams = Object.assign({}, ...params)
        return { ...product, ...objParams };
    });
    return { products, selectedFilters };
}


function groupById(attr = [], productId = NaN) {
    return attr.find(v => convertNumberFromString(v?.id) === productId)?.value || null
}

function filterProducts(response, selFilters = [], price = NaN) {
    let { products, selectedFilters } = response;
    return products.filter(product => {
        const filters = selFilters.map(filter => selectedFilters[filter].includes(product[filter]));
        const filterByPrice = product.price > price;
        return !filters.includes(false) && filterByPrice
    });
}

function getValueOfHighestAndLowestPrice(products = []) {
    let lowestPrice = 0;
    let highestPrice = 0;
    products.forEach(({ price }) => {
        if (price < lowestPrice || lowestPrice === 0) {
            lowestPrice = price
        }

        if (price > highestPrice) {
            highestPrice = price;
        }
    })

    return { products, value: convertNumberFromString((lowestPrice * highestPrice).toFixed(0))};
}

function getAlaFibonacciPrice(response) {
    const array = response.value.toString().split('');
    const sumAfter = 2;
    let currentState = 0;
    let cachedValue = 0;

    let result = [];
    array.forEach((v) => {
        const value = convertNumberFromString(v);

        if (currentState <= sumAfter) {
            currentState++;
            cachedValue = cachedValue + value;
        }
        if (currentState === sumAfter) {
            result.push(cachedValue);
            currentState = 0;
            cachedValue = 0;
        }
    });

    return { ...response, result };
}
