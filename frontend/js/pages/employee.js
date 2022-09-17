import { displayLoading, hideLoading } from '/js/others/loading.js'
import { getData, deleteData, putData, postData } from '/js/others/handleAPI.js'
import { checkDate, checkEmail, formatDate, formatMoney } from '/js/others/help.js'
import { showSuccessToast, showErrorToast } from '/js/others/toast.js'
import { showError } from '/js/others/error.js'
import { valuePage, pagination, handleButton } from '/js/pagination.js'

// Tạo các chuỗi api
let hostname = 'http://localhost:48288';
let employeesAPI = hostname + '/api/v1/Employees';
let newCodeAPI = hostname + '/api/v1/Employees/new-code';
let getFilterAPI = hostname + '/api/v1/Employees/filter';
let positionsAPI = hostname + '/api/v1/Positions';
let departmentAPI = hostname + '/api/v1/Department';

$(document).ready(function () {
    getEmployees(employeesAPI);
    getPositions(positionsAPI);
    getDepartments(departmentAPI);
    pagination()

    initEvents();
});

// Kiểu form: add, edit
let _formModel = 'add';

function initEvents() {

    // Hiển thị popup form tạo nhân viên
    $('.js-open-form').click(function () {
        _formModel = "add"
        $('#js-dlg-employee').removeClass('hide');
        $('#js-dlg-employee').show();

        // Forcus vào ô mã nhân viên
        $('#js-dlg-employee input')[0].focus();

        resetForm();
        // Gán mã nhân viên tự động cho form:
        getNewCode().then((newCode) => {
            $('.fields-item .field--code').val(`${newCode}`);
        });
    });

    // Click icon close đóng dialog
    $('.icon-close').click(function () {
        $(this).parents('.dialog').hide();

        // reset lại form sau khi đóng
        $('input[required]').removeClass('input--error');
        $('input[required]').attr('title', '');
    });

    // Đóng dialog
    $('.btn--close').click(function () {
        $(this).parents('.dialog').hide();
    });

    // Click modal đóng dialog
    $('#js-dlg-employee').click((e) => {
        if (e.currentTarget === e.target) {
            $('#js-dlg-employee').hide();

            // reset lại form sau khi đóng
            $('input[required]').removeClass('input--error');
            $('input[required]').attr('title', '');
        }
    });

    // Check các trường đã nhập chưa
    $('input[required]').blur(function () {
        let value = this.value;
        if (!value) {
            $(this).addClass('input--error');
            $(this).attr('title', 'Vui lòng nhập trường này');
        } else {
            $(this).removeClass('input--error');
            $(this).attr('title', '');
        }
    });

    // Kiểm tra email nhập có hợp lệ không
    $('input[type=email]').blur(function () {
        let isEmail = checkEmail(this.value);
        if (!isEmail) {
            $(this).addClass('input--error');
            $(this).attr('title', 'Trường này phải là Email');
        } else {
            $(this).removeClass('input--error');
            $(this).removeAttr('title');
        }
    });

    // Thêm hoặc Sửa một nhân viên vào dữ liệu khi nhấn nút Save
    $('#js-dlg-employee .js-btn--save').click(function () {
        // Lấy tất cả giá trị từ các field trong form
        const fields = $('#js-dlg-employee input, #js-dlg-employee select');

        // Lấy Id của nhân viên vừa click
        let employeeId = $('.tr-current').attr('data-id');
        const employee = {};

        // Thêm các thuộc tính vào đối tượng employee
        for (const field of fields) {
            let valueField = field.value;
            employee[field.name] = valueField;
        }

        // Kiểm tra lỗi ở các ô input required trong form
        let errMessage = {};
        // Lấy tất cả ô input trong form employee
        const requiredInputs = $('#js-dlg-employee input[required]');
        for (const requiredInput of requiredInputs) {
            // Kiểm tra lỗi: nếu trường chưa nhập thêm thuộc tính error vào đối tượng errMessage
            if (!requiredInput.value) {
                errMessage.errorInput = 'Vui lòng nhập đầy đủ thông tin';
                $(requiredInput).addClass('input--error');
                $(requiredInput).attr('title', 'Vui lòng nhập trường này');
            }
        }

        // Kiểm tra lỗi ở ô input email
        if (!checkEmail($('input[type=email').val())) {
            errMessage.errorEmail = 'Email không đúng định dạng';
            $('input[type=email').addClass('input--error');
            $('input[type=email').attr('title', 'Trường này phải là Email');
        }

        // Lấy tất cả các ô nhập ngày tháng trong form employee
        const typeDateInputs = $(`#js-dlg-employee input[type="date"]`);
        for (const typeDateInput of typeDateInputs) {
            // Kiểm tra ngày tháng nhập có hợp lệ không
            if (checkDate(typeDateInput.value)) {
                errMessage.errorDate = 'Định dạng ngày không được phép lớn hơn ngày hiện tại';
            }
        }

        // Số lỗi của form = số thuộc tính trong đối tượng errMessage
        const numberError = Object.keys(errMessage).length;

        // Reset nội dung của popup thông báo lỗi
        $('#js-content-notify').innerText = '';

        // Tạo nội dung cho popup thông báo lỗi
        const contentMessage = Object.keys(errMessage)
            .map(function (objectKey, index) {
                var value = errMessage[objectKey];
                return `<p>${index + 1}. ${value}</p>`;
            })
            .join('\n');

        // Gán nội dung cho popup thông báo lỗi
        document.querySelector('#js-content-notify').innerHTML = contentMessage;

        // Đóng form employee khi không có lôi
        // Mở popup thông báo lỗi khi có lỗi
        if (!numberError) {
            $('#js-dlg-employee').hide();
        } else {
            $('.dialog--notify').show();
        }

        // Yêu cầu định nghĩa đầy đủ các trường
        if (!employee.salary) {
            employee.salary = 0;
        }

        // option[value="..."].attr("data-id")
        employee.positionID = $(`#popup__select--position option[value="${employee.positionName}"]`).attr("data-id");
        employee.departmentID = $(`#popup__select--department option[value="${employee.departmentName}"]`).attr("data-id");
        employee.createdBy = '';
        employee.modifiedBy = '';

        console.log("employee: ", employee)
        // Thực hiện hành động với form employee: tạo mới
        if (!numberError && _formModel === 'add') {
            addEmployee(employee);
        }

        // Thực hiện hành động với form employee: chỉnh sửa
        if (!numberError && _formModel === 'edit') {
            editEmployee(employee, employeeId);
        }
    });

    /**
     * $('...').dblclick("...") => sử dụng trong trường hợp
     *  selector đã có trong Dom từ ban đầu (bản scan từ ban đầu)
     * ===
     *  $(document).on(events [,selector][, handle])
     * => có thể sử dụng trong trường hợp selector thêm vào DOM sau
     */
    $(document).on('dblclick', 'table.js-list-employees tbody tr td', function () {
        _formModel = 'edit';
        $('#js-dlg-employee').show();

        // Lấy Id của nhân viên vừa click
        let employeeId = $(this).parents('tr').attr('data-id');

        // Cập nhập dữ liệu cho form employee
        setDataForFormEmployee(employeeId, false);
    });

    // Chọn một nhân viên trong danh sách
    $(document).on('click', 'table.js-list-employees tbody tr td', function () {
        $('tr.tr-current').removeClass('tr-current');
        $(this).parents('tr').addClass('tr-current');
    });

    // Xóa một nhân viên
    $('.js-icon--delete').on('click', function () {
        // $(".dialog--warning").removeClass('hide')

        // Lấy Id của nhân viên
        let employeeId = $('.tr-current').attr('data-id');

        // Có một nhân viên được chọn
        if (employeeId) {
            // Lấy mã nhân viên từ thẻ td đầu tiên của tr-current
            const employeeCode = document.querySelectorAll(`.tr-current td`)[0].innerText;
            document.querySelector('#js-content-warning').innerHTML =
                `
                <div class="popup__icon">
                    <i class="popup__icon--warning fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="popup__content-main">
                    Bạn có chắc chắn muốn xóa nhân viên <b>${employeeCode}</b> không?
                </div>
            `
            console.log("employeeID: ", employeeId);
            $('.dialog--warning').show();

            // Gán sự kiện onclick để xác nhận xóa nhân viên
            document.querySelector('.dialog--warning .js-btn--agree').onclick = function () {
                $('.dialog--warning').hide();
                deleteEmployee(employeeId)
            }
        }
    });

    // Nhân bản một nhân viên
    $('.js-icon--copy').click(function () {
        _formModel = 'add';
        $('#js-dlg-employee').show();

        // Lấy Id của nhân viên vừa click
        let employeeId = $('.tr-current').attr('data-id');

        // Cập nhập lại form Employee có mã nhân viên mới
        setDataForFormEmployee(employeeId, true);
    });


    // Lọc khi có sự thay đổi ở ô tìm kiếm
    $('#input-search').on('input', function () {
        getFilterEmployee();
    });

    // Lọc khi có sự thay đổi ở ô vị trí 
    $(document).on('change', ".tag-select--position", function () {
        getFilterEmployee()
    })

    // Lọc khi có sự thay đổi ở ô phòng ban
    $(document).on('change', ".tag-select--department", function () {
        getFilterEmployee()
    })

    // Sử lý sự kiện khi click vào các nút trong Pagination
    document.querySelector(".footer__panigations").onclick = function (e) {
        handleButton(e.target);
        getFilterEmployee()
    };

    document.getElementById("number-staff").onchange = function (e) {
        getFilterEmployee()
    }

}

