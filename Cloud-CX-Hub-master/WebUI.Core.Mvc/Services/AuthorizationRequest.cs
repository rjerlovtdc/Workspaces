using System.Net;
using System.Web;
using NuGet.Protocol;

namespace WebUI.Core.Mvc.Services;

public class AuthorizationRequest
{
    private static readonly HttpClient _client = new HttpClient();
    private static string tenantId = "84adce5c-2f55-4a74-bb37-3f1609020ba2";
    private static string clientId = "aac91e08-a40e-45c2-a204-51339371d299";
    private static Guid state = new Guid();

    public static async Task<string> AuthorizationRequestAsync()
    {
        var redirectUri = $"http://localhost:5108/POST";
        var responseType = "code";
        var responseMode = "query";
        var scope = "offline_access User.Read Mail.Read";

        var requestUri =
            $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize?client_id={clientId}&response_type={responseType}&redirect_uri={redirectUri}&response_mode={responseMode}&scope={scope}&state={state}";

        try
        {
            HttpResponseMessage response = await _client.GetAsync(requestUri);
            // Console.WriteLine($"Response: {response}");
            
            string responseBody = await response.Content.ReadAsStringAsync();

            var authCode = HttpUtility.ParseQueryString(responseBody);
            string returnString = authCode["code"];

            // Console.WriteLine($"Returning authCode: {
            //     authCode
            // }");
            if (authCode == null)
            {
                Console.WriteLine("Failed to obtain authorization code from AuthorizationRequestAsync().");
                return null;
            }
            return returnString;

        }
        catch (HttpRequestException e)
        {
            Console.WriteLine(e);
            
        }

        return null;
    }

    private static string ExtractAuthorizationCode(string responseBody)
    {
        var query = HttpUtility.ParseQueryString(responseBody);
        // Console.WriteLine($"Query: {query}");
        return query["code"];
    }
}