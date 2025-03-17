using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Controllers;

/// <summary>
/// The AccountController class handles user-related actions and operations within the application,
/// such as authentication, validation, and account-related redirections.
/// </summary>
/// <remarks>
/// This controller is responsible for managing the flow of account-related functionality
/// in the application, interacting with the views, and processing user credentials or claims.
/// </remarks>
public class AccountController : Controller
{
    private readonly ApplicationDb _db = SharedData.db;
    // GET
    public IActionResult Index()
    {
        return View();
    }
    [Route("/Account/MsalRedirect")]
    public IActionResult MsalRedirect()
    {
        return RedirectToAction("Overview", "Home");
    }
    
    /// <summary>
    /// Authenticates a user by creating claims for the user and signing them in
    /// to the application, allowing access to the protected resources.
    /// </summary>
    /// <param name="user">The user to authenticate, containing user information and claims.</param>
    /// <returns>
    /// A redirect to the "Overview" action if the user is authenticated, 
    /// otherwise redirects to the "AccessDenied" action if the user does not have access.
    /// </returns>
    /// <remarks>
    /// This method performs the following steps:
    /// 1. Creates claims for the user based on the user's information.
    /// 2. Signs in the user by creating a claims identity and authentication properties.
    /// 3. Redirects the user to the "Overview" action with the user's ID.
    /// </remarks>
    public async Task<IActionResult> Authenticate(User user)
        {
            // Create claims for the user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), // Or a unique identifier
                new Claim(ClaimTypes.Name, user.DisplayName), // Or display name
                new Claim(ClaimTypes.Email, user.Mail),
                new Claim("AccessRights", user.Access.ToString()) // Add AccessRights claim
                // Add other claims as needed (roles, etc.)
            };

            if (user.Access > 0)
            {
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    // Configure authentication properties (e.g., remember me)
                    IsPersistent = true,
                };

                // Sign in the user
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);
                Console.WriteLine($"User: {user.DisplayName} is authenticated");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim type: {claim.Type}, claim value: {claim.Value}");
                }

                return RedirectToAction("Overview", "Home", new { userId = user.UserId });
            }

            Console.WriteLine("Your sysadmin is yet to grant you access to this resource.");
            return RedirectToAction("AccessDenied", "Home");
        }


        /// <summary>
        /// Validates a user's credentials by verifying the user's email and password
        /// with the provided customer information.
        /// </summary>
        /// <param name="customerName">The name of the customer to which the user belongs.</param>
        /// <param name="userEmail">The email address of the user attempting to authenticate.</param>
        /// <param name="enteredPassword">The password provided by the user during the authentication attempt.</param>
        /// <returns>
        /// A redirect to the "Authenticate" action if the credentials are valid, 
        /// otherwise redirects to the "NotFound" action if validation fails.
        /// </returns>
        /// <remarks>
        /// This method performs the following steps:
        /// 1. Checks if the provided customer contains the user through the Authenticator helper.
        /// 2. Retrieves the customer and associated users from the database.
        /// 3. Locates the specific user based on the provided email.
        /// 4. Verifies the entered password against the user's stored (hashed) password.
        /// 5. If successful, authenticates the user by calling the Authenticate action.
        /// </remarks>
        public async Task<IActionResult> Validate(string customerName, string userEmail, string enteredPassword)
        {
            if (Authenticator.customerContainsUser(customerName, userEmail))
            {
                //Find list of users belonging to customer that was clicked on
                var customer = _db.Customers.FirstOrDefault(c => c.Name == customerName);
                
                var users = customer.Users.Where(u => u.Customer.Name == customerName);

                //Finding exact user to authenticate
                var user = users.FirstOrDefault(u => u.Mail == userEmail);

                //Checking if hash of entered password matches password in db (hashed)
                if (Authenticator.pwMatch(enteredPassword, user.Password))
                {
                    var result = await Authenticate(user);
                    return result;
                }
            }

            return RedirectToAction("NotFound", "Home");
        }
        
        


}