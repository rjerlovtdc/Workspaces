using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Owin.Security.Cookies;
using WebUI.Core.Mvc.Models;
using CookieAuthenticationDefaults = Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults;

namespace WebUI.Core.Mvc.Services;

public class Authenticator
{
    public static bool pwMatch(string enteredPassword, string storedHash)
    {
        return PasswordHasher.Verify(enteredPassword, storedHash);
    }

    public static bool customerContainsUser(string customerName, string userEmail)
    {
        var customer = Init.db.Customers.FirstOrDefault(c => c.Name == customerName);
        if (customer != null)
        {
            var users = customer.Users;

            if (users.Count > 1)
            {
                var userToSignIn = users.FirstOrDefault(u => u.Mail == userEmail);
                return userToSignIn != null;
            }
            else
            {
                var userToSignIn = users.FirstOrDefault();
                return userToSignIn != null;
            }
        }

        return false;
    }

    
}