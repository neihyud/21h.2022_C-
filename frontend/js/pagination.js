const pg = document.getElementById("pagination")
const btnNextPg = document.querySelector("button.next-page");
const btnPrevPg = document.querySelector("button.prev-page");
const btnFirstPg = document.querySelector("button.first-page");
const btnLastPg = document.querySelector("button.last-page");

export const valuePage = {
    truncate: true,
    curPage: 1,
    numberLinkTwoSide: 1,
    totalPages: 1
}

export function pagination() {
    const { truncate, curPage, totalPages, numberLinkTwoSide: delta } = valuePage

    let render = ""
    let renderTwoSide = ""
    let range = delta + 4
    let dot = '<div class="page--numbers-item">...</div>'

    let numberTruncateLeft = curPage - delta
    let numberTruncateRight = curPage + delta
    let countTruncate = 0

    let active = ""
    for (let pos = 1; pos <= totalPages; pos++) {
        active = pos === curPage ? "page-current" : ""
        if (totalPages >= 2 * range - 1 && truncate) {
            // > 3: Tối thiểu để có ...
            if (numberTruncateLeft > 3 && numberTruncateRight < totalPages - 3 + 1) {
                if (numberTruncateLeft <= pos && pos <= numberTruncateRight) {
                    renderTwoSide += renderPage(pos, active)
                }
            } else {
                if (
                    (curPage < range && pos <= range) ||
                    (curPage > totalPages - range && pos >= totalPages - range + 1) ||
                    pos == 1 || pos == totalPages
                ) {
                    render += renderPage(pos, active)
                } else {
                    countTruncate++;
                    if (countTruncate === 1) render += dot
                }
            }
        } else {
            render += renderPage(pos, active)
        }
    }

    if (renderTwoSide) {
        renderTwoSide = renderPage(1) + dot + renderTwoSide + dot + renderPage(totalPages)
        pg.innerHTML = renderTwoSide
    } else {
        pg.innerHTML = render
    }
}
// pagination()

function renderPage(index, active) {
    return `<div class="page--numbers-item ${active}" data-page="${index}">${index}</div>`
}

function handleButtonLeft() {
    if (valuePage.curPage === 1) {
        btnPrevPg.disabled = true;
        btnFirstPg.disabled = true;
    } else {
        btnPrevPg.disabled = false;
        btnFirstPg.disabled = false;
    }
}

function handleButtonRight() {
    if (valuePage.curPage === valuePage.totalPages) {
        btnNextPg.disabled = true;
        btnLastPg.disabled = true;
    } else {
        btnNextPg.disabled = false;
        btnLastPg.disabled = false;
    }
}

export function handleButton(element) {
    if (element.classList.contains("first-page")) {
        valuePage.curPage = 1;
    } else if (element.classList.contains("last-page")) {
        valuePage.curPage = valuePage.totalPages;
    } else if (element.classList.contains("prev-page")) {
        valuePage.curPage--;
    } else if (element.classList.contains("next-page")) {
        valuePage.curPage++;
    }
    else {
        let numberPage = element.getAttribute("data-page")
        numberPage = parseInt(numberPage)
        if (numberPage) {
            valuePage.curPage = numberPage
        }
    }

    handleButtonLeft()
    handleButtonRight()
    pagination()
}