// Định dạng hiển thị ngày tháng năm
export function formatDate(date) {
    try {
        if (date) {
            date = new Date(date);

            // Lấy ra ngày:
            var dateValue = date.getDate();
            dateValue = dateValue < 10 ? `0${dateValue}` : dateValue;

            // lấy ra tháng:
            let month = date.getMonth() + 1;
            month = month < 10 ? `0${month}` : month;

            // lấy ra năm:
            let year = date.getFullYear();

            return `${dateValue}/${month}/${year}`;
        } else {
            return '';
        }
    } catch (error) {
        console.log(error);
    }
}

//Định dạng hiển thị tiền VND
export function formatMoney(money) {
    try {
        // Định dạng tiền: 2000000 => 2.000.000 VND
        money = money.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });

        // Trả về money khi bỏ "VND": 2.000.000 VND => 2.000.000
        return money.slice(0, -3);
    } catch (error) {
        console.log(error);
    }
}

//Kiểm tra trường nhập có phải là một email không
export function checkEmail(email) {
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}

// Kiểm tra ngày được cài đặt có lớn hơn ngày hiện tại không
export function checkDate(date) {
    var today = new Date();
    // Chuyển đổi ngày hiện tại trong trường
    var dateField = new Date(date);
    return dateField.getTime() > today.getTime();
}
