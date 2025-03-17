using System.Security.Cryptography;
using System.Text;
using WebUI.Core.Mvc.Models;

namespace WebUI.Core.Mvc.Services;
/// <summary>
/// Provides methods for hashing and verifying passwords.
/// </summary>

public class PasswordHasher
{
    public static string Hash(string password)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(
                password));
            StringBuilder builder = new StringBuilder();
            foreach (byte b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }

            return builder.ToString();
        }
            
    }
    
    /// <summary>
    /// Verifies if the entered password matches the stored hash.
    /// </summary>
    public static bool Verify(string enteredPassword, string storedHash)
    {
        string enteredHash = Hash(enteredPassword);
        return storedHash == enteredHash;
    }
    
    
}