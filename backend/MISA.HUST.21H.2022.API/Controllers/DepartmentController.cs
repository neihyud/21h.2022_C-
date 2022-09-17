using Dapper;
using Microsoft.AspNetCore.Mvc;
using MISA.HUST._21H._2022.API.Entities;
using MySqlConnector;

namespace MISA.HUST._21H._2022.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DepartmentController : Controller
    {
        [HttpGet]
        public IActionResult GetAllDepartments()
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn SELECT
                string getAllDepartmentsCommand = "SELECT * FROM department;";

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                var department = mySqlConnection.Query<Department>(getAllDepartmentsCommand);

                // Xử lý kết quả trả về từ DB
                if (department != null)
                {
                    return StatusCode(StatusCodes.Status200OK, department);
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
    }
}
