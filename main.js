// https://wolnelektury.pl/api/epochs/?format=json
let dataWrapper = $("#dataWrapper");
let paginationWrapper = $("#pagination");
let fetchButtons = Array.from(document.querySelectorAll('#navigation button.btn'));

let state = {
    'querySet': [],
    'page': 1,
    'rows': 20,
    'window': 7
}


for (element of fetchButtons){
    element.onclick = function(e){
        $("#naglowekDanych").html(e.target.innerHTML);
        getData(e.target.value);
    };
}



function getData(endpoint){
    dataWrapper.empty();
    paginationWrapper.empty();

    url = 'https://wolnelektury.pl/api/' + endpoint + '/?format=json';

    fetch(url)
    .then(response => response.json())
    .then(data => {
        
        state.querySet = data;
        state.page = 1;
        populateDataWrapper(data);
        if (endpoint === "books"){
            $("#naglowekDanych").html('Utwory dostępne na <a href="https://wolnelektury.pl">wolnelektury.pl</a>');
        }
        
        
    });
    
}



function generateDescription(element, idx){
    let kontent = "";
    if (element.title && element.author) 
        kontent =  `
            <div class="data-column">
                <div class="fs-4">Tytuł: <b>${element.title}</b></div>
                <div class="fs-4">Autor: <em>${element.author}</em></div>
            </div>
            <div class="data-column"><a target='_blank' href='${element.url.slice(0,-1)}.html' class="btn btn-outline-info">Czytaj</a></div>`;
    else 
        kontent = element.name;
    return kontent;
}


// https://www.youtube.com/watch?v=mslD-bpvjiU tutorial on pagination
function paginationFc(querySet, page, rows){
    let trimStart = (page - 1) * rows;
    let trimEnd = trimStart + rows;
    let trimmedData = querySet.slice(trimStart, trimEnd);

    let pages = Math.ceil(querySet.length / rows);
    return {
        'querySet': trimmedData,
        'pages': pages
    }
}

function pageButtons(pages, dataSet){ 
    paginationWrapper.empty();

    let maxLeft = (state.page - Math.floor(state.window / 2));
    let maxRight = (state.page + Math.floor(state.window / 2));
    if (maxLeft < 1){
        maxLeft = 1;
        maxRight = state.window;
    }
    if (maxRight > pages){
        maxLeft = pages - (state.window - 1);
        maxRight = pages;

        if (maxLeft < 1) maxLeft = 1; 
    }
    
    let previousPage = state.page;
    --previousPage;
    if (previousPage < 1){
        previousPage = 1;
    }
    paginationWrapper.append(`<li class="page-item "><button value=${1} class="page page-link"><i class="fas fa-angle-double-left"></i></button></li>`)
    paginationWrapper.append(`<li class="page-item "><button value=${previousPage} class="page page-link"><i class="fas fa-chevron-left"></i></button></li>`)

    for (let page = maxLeft; page <= maxRight; page++){
        paginationWrapper.append(`<li class="page-item"><button value=${page} class="aboba page page-link">${page}</button></li>`);
    }
    
    let nextPage = state.page;
    ++nextPage
    if (nextPage > pages){
        nextPage = pages;
    }
    paginationWrapper.append(`<li class="page-item"><button value=${nextPage} class="page page-link"><i class="fas fa-chevron-right"></i></button></li>`)
    paginationWrapper.append(`<li class="page-item"><button value=${pages} class="page page-link"><i class="fas fa-angle-double-right"></i></button></li>`)

    // we only want to have active class on pages with numbers and not arrows
    $(".page.aboba[value="+(state.page)+"]").parent().addClass("active");


    $(".page").on("click", function(){
        dataWrapper.empty();
        paginationWrapper.empty();
        state.page = Number($(this).val());
        populateDataWrapper(dataSet);
    });

    // show how many records has been shown
    $("#iloscWierszy").html(dataSet.length)
}

function populateDataWrapper(dataSet){
    dataWrapper.empty();
    let data = paginationFc(dataSet, state.page, state.rows);
    
    data.querySet.forEach(function(element) {
        let li = `<li class="list-group-item">${generateDescription(element)}</li>`;
        dataWrapper.append(li);
        console.log(element);
    });
    pageButtons(data.pages, dataSet);
}

$("#confirmSearchTerm").on("click", function(){
    let searchTerm = $("#searchTerm").val().toLowerCase().trim();
    let newQuerySet = [];
    for (el of state.querySet){
        let compare = JSON.stringify(el).toLowerCase();
        if (compare.indexOf(searchTerm) != -1){
            newQuerySet.push(el);
        }
    }
    if (newQuerySet){ // if something matched the search term make sure to change the state.page to the first page, otherwise it stays on the previous "active" page
        state.page = 1;
    }
    
    populateDataWrapper(newQuerySet);
});

getData("books");
