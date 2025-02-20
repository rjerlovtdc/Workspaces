using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net.Http.Headers;
using Azure.Core;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Graph;
using Microsoft.Graph.Drives.Item.Items.Item.Workbook.Functions.Skew_p;
using Microsoft.Graph.Models.ExternalConnectors;
using Microsoft.Identity.Client;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Claims;
using NuGet.Protocol;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Controllers
{
    
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private  Configuration _configuration;
        private string clientId = "aac91e08-a40e-45c2-a204-51339371d299";

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
            try
            {
                Console.WriteLine($"{User.FindFirst("name")?.Value ?? User.Identity.Name} is signing out.");
                return SignOut(
                    new AuthenticationProperties { RedirectUri = "/" },
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    OpenIdConnectDefaults.AuthenticationScheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during sign out.");
                return RedirectToAction("Error");
            }
        }
        
        

        public async Task<IActionResult> Profile()
        {
            
            try
            {
                HttpClient client = new HttpClient();
                Console.WriteLine($"Client: {client}");
                
                var token = await HttpContext.GetTokenAsync("token");
                Console.WriteLine($"Token: {token}");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                

                HttpResponseMessage response = await client.GetAsync("https://graph.microsoft.com/v1.0/me");
                // response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseBody);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine(e);
            }
            
            var clientId = this.clientId;

            Console.WriteLine($"Clientid: {clientId}");
            
            var userIdentity = User.FindFirst("name")?.Value;
            var userMail = User.FindFirst("preferred_username")?.Value;
            var tenantId = User.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
            var objectId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

            Console.WriteLine($"Tenantid: {tenantId}");
            Console.WriteLine($"Objectid: {objectId}");
            ViewBag.Username = userIdentity;
            ViewBag.UserMail = userMail;

            // Example of using objectId to call Microsoft Graph
            if (!string.IsNullOrEmpty(objectId))
            {
                // var user = await _graphService.GetUserByIdAsync(objectId);
                // ViewBag.UserProfile = user;
            }

            return View();
        }

        public IActionResult Mails()
        {
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