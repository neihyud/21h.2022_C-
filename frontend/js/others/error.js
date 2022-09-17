export function showError(selector) {
    document.querySelector(selector).innerHTML = `
        <div class="error error-500"></div>
    `
}

export function hideError(selector) {
    document.querySelector(selector).classList.add("hide")
}