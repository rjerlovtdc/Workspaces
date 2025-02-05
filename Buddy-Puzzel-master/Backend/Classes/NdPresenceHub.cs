using Backend.Models;
using RestSharp;
using System;
using System.Threading.Tasks;

namespace Backend.Classes
{
    public class NdPresenceHub
    {
        public static async Task<PresenceHubTokenResponse> GetPresenceHubToken()
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
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest("/realms/presencehub/protocol/openid-connect/token");
            request.AddHeader("Content-Type", "application/x-www-form-urlencoded");
            request.AddObject(presenceHubTokenGet);

            RestResponse<PresenceHubTokenResponse> response = await client.ExecutePostAsync<PresenceHubTokenResponse>(request);

            return response.Data;
        }

    }
}