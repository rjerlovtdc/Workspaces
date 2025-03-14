using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize(Policy = "AdminOnly")] // Only Admin Access
    public class MonitoringController : Controller
    {
        private readonly ApplicationDb _db = SharedData.db;

        public IActionResult Analysis()
        {
            if (User.Identity.IsAuthenticated)
            {
                Console.WriteLine("User is authenticated after home controller");
            }
            
            return View();
        }
        public IActionResult Billing()
        {
            return View();
        }
        public IActionResult Reports()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return AccessDenied();
            }
            return View();
        }
        public IActionResult AccessDenied()
        {
            return View();
        }

        public IActionResult Logs()
        {
            var changes = _db.Changes.ToList();
            return View(changes);
        }
    }
}
