using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize]
    public class MonitoringController : Controller
    {
        
        public IActionResult Analysis()
        {
            return View();
        }
        public IActionResult Billing()
        {
            return View();
        }
        public IActionResult Reports()
        {
            return View();
        }
    }
}
