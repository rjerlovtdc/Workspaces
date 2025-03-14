using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net.Http.Headers;
using Azure.Core;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis;
using Microsoft.Graph;
using Microsoft.Graph.Drives.Item.Items.Item.Workbook.Functions.Skew_p;
using Microsoft.Graph.Models;
using Microsoft.Graph.Models.ExternalConnectors;
using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Extensions.Msal;
using Microsoft.Identity.Web;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.AzureAD.UI.Internal;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using NuGet.Protocol;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;
using Identity = Microsoft.Graph.Models.ExternalConnectors.Identity;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;
using User = WebUI.Core.Mvc.Models.User;

namespace WebUI.Core.Mvc.Controllers
{
    /// <summary>
    /// Provides functionality for managing user authentication, rendering crucial view components,
    /// session management, and processing user-specific requests within the web application.
    /// Includes actions for navigation across home, login, validation, and other key application features.
    /// </summary>
    public class HomeController : Controller
    {
        private readonly ApplicationDb _db = SharedData.db;


        public IActionResult HomePage()
        {
            var customers = _db.Customers.ToList();
            ViewBag.Customers = customers;

            return View(customers);
        }


        [HttpGet]
        public IActionResult Overview(string userId)
        {
            if (SharedData.SignedInUser != null)
            {
                return View(SharedData.SignedInUser);
            } if (userId != null)
            {
                Console.WriteLine(userId);
                var user = _db.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                SharedData.SignedInUser = user;
                return View(user);
            }

            return NotFound();
        }


        public IActionResult Login(string customerName)
        {
            SharedData.CustomerName = customerName;
            var customer = _db.Customers.FirstOrDefault(c => c.Name == customerName);
            return View(customer);
        }


        /// Authenticates a user and establishes their session using cookie-based authentication.
        /// <param name="user">The user object containing login information, claims, and access rights.</param>
        /// <returns>A task representing the asynchronous operation. Returns a redirection to the "Overview" action if authentication succeeds.
        /// Returns the "AccessDenied" action result if authentication fails.</returns>
        public async Task<ActionResult> Signout()
        {
            await HttpContext.SignOutAsync();
            return RedirectToAction("HomePage");
        }

        public IActionResult Privacy() => View();


        public IActionResult NotFound()
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            return View();
        }

        public IActionResult AccessDenied() => View();


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

// public async Task<IActionResult> Profile()
// {
//     try
//     {
//         HttpClient client = new HttpClient();
//         Console.WriteLine($"Client: {client}");
//
//         var token = await HttpContext.GetTokenAsync("token");
//         Console.WriteLine($"Token: {token}");
//         client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
//
//
//         HttpResponseMessage response = await client.GetAsync("https://graph.microsoft.com/v1.0/me");
//         // response.EnsureSuccessStatusCode();
//         string responseBody = await response.Content.ReadAsStringAsync();
//         Console.WriteLine(responseBody);
//     }
//     catch (HttpRequestException e)
//     {
//         Console.WriteLine(e);
//     }
//
//     var clientId = this.clientId;
//
//     Console.WriteLine($"Clientid: {clientId}");
//
//     var userIdentity = User.FindFirst("name")?.Value;
//     var userMail = User.FindFirst("preferred_username")?.Value;
//     var tenantId = User.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
//     var objectId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
//
//     Console.WriteLine($"Tenantid: {tenantId}");
//     Console.WriteLine($"Objectid: {objectId}");
//     ViewBag.Username = userIdentity;
//     ViewBag.UserMail = userMail;
//
//     // Example of using objectId to call Microsoft Graph
//     if (!string.IsNullOrEmpty(objectId))
//     {
//         // var user = await _graphService.GetUserByIdAsync(objectId);
//         // ViewBag.UserProfile = user;
//     }
//

//     return View();

// }