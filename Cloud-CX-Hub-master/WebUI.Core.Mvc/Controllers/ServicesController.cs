using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize]
    public class ServicesController : Controller
    {
        private readonly ApplicationDb _db = SharedData.db;

        public IActionResult Survey() { return View();}

       
        public IActionResult ContactCenter() {return View();}

        HttpContext context = new DefaultHttpContext();

        public IActionResult Buddy()
        {
            return View();
        }

       
        public IActionResult Widgets() { return View(); }

       
        public IActionResult TextToSpeech() { return View(); }
    }
}
