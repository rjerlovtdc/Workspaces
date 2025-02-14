﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebUI.Core.Mvc.Controllers
{
    [Authorize(Roles= "Cloud Application Administrators")]

    public class ManagementController : Controller
    {
        public IActionResult Users()
        {
            return View();
        }

        public IActionResult Groups()
        {
            return View();
        }
        
        public IActionResult Departments()
        {
            return View();
        }
        public IActionResult License()
        {
            return View();
        }
    }
}