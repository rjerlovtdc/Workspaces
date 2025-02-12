using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize]
    public class ServicesController : Controller
    {
       
        public IActionResult Survey() { return View();}

       
        public IActionResult ContactCenter() {return View();}

       
        public IActionResult Buddy() { return View(); }

       
        public IActionResult Widgets() { return View(); }

       
        public IActionResult TextToSpeech() { return View(); }
    }
}
