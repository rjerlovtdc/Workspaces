using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Identity.Web;
using NuGet.Protocol;
using WebUI.Core.Mvc.Models;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Overview()
        {
            if (User.Identity.IsAuthenticated)
            {
                string username = User.GetDisplayName();
                string name = User.GetNameIdentifierId();
                ViewBag.DisplayName = User.FindFirst("name")?.Value ?? User.Identity.Name;
                Console.WriteLine($"{ViewBag.DisplayName} is authenticated.");

            }
        
            // ViewBag.DisplayName = User.GetDisplayName();
            return View();
        }

        public IActionResult Signout()
        {
            return SignOut(
                new AuthenticationProperties { RedirectUri = "/" },
                CookieAuthenticationDefaults.AuthenticationScheme,
                OpenIdConnectDefaults.AuthenticationScheme);
        }

        [Authorize]
        public IActionResult Profile()
        {
            Console.WriteLine("Profile page accessed");
            return View();
        }
        [Authorize]
        public IActionResult Mails()
        {
            Console.WriteLine("Mails page accessed");
            return View();
        }

        [Authorize]
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