// Lấy danh sách tất cả các nhân viên
function getEmployees(employeesAPI) {
    // Tạo loading spinner
    displayLoading()
    getData(employeesAPI)
        .then((data) => {
            let employees = 0;
            let totalCount = 0
            let pageSize = $("#number-staff").val()

            if (Object.keys(data).length == 2) {
                employees = data.employees
                totalCount = data.totalCount[0].TotalCount
            } else {
                employees = data
            }
            // Tắt loading spinner
            hideLoading()
            // Set số nhân viên của một trang là 10
            if (totalCount) {
                valuePage.totalPages = Math.ceil(totalCount / pageSize)
            }
            pagination()

            const htmls = employees
                .map((employee) => {
                    let dateOrBirth = formatDate(employee.dateOfBirth);
                    let salary = formatMoney(employee.salary)

                    //Chuyển đổi value của tag option sang text để hiển thị ra màn hình
                    //option[...].innerText, trong đó ... là số thứ tự của option trong thẻ select
                    let gender = $('#select--gender option')[employee.gender].innerText;
                    let workStatus = $('#select--status option')[employee.workStatus].innerText;

                    return `
                   <tr data-id = "${employee.employeeID}">
                        <td table-col-w="120" propValue="employeeCode">${employee.employeeCode}</td>
                        <td table-col-w="160" propValue="employeeName">${employee.employeeName}</td>
                        <td table-col-w="80"  propValue="gender">${gender}</td>
                        <td table-col-w="100" propValue="dateOfBirth" format="date">${dateOrBirth}</td>
                        <td table-col-w="100" propValue="phoneNumber">${employee.phoneNumber}</td>
                        <td table-col-w="200" propValue="email">${employee.email}</td>
                        <td table-col-w="120" propValue="positionName">${employee.positionName}</td>
                        <td table-col-w="160" propValue="departmentName">${employee.departmentName}</td>
                        <td table-col-w="100" propValue="salary" class="table-col--salary">${salary}</td>
                        <td table-col-w="" propValue="workStatus">${workStatus}</td>
                   </tr>
                    `;
                }).join('');

            document.querySelector('tbody').innerHTML = htmls;

            document.querySelector("#display-number-staff").innerText = `Hiển thị ${(valuePage.curPage - 1) * pageSize + 1}-${valuePage.curPage * pageSize}/${totalCount}`
            console.log('Number Employees: ', employees.length);
        })
        .catch((err) => {
            hideLoading()
            showError(".wrapper-table", "ERROR SERVER!!!")
        });
}

// Thêm một nhân viên vào DB
function addEmployee(employee) {
    postData(employeesAPI, employee)
        .then((res) => {
            // Tạo thành công
            if (res.status == 201) {
                // Cập nhập lại danh sách nhân viên
                getEmployees(employeesAPI);
                showSuccessToast("Bạn đã thêm thành công!!")
            } else {
                showErrorToast("Có lỗi xảy ra, bạn chưa thêm nhân viên thành công!!!")
            }
        })
        .catch((err) => console.log(err.message));
}

// Chỉnh sửa một nhân viên trong DB
function editEmployee(employee, id) {
    putData(employeesAPI, employee, id)
        .then((res) => {
            // Cập nhập lại danh sách nhân viên
            if (res.status == 200) {
                showSuccessToast("Bạn đã chỉnh sửa thành công")
                getEmployees(employeesAPI);
            } else {
                showErrorToast(`Có lỗi xảy ra, bạn chưa sửa thành công!!!"`)
            }
        })
        .catch((err) => {
            console.log(err.message)
        });
}

// Xóa một nhân viên trong DB
function deleteEmployee(employeeId) {
    deleteData(employeesAPI, employeeId)
        .then((res) => {
            // Server trả về status = 200 => thành công
            if (res.status == 200) {
                showSuccessToast("Bạn đã xóa thành công")
                // Cập nhập lại danh sách nhân viên
                getEmployees(employeesAPI);
            } else {
                showErrorToast(`Có lỗi xảy ra, bạn chưa xóa được nhân viên`)
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

/**
 * Set giá trị cho form nhân viên khi dbclick hoặc click vào nút nhân bản
 * @param employeeId : id của một nhân viên
 * @param isNewCode : form có set data mã nhân viên mới không
 */
function setDataForFormEmployee(employeeId, isNewCode) {
    // Lấy thông tin một nhân viên
    getData(`${employeesAPI}/${employeeId}`).then(async (employee) => {
        // Lấy ra tất cả các ô thông tin trong popup form
        const fields = $('#js-dlg-employee input, #js-dlg-employee select');

        for (const field of fields) {
            // Lấy giá trị thuộc tính name của từng field
            let propValue = field.getAttribute('name');

            // Chuẩn bị giá trị mới cho field
            let newInputValue = employee[propValue];

            // Format date
            if (field.getAttribute('type') === 'date') {
                // Chuyển sang định sang có /. eg: 12/12/2022
                let coverNewInputValue = formatDate(newInputValue);

                // Chuyển về kiểu giá trị của thẻ input[type="date"]. eg: 12/12/2022 => 2022-12-12
                newInputValue = coverNewInputValue.split('/').reverse().join('-');
            }

            // Lấy tên thẻ để gán giá trí: input hoặc select
            let tagNameField = field.tagName;

            // Gán giá trị cho field
            $(`#js-dlg-employee ${tagNameField}[name="${propValue}"]`).val(newInputValue);
        }

        // Tạo mã nhân viên mới
        if (isNewCode) {
            await getNewCode().then((newCode) => {
                $('.fields-item .field--code').val(`${newCode}`);
            });
        }
    });
}

// Lấy mã nhân viên mới
async function getNewCode() {
    let newCode = await fetch(newCodeAPI);
    return newCode.text();
}

// Lọc danh sách nhân viên
function getFilterEmployee() {
    // Lấy ra tên hiện tại của ô select position để lọc
    var namePosition = $('.tag-select--position').val();

    // Lấy ra tên hiện tại của ô select department để lọc
    var nameDepartment = $('.tag-select--department').val();
    let keyword = $('#input-search').val() || '';

    // Lấy ID của ô select position hiện tại
    let positionID = $(`.tag-select--position option[value="${namePosition}"]`).attr('data-id') || '';

    // Lấy ID của ô select department hiện tại
    let departmentID = $(`.tag-select--department option[value="${nameDepartment}"]`).attr('data-id') || '';

    let pageSize = $("#number-staff").val()

    let filterAPI = `${getFilterAPI}?keyword=${keyword}&positionID=${positionID}&departmentID=${departmentID}&pageSize=${pageSize}&pageNumber=${valuePage.curPage}`;

    getEmployees(filterAPI);
}

// Lấy danh sách các vị trí
function getPositions() {
    fetch(positionsAPI)
        .then((res) => res.json())
        .then((positions) => {
            const htmls = positions.map((position) => {
                return `<option data-id= "${position.positionID}" value="${position.positionName}">${position.positionName}</option> `;
            }).join('');

            document.getElementById('popup__select--position').innerHTML = htmls;
            document.getElementById('select--position').innerHTML =
                '<option>Tất cả vị trí</option>' + htmls;
        });
}

// Lấy danh sách các phòng ban
function getDepartments() {
    fetch(departmentAPI)
        .then((res) => res.json())
        .then((departments) => {
            const htmls = departments
                .map((department) => {
                    return `<option data-id="${department.departmentID}" value ="${department.departmentName}">${department.departmentName}</option>`;
                })
                .join('');
            document.getElementById('popup__select--department').innerHTML = htmls;
            document.getElementById('select--department').innerHTML = '<option>Tất cả phòng ban</option>' + htmls;
        });
}

// Làm trống các ô input trong form
function resetForm() {
    const fields = $('#js-dlg-employee input');
    for (const field of fields) {
        // Đối với field Date
        if (field.getAttribute('type') == 'date') {
            // Format sang ngày hiện tại để gán giá trị mặc định cho input[type="date"]
            let currentDate = formatDate(new Date());

            // Chuyển về kiểu giá trị của thẻ input[type="date"]. eg: 12/12/2022 => 2022-12-12
            currentDate = currentDate.split('/').reverse().join('-');
            field.value = currentDate;
        } else {
            field.value = '';
        }
    }
}
