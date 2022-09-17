using Dapper;
using Microsoft.AspNetCore.Mvc;
using MISA.HUST._21H._2022.API.Entities;
using MySqlConnector;

namespace MISA.HUST._21H._2022.API.Controllers
{
    [Route("api/v1/[controller]")]
    // [controller] == Employees - (EmployeesController)
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        /// <summary>
        /// API Lấy danh sách tất cả các nhân viên
        /// </summary>
        /// <returns>Danh sách tất cả nhân viên</returns>
        /// Created by: NDHien 08/09/2022
        [HttpGet]
        public IActionResult GetAllEmployees()
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn SELECT
                string getAllEmployeesCommand = "SELECT * FROM employee;";

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                var employees = mySqlConnection.Query<Employee>(getAllEmployeesCommand);

                // Đếm số lượng nhân viên
                var totalCountCommand = $"SELECT count(EmployeeID) AS TotalCount FROM employee";
                var totalCount = mySqlConnection.Query(totalCountCommand);
                // Xử lý kết quả trả về từ DB
                if (employees != null)
                {
                    return StatusCode(StatusCodes.Status200OK, new { employees, totalCount });
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }


        /// <summary>
        /// API Lấy thông tin chi tiết một nhân viên
        /// </summary>
        /// <param name="employID">ID nhân viên</param>
        /// <returns>Thông tin chi tiết một nhân viên</returns>
        /// Created By: NDHien (08/09/2002)
        [HttpGet]
        [Route("{employeeID}")]
        public IActionResult GetEmployeeByID([FromRoute] Guid employeeID)
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn
                string getEmployeeCommand = "SELECT * FROM employee e WHERE e.EmployeeID = @EmployeeID";

                // Chuẩn bị tham số đầu vào cho truy vấn
                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeID", employeeID);

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                var employee = mySqlConnection.QueryFirstOrDefault<Employee>(getEmployeeCommand, parameters);
                // Xử lý kết quả trả về từ DB
                if (employee != null)
                {
                    return StatusCode(StatusCodes.Status200OK, employee);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }

        /// <summary>
        /// API Lọc danh sách nhân viên có điều kiện tìm kiếm và phân trang
        /// </summary>
        /// <param name="keyword">Từ khóa tìm kiếm (Mã nhân viên, Tên nhân viên, Số điện thoại)</param>
        /// <param name="positionID">ID vị trí</param>
        /// <param name="departmentID">ID phòng ban</param>
        /// <param name="limit">Số bản ghi trong một trang</param>
        /// <param name="offset">Vị trí bản ghi bắt đầu lấy dữ liệu</param>
        /// <returns>Danh sách nhân viên</returns>
        /// Created By: NDHien (09/09/2022)
        [HttpGet]
        [Route("filter")]
        public IActionResult FilterEmployees(
            [FromQuery] string? keyword,
            [FromQuery] string? positionID,
            [FromQuery] string? departmentID,
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageNumber = 1
            )
        {
            // Khởi tạo kết nối tới Database
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                int offset = (pageNumber - 1) * pageSize;
                var mySqlConnection = new MySqlConnection(connectionString);

                var orConditions = new List<string>();
                var andConditions = new List<string>();
                string whereClause = "";

                if (keyword != "")
                {
                    orConditions.Add($"EmployeeCode LIKE '%{keyword}%'");
                    orConditions.Add($"EmployeeName LIKE '%{keyword}%'");
                    orConditions.Add($"PhoneNumber LIKE '%{keyword}%'");
                }
                if (orConditions.Count > 0)
                {
                    whereClause = $"({string.Join(" OR ", orConditions)})";
                }
                if (positionID != "")
                {
                    andConditions.Add($"positionID LIKE '%{positionID}%'");
                }

                if (departmentID != "")
                {
                    andConditions.Add($"DepartmentID LIKE '%{departmentID}%'");
                }

                if (andConditions.Count > 0)
                {
                    whereClause += $" AND {string.Join(" AND ", andConditions)}";
                }

                // Thực hiện gọi vào DB với tham số đầu vào ở trên
                var filterEmployeeCommand = $"SELECT * FROM employee WHERE {whereClause} ORDER BY ModifiedDate DESC LIMIT {pageSize} OFFSET {offset}";
                if (keyword == null)
                {
                    filterEmployeeCommand = filterEmployeeCommand.Replace("WHERE  AND", "WHERE");
                }

                var totalCountCommand = $"SELECT count(EmployeeID) AS TotalCount FROM employee WHERE {whereClause}";
                var employees = mySqlConnection.Query<Employee>(filterEmployeeCommand);
                var totalCount = mySqlConnection.Query(totalCountCommand);
                // Xử lý kết quả trả về
                if (employees != null)
                {
                    return StatusCode(StatusCodes.Status200OK, new { employees, totalCount });
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }

        }


        /// <summary>
        /// API Thêm mới một nhân viên
        /// </summary>
        /// <param name="employee">Đối tượng nhân viên cần thêm mới</param>
        /// <returns>ID của nhân viên vừa thêm mới</returns>
        /// Created By: NDHien (31/08/2022)
        [HttpPost]
        public IActionResult InsertEmployee([FromBody] Employee employee)
        {
            // Khởi tạo kết nối tới Database
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh INSERT INTO
                string insertEmployeeCommand = "INSERT INTO employee (EmployeeID, EmployeeCode, EmployeeName, DateOfBirth, Gender, IdentityNumber, " +
                    "IdentityIssuedDate, IdentityIssuedPlace, Email, PhoneNumber, PositionID, PositionName, DepartmentID, DepartmentName, TaxCode, " +
                    "Salary, JoiningDate, WorkStatus, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy) " +
                    "VALUES (@EmployeeID, @EmployeeCode, @EmployeeName, @DateOfBirth, @Gender, @IdentityNumber, " +
                    "@IdentityIssuedDate, @IdentityIssuedPlace, @Email, @PhoneNumber, @PositionID, @PositionName, " +
                    "@DepartmentID, @DepartmentName, @TaxCode, @Salary, @JoiningDate, @WorkStatus, @CreatedDate, " +
                    "@CreatedBy, @ModifiedDate, @ModifiedBy);";

                // Chuẩn bị tham số đầu vào cho câu lệnh INSERT INTO
                // employeeID : return cho client khi insert thành công 
                var employeeID = Guid.NewGuid(); // Guid.NewGuid() --> Tạo ra một chuỗi 36 kí tự, mỗi lần sẽ tạo ra một chuỗi khác nhau, khả năng trùng là rất thấp (6*10^-11)
                var parameters = new DynamicParameters();

                parameters.Add("@EmployeeID", employeeID);
                parameters.Add("@EmployeeCode", employee.EmployeeCode);
                parameters.Add("@EmployeeName", employee.EmployeeName);
                parameters.Add("@DateOfBirth", employee.DateOfBirth);
                parameters.Add("@Gender", employee.Gender);
                parameters.Add("@IdentityNumber", employee.IdentityNumber);
                parameters.Add("@IdentityIssuedDate", employee.IdentityIssuedDate);
                parameters.Add("@IdentityIssuedPlace", employee.IdentityIssuedPlace);
                parameters.Add("@Email", employee.Email);
                parameters.Add("@PhoneNumber", employee.PhoneNumber);
                parameters.Add("@PositionID", employee.PositionID);
                parameters.Add("@PositionName", employee.PositionName);
                parameters.Add("@DepartmentID", employee.DepartmentID);
                parameters.Add("@DepartmentName", employee.DepartmentName);
                parameters.Add("@TaxCode", employee.TaxCode);
                parameters.Add("@Salary", employee.Salary);
                parameters.Add("@JoiningDate", employee.JoiningDate);
                parameters.Add("@WorkStatus", employee.WorkStatus);
                parameters.Add("@CreatedDate", employee.CreatedDate);
                parameters.Add("@CreatedBy", employee.CreatedBy);
                parameters.Add("@ModifiedDate", employee.ModifiedDate);
                parameters.Add("@ModifiedBy", employee.ModifiedBy);

                // Thực hiện câu lệnh gọi vào DB chạy câu lệnh INSERT INTO với tham số đầu vào ở trên
                int numberOfAffectedRows = mySqlConnection.Execute(insertEmployeeCommand, parameters);

                // Xử lý kết quả trả về từ DB
                if (numberOfAffectedRows > 0)
                {
                    // Trả về dữ liệu cho client
                    return StatusCode(StatusCodes.Status201Created, employeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (MySqlException mySqlException)
            {
                if (mySqlException.ErrorCode == MySqlErrorCode.DuplicateKeyEntry)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "Duplicate Key");
                }

                return StatusCode(StatusCodes.Status400BadRequest, "e001");

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");

            }
        }

        /// <summary>
        /// API Update một nhân viên
        /// </summary>
        /// <param name="employee">Đối tượng nhân viên cần update</param>
        /// <param name="employeeID">Đối tượng nhân viên cần update</param>
        /// <returns>ID của nhân viên vừa update</returns>
        /// Created By: NDHien (31/08/2022)
        [HttpPut]
        [Route("{employeeID}")]
        public IActionResult UpdateEmployee(
            [FromBody] Employee employee,
            [FromRoute] Guid employeeID
            )
        {
            // Khởi tạo kết nối tới Database
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh UPDATE
                string updateEmployeeCommand =
                    "UPDATE employee e SET EmployeeID = @EmployeeID, EmployeeCode = @EmployeeCode, EmployeeName = @EmployeeName, DateOfBirth = @DateOfBirth, " +
                    "Gender = @Gender, IdentityNumber = @IdentityNumber, IdentityIssuedDate = @IdentityIssuedDate, IdentityIssuedPlace = @IdentityIssuedPlace, " +
                    "Email = @Email, PhoneNumber = @PhoneNumber, PositionID = @PositionID, PositionName = @PositionName, DepartmentID = @DepartmentID, " +
                    "DepartmentName = @DepartmentName, TaxCode = @TaxCode, Salary = @Salary, JoiningDate = @JoiningDate, WorkStatus = @WorkStatus, " +
                    "CreatedDate = @CreatedDate, CreatedBy = @CreatedBy, ModifiedDate = @ModifiedDate, ModifiedBy = @ModifiedBy " +
                    "WHERE EmployeeID = @EmployeeID";

                // Chuẩn bị tham số đầu vào cho câu lệnh 
                var parameters = new DynamicParameters();

                parameters.Add("@EmployeeID", employeeID);
                parameters.Add("@EmployeeCode", employee.EmployeeCode);
                parameters.Add("@EmployeeName", employee.EmployeeName);
                parameters.Add("@DateOfBirth", employee.DateOfBirth);
                parameters.Add("@Gender", employee.Gender);
                parameters.Add("@IdentityNumber", employee.IdentityNumber);
                parameters.Add("@IdentityIssuedDate", employee.IdentityIssuedDate);
                parameters.Add("@IdentityIssuedPlace", employee.IdentityIssuedPlace);
                parameters.Add("@Email", employee.Email);
                parameters.Add("@PhoneNumber", employee.PhoneNumber);
                parameters.Add("@PositionID", employee.PositionID);
                parameters.Add("@PositionName", employee.PositionName);
                parameters.Add("@DepartmentID", employee.DepartmentID);
                parameters.Add("@DepartmentName", employee.DepartmentName);
                parameters.Add("@TaxCode", employee.TaxCode);
                parameters.Add("@Salary", employee.Salary);
                parameters.Add("@JoiningDate", employee.JoiningDate);
                parameters.Add("@WorkStatus", employee.WorkStatus);
                parameters.Add("@CreatedDate", employee.CreatedDate);
                parameters.Add("@CreatedBy", employee.CreatedBy);
                parameters.Add("@ModifiedDate", employee.ModifiedDate);
                parameters.Add("@ModifiedBy", employee.ModifiedBy);

                // Thực hiện câu lệnh gọi vào DB chạy câu lệnh INSERT INTO với tham số đầu vào ở trên
                int numberOfAffectedRows = mySqlConnection.Execute(updateEmployeeCommand, parameters);

                // Xử lý kết quả trả về từ DB
                if (numberOfAffectedRows > 0)
                {
                    // Trả về dữ liệu cho client
                    return StatusCode(StatusCodes.Status200OK, employeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");

            }
        }

        /// <summary>
        /// API Xóa một nhân viên
        /// </summary>
        /// <param name="employeeID">Đối tượng nhân viên cần xóa</param>
        /// <returns>ID của nhân viên cần xóa</returns>
        /// Created By: NDHien (31/08/2022)
        [HttpDelete]
        [Route("{employeeID}")]
        public IActionResult DeleteEmployee(
            [FromRoute] Guid employeeID
           )
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn
                string deleteEmployeeCommand = "DELETE FROM employee WHERE EmployeeID = @EmployeeID;";

                // Chuẩn bị tham số cho câu lệnh DELETE
                var parameters = new DynamicParameters();

                parameters.Add("@EmployeeID", employeeID);

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                int numberOfAffectedRows = mySqlConnection.Execute(deleteEmployeeCommand, parameters);

                if (numberOfAffectedRows > 0)
                {
                    // Trả về dữ liệu cho client
                    return StatusCode(StatusCodes.Status200OK, employeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }

        /// <summary>
        /// Tạo mã nhân viên cho một nhân viên mới
        /// </summary>
        /// <returns>Mã nhân viên mới</returns>
        [HttpGet]
        [Route("new-code")]
        public IActionResult GetAutoIncrementEmployeeCode()
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn, sử dụng raw string literal để format string
                string getMaxCode = "SELECT MAX(EmployeeCode) AS maxCode FROM employee;";

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                string maxEmployeeCode = mySqlConnection.QueryFirstOrDefault<string>(getMaxCode);

                // Tạo mã nhân viên mới
                // Cắt chuỗi: maxEmployeeCode = "NV" + phần số
                // Mã nhân viên mới = "NV" + (phần số + 1)
                // NV2002 = NV + 00222 => Mã nhân viên mới = "NV" + (2002 + 1)= NV2003
                string newEmployeeCode = "NV" + (Int64.Parse(maxEmployeeCode.Substring(2)) + 1).ToString();

                // Trả dữ liệu về cho clien
                return StatusCode(StatusCodes.Status200OK, newEmployeeCode);
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }
    }
}
