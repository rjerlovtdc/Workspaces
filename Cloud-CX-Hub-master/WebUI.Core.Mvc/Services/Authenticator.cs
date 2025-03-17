using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Owin.Security.Cookies;
using WebUI.Core.Mvc.Models;
using CookieAuthenticationDefaults = Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults;

namespace WebUI.Core.Mvc.Services;

public class Authenticator
{
    /// <summary>
    /// Verifies if the entered password matches the stored hash.
    /// </summary>
    /// <param name="enteredPassword">The password entered by the user.</param>
    /// <param name="storedHash">The stored hash of the password.</param>
    /// <returns>True if the password matches the hash, otherwise false.</returns>
    public static bool pwMatch(string enteredPassword, string storedHash)
    {
        return PasswordHasher.Verify(enteredPassword, storedHash);
    }

    /// <summary>
    /// Checks if a customer contains a user with the specified email.
    /// </summary>
    /// <param name="customerName">The name of the customer.</param>
    /// <param name="userEmail">The email of the user.</param>
    /// <returns>True if the customer contains the user, otherwise false.</returns>
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