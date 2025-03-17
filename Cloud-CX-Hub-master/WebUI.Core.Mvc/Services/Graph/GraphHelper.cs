using System.Globalization;
using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Identity.Client;
using Microsoft.Kiota.Serialization;
using NuGet.Protocol;
using WebUI.Core.Mvc.Data;
using User = WebUI.Core.Mvc.Models.User;

namespace WebUI.Core.Mvc.Services.Graph;

public class GraphHelper
{
    private static IConfigurationRoot config = new ConfigurationBuilder()
        .AddUserSecrets<GraphHelper>()
        .Build();
    private static GraphServiceClient _graphClient;
    private static string _clientId = config["AzureAd:ClientId"];
    private static string _tenantid = config["AzureAd:TenantId"];
    private static string _clientSecret = config["AzureAd:ClientSecret"];
    public static UserCollectionResponse userCollection;
    public static DomainCollectionResponse domainCollection;

    private static string[] scopes = new[]
    {
        "https://graph.microsoft.com/.default",
    };

    public static async Task InitializeGraphClient()
    {
        var clientSecretCredential = new ClientSecretCredential(_tenantid, _clientId, _clientSecret);
        _graphClient = new GraphServiceClient(clientSecretCredential, scopes);
        Console.WriteLine();
    }

    public static GraphServiceClient GetGraphClient()
    {
        return _graphClient;
    }

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
        try
        {
            var result = await _graphClient.Users.GetAsync();
            foreach (var user in result.Value)
            {
                string displayName = user.DisplayName;
                string givenName = user.GivenName;
                string surName = user.Surname;
                string mail = user.Mail;
                string jobTitle = user.JobTitle;
                string officeLocation = user.OfficeLocation;
                string userPrincipalName = user.UserPrincipalName;
                string mobilePhone = user.MobilePhone;

                Console.WriteLine($"Creating user {user.DisplayName} with email: {user.Mail}");

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