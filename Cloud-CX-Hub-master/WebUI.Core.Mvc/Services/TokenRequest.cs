using System.Net.Http.Headers;

namespace WebUI.Core.Mvc.Services;

public class TokenRequest
{
    private static readonly HttpClient _client = new HttpClient();
    private static string tenantId = "84adce5c-2f55-4a74-bb37-3f1609020ba2";
    private static string clientId = "aac91e08-a40e-45c2-a204-51339371d299";


    public static async Task RequestTokenAsync()
    {
        string authCode = await AuthorizationRequest.AuthorizationRequestAsync();
        if (authCode == null)
        {
            Console.WriteLine("Failed to obtain authorization code from RequestTokenAsync().");
            return;
        }

        var request = new HttpRequestMessage(HttpMethod.Post,
            $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token");
        // Console.WriteLine($"Request: {request}");
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("client_id", clientId),
            new KeyValuePair<string, string>("scope", "User.Read Mail.Read"),
            new KeyValuePair<string, string>("code", authCode),
            new KeyValuePair<string, string>("redirect_uri", "localhost:5108/"),
            new KeyValuePair<string, string>("grant_type", "authorization_code")
            // ,
            // new KeyValuePair<string, string>("client_secret", clientSecret)
        });
        request.Content = content;
        // request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));

        try
        {
            HttpResponseMessage response = await _client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            // Console.WriteLine(responseBody);
        }
        catch (HttpRequestException e)
        {
            Console.WriteLine(e);
        }
    }
}