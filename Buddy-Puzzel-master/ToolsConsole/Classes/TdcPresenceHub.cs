using RestSharp;
using RestSharp.Authenticators.OAuth2;
using System;
using System.Threading.Tasks;
using ToolsConsole.Model;

namespace ToolsConsole.Classes
{
    internal class TdcPresenceHub
    {
        private static string urlPresenceHub = "https://mobilepartners.northeurope.cloudapp.azure.com/PresenceHub/api/";
        
        public static async Task<RestResponse<PresenceHubTokenResponse>> GetScalePresenceHubToken()
        {
            PresenceHubTokenGet presenceHubTokenGet = new PresenceHubTokenGet()
            {
                grant_type = "password",
                client_id = "presencehub-client",
                username = "presencehubuser",
                password = "Password1",
                client_secret = "xAJaJDxeZ78cNjFeLemsELYTUzFeeWjA"
            };

            RestClientOptions options = new RestClientOptions("https://keycloak-hub.public.lqd.dk")
            {
                Timeout = TimeSpan.FromSeconds(5),
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest("/realms/presencehub/protocol/openid-connect/token");
            request.AddHeader("Content-Type", "application/x-www-form-urlencoded");
            request.AddObject(presenceHubTokenGet);

            RestResponse<PresenceHubTokenResponse> response = await client.ExecutePostAsync<PresenceHubTokenResponse>(request);

            return response;
        }

        public static async Task<RestResponse<ScalePresence>> GetScalePresenceFromId(string userId, string token )
        {
            RestClientOptions options = new RestClientOptions(urlPresenceHub)
            {
                Timeout = TimeSpan.FromSeconds(10),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/json;charset=UTF-8" }
            };

            RestRequest request = new RestRequest("scale/" + userId)
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(token, "Bearer")
            };

            RestResponse<ScalePresence> response = await client.ExecuteGetAsync<ScalePresence>(request);

            return response;
        
        }

        public static async Task<RestResponse<Presence>> GetScalePresence(string number, string token)
        {
            RestClientOptions options = new RestClientOptions(urlPresenceHub)
            {
                Timeout = TimeSpan.FromSeconds(10),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/json;charset=UTF-8" }
            };

            RestRequest request = new RestRequest("Presence/" + number)
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(token, "Bearer")
            };

            RestResponse<Presence> response = await client.ExecuteGetAsync<Presence>(request);

            return response;

        }
    }
}
