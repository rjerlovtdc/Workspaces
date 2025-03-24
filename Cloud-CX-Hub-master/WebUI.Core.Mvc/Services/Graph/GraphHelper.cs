using System.Globalization;
using Azure.Identity;
using DotNetEnv;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Identity.Client;
using Microsoft.Kiota.Serialization;
using NuGet.Protocol;
using WebUI.Core.Mvc.Data;
using User = WebUI.Core.Mvc.Models.User;

namespace WebUI.Core.Mvc.Services.Graph;
/// <summary>
/// Provides helper methods for interacting with Microsoft Graph API.
/// </summary>
public class GraphHelper
{
    /// Graph service client for interacting with Microsoft Graph API.
    private static GraphServiceClient _graphClient;

    /// Azure AD Client ID.
    // private static string _clientId = config["AzureAd:ClientId"];
    static string _clientId;

    /// Azure AD Tenant ID.
    static string _tenantId;

    /// Azure AD Client Secret.
    static string _clientSecret;
    
    /// Collection of users retrieved from Microsoft Graph API.
    /// OBS! NOT USED
    public static UserCollectionResponse userCollection;
    
    /// Collection of domains retrieved from Microsoft Graph API.
    /// OBS! NOT USED
    public static DomainCollectionResponse domainCollection;
    
    /// Scopes required for Microsoft Graph API.
    private static string[] scopes = new[]
    {
        "https://graph.microsoft.com/.default",
    };

    public static async Task InitializeGraphClient()
    {
        try
        {
            Env.Load();
            _clientId = Environment.GetEnvironmentVariable("CLIENT_ID");
            _tenantId = Environment.GetEnvironmentVariable("TENANT_ID");
            _clientSecret = Environment.GetEnvironmentVariable("CLIENT_SECRET");
            var clientSecretCredential = new ClientSecretCredential(_tenantId, _clientId, _clientSecret);
            _graphClient = new GraphServiceClient(clientSecretCredential, scopes);
            Console.WriteLine();
        }
        catch (Exception e)
        {
            Console.WriteLine($"Exception thrown! If ClientId is null, it may be because you don't have the necessary secret or you have misplaced them. Error: {e}");
        }
    }

    public static GraphServiceClient GetGraphClient()
    {
        return _graphClient;
    }

    /// <summary>
    /// Asynchronously retrieves a collection of users from Microsoft Graph API.
    /// </summary>
    public static async Task<UserCollectionResponse> GetUsersAsync()
    {
        Console.WriteLine("Getting async...");
        if (_graphClient == null)
        {
            Console.WriteLine("Initializing Graph Client...");
            await InitializeGraphClient();
            Console.WriteLine($"GraphClient: {_graphClient}");
        }

        Console.WriteLine("Getting users...");
        
        /// <summary>
        /// Asynchronously retrieves a collection of users from Microsoft Graph API and processes each user.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the user collection response.</returns>
        /// <exception cref="AuthenticationFailedException">Thrown when authentication fails.</exception>
        try
        {
            var result = await _graphClient.Users.GetAsync();
            foreach (var user in result.Value)
            {
                // Extract user details
                string displayName = user.DisplayName;
                string givenName = user.GivenName;
                string surName = user.Surname;
                string mail = user.Mail;
                string jobTitle = user.JobTitle;
                string officeLocation = user.OfficeLocation;
                string userPrincipalName = user.UserPrincipalName;
                string mobilePhone = user.MobilePhone;
        
                Console.WriteLine($"Creating user {user.DisplayName} with email: {user.Mail}");
        
                // Create user in the system
                Guid userid = Guid.Parse(user.Id);
                Creator.createUser(userid, displayName, givenName, surName, jobTitle, officeLocation, userPrincipalName,
                    mobilePhone, mail);
            }
        
            if (result != null)
            {
                userCollection = result;
            }
        
            return result;
        }
        catch (AuthenticationFailedException e)
        {
            Console.WriteLine(e);
            return null;
        }
    }

    public static async Task<DomainCollectionResponse> GetDomainsAsync()
    {
        Console.WriteLine("Retrieving domains...");
        if (_graphClient == null)
        {
            await InitializeGraphClient();
        }

        try
        {
            var result = await _graphClient.Domains.GetAsync();
            foreach (var domain in result.Value)
            {
                string domainId = domain.Id;
                if (!string.IsNullOrEmpty(domainId))
                {
                    Console.WriteLine($"Found a domain with: {domainId}");
                }
            }

            if (result != null)
            {
                domainCollection = result;
            }

            return result;
        }
        catch (AuthenticationFailedException e)
        {
            Console.WriteLine(e.Message);
        }

        return null;
    }
}