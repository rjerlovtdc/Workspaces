using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize]
    public class ManagementController : Controller
    {
        
        public IActionResult Index()
        {
            return View();
        }
    }
}
