using Backend.Models;
using NdCommonLib;
using RestSharp;
using RestSharp.Authenticators.OAuth2;
using System;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace Backend.Classes
{
    public class NdPuzzel
    {
        private string _customerKey;

        public NdPuzzel(string costumerKey)
        {
            _customerKey = costumerKey;
        }

        public async Task<NdPuzzelResponse> GetPuzzelToken(NdPuzzelSecret ndPuzzelSecret = null)
        {
            NdPuzzelResponse ndPuzzelResponse = new NdPuzzelResponse();

            RestClientOptions options = new RestClientOptions("https://auth.puzzel.com/api")
            {
                ThrowOnAnyError = false,
                Timeout = TimeSpan.FromSeconds(15)
            };

            RestClient client = new RestClient(options);
            RestRequest request = new RestRequest("Authenticate/LogIn");

            if (ndPuzzelSecret == null)
            {
                string filePath = @"C:\NetDesign\Secrets\" + _customerKey + @"\Puzzel.ndenc";

                if (!File.Exists(filePath))
                {
                    ndPuzzelResponse.HasError = true;
                    ndPuzzelResponse.ErrorText = "Customer Key Not Found";
                    return ndPuzzelResponse;
                }

                ndPuzzelSecret = NdFileHelper.ReadFileEncrypted<NdPuzzelSecret>(filePath);
                request.AddJsonBody(ndPuzzelSecret);
            }
            else
            {
                request.AddBody(ndPuzzelSecret);
            }

            var response = await client.ExecutePostAsync<NdPuzzelResponse>(request);

            if (!response.IsSuccessful)
            {
                ndPuzzelResponse.HasError = true;
                ndPuzzelResponse.StatusCode = response.StatusCode;
                ndPuzzelResponse.ErrorException = response.ErrorException;
                return ndPuzzelResponse;
            }

            return response.Data;
        }

        public async Task<PuzzelTokenResponse> VerifyPuzzelToken(string bearerToken)
        {
            PuzzelTokenResponse puzzelTokenResponse = new PuzzelTokenResponse();

            RestClientOptions options = new RestClientOptions("https://api.puzzel.com/ContactCentre5")
            {
                Timeout = TimeSpan.FromSeconds(15),
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(bearerToken, "Bearer")
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest("accesstokeninformation");

            RestResponse<PuzzelTokenResponse> response = await client.ExecuteGetAsync<PuzzelTokenResponse>(request);

            if (!response.IsSuccessful)
            {
                puzzelTokenResponse.HasError = true;
                puzzelTokenResponse.StatusCode = response.StatusCode;
                puzzelTokenResponse.ErrorText = response.StatusDescription;

                if (response.StatusCode != HttpStatusCode.Unauthorized)
                {
                    puzzelTokenResponse.ErrorException = response.ErrorException;
                }
                return puzzelTokenResponse;
            }

            return response.Data;
        }


        public async Task<PuzzelUserResult> GetUserFromId(string bearerToken, string customerKey, int userId)
        {
            PuzzelUserResult puzzelUserResult = new PuzzelUserResult();

            RestClientOptions options = new RestClientOptions("https://api.puzzel.com/ContactCentre5")
            {
                ThrowOnAnyError = false,
                Timeout = TimeSpan.FromSeconds(15),
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(bearerToken, "Bearer")
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest(customerKey + "/users/" + userId);

            RestResponse<PuzzelUserResult> response = await client.ExecuteGetAsync<PuzzelUserResult>(request);

            if (!response.IsSuccessful)
            {
                puzzelUserResult.HasError = true;
                puzzelUserResult.StatusCode = response.StatusCode;
                puzzelUserResult.ErrorText = response.StatusDescription;

                if (response.StatusCode != HttpStatusCode.Unauthorized)
                {
                    puzzelUserResult.ErrorException = response.ErrorException;
                }
                return puzzelUserResult;
            }

            return response.Data;
        }


        public async Task<PuzzelGroupResult> GetPuzzelGroups(string bearerToken, string customerKey)
        {
            PuzzelGroupResult puzzelGroupResult = new PuzzelGroupResult();

            RestClientOptions options = new RestClientOptions("https://api.puzzel.com/ContactCentre5")
            {
                ThrowOnAnyError = false,
                Timeout = TimeSpan.FromSeconds(15),
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(bearerToken, "Bearer")
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest(customerKey + "/usergroups");

            RestResponse<PuzzelGroupResult> response = await client.ExecuteGetAsync<PuzzelGroupResult>(request);

            if (!response.IsSuccessful)
            {
                puzzelGroupResult.HasError = true;
                puzzelGroupResult.StatusCode = response.StatusCode;
                puzzelGroupResult.ErrorText = response.StatusDescription;

                if (response.StatusCode != HttpStatusCode.Unauthorized)
                {
                    puzzelGroupResult.ErrorException = response.ErrorException;
                }
                return puzzelGroupResult;
            }

            return response.Data;
        }


        public async Task<PuzzelAgentsResult> GetPuzzelAgents(string bearerToken, string customerKey)
        {
            PuzzelAgentsResult puzzelAgentsResult = new PuzzelAgentsResult();

            RestClientOptions options = new RestClientOptions("https://api.puzzel.com/ContactCentre5")
            {
                ThrowOnAnyError = false,
                Timeout = TimeSpan.FromSeconds(15),
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(bearerToken, "Bearer")
            };

            RestClient client = new RestClient(options);

            RestRequest request = new RestRequest(customerKey + "/users");

            RestResponse<PuzzelAgentsResult> response = await client.ExecuteGetAsync<PuzzelAgentsResult>(request);

            if (!response.IsSuccessful)
            {
                puzzelAgentsResult.HasError = true;
                puzzelAgentsResult.StatusCode = response.StatusCode;
                puzzelAgentsResult.ErrorText = response.StatusDescription;

                if (response.StatusCode != HttpStatusCode.Unauthorized)
                {
                    puzzelAgentsResult.ErrorException = response.ErrorException;
                }
                return puzzelAgentsResult;
            }

            return response.Data;
        }
    }
}