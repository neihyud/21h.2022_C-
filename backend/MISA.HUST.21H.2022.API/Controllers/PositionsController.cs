using Dapper;
using Microsoft.AspNetCore.Mvc;
using MISA.HUST._21H._2022.API.Entities;
using MySqlConnector;

namespace MISA.HUST._21H._2022.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PositionsController : Controller
    {
        [HttpGet]
        public IActionResult GetAllPositions()
        {
            string connectionString = "Server=localhost;Port=3306;Database=hust.21h.2022.ndhien;Uid=root;Pwd=2458696357;";

            try
            {
                // Khởi tạo kết nối tới Database
                var mySqlConnection = new MySqlConnection(connectionString);

                // Chuẩn bị câu lệnh truy vấn SELECT
                string getAllPositionsCommand = "SELECT * FROM positions;";

                // Thực hiện gọi vào DB để thực hiện câu lệnh truy vấn
                var positions = mySqlConnection.Query<Position>(getAllPositionsCommand);

                // Xử lý kết quả trả về từ DB
                if (positions != null)
                {
                    return StatusCode(StatusCodes.Status200OK, positions);
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
