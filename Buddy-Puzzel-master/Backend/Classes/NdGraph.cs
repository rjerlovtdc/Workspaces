using Azure.Core;
using Azure.Identity;
using Backend.Models;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using NdCommonLib;
using Serilog;
using System;
using System.Collections.Specialized;
using System.Configuration;
using System.IdentityModel;
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace Backend.Classes
{
    public class NdGraph
    {
        string filePathSecret;
        string filePathCache;

        public NdGraph(string customerKey, string orgPath = "DEFAULT")
        {
            NameValueCollection ndSet = (NameValueCollection)ConfigurationManager.GetSection("NetDesign");

            if (orgPath == "DEFAULT")
            {
                filePathSecret = String.Format(@"C:\Netdesign\Secrets\{0}\MsSecret.ndenc", customerKey);
                filePathCache = String.Format(@"{0}\{1}\msToken.json", ndSet["cacheFolder"], customerKey);
            }
            else
            {
                filePathSecret = String.Format(@"C:\Netdesign\Secrets\{0}\{1}\MsSecret.ndenc", customerKey, orgPath);
                filePathCache = String.Format(@"{0}\{1}\{2}\msToken.json", ndSet["cacheFolder"], customerKey, orgPath);
            }
        }

        public async Task<string> GetToken()
        {
            NdToken ndToken = NdFileHelper.ReadFile<NdToken>(filePathCache);

            if (ndToken != null && (DateTime.Now < ndToken.CachedTokenExpire))
            {
                return ndToken.CachedToken;
            }

            NdMsGraphSecret ndMsGraphSecret = NdFileHelper.ReadFileEncrypted<NdMsGraphSecret>(filePathSecret);

            if (ndMsGraphSecret == null)
            {
                Log.Error("(GetToken) Secret File not found: {FilePath}", filePathSecret);
                return null;
            }

            try
            {
                IConfidentialClientApplication app = ConfidentialClientApplicationBuilder
                    .Create(ndMsGraphSecret.Application)
                    .WithClientSecret(ndMsGraphSecret.ClientSecret)
                    .WithAuthority(AzureCloudInstance.AzurePublic, ndMsGraphSecret.Directory)
                    .Build();

                string[] scopes = new[] { "https://graph.microsoft.com/.default" };

                AuthenticationResult result = await app.AcquireTokenForClient(scopes).ExecuteAsync();

                ndToken = new NdToken()
                {
                    CachedToken = result.AccessToken,
                    CachedTokenExpire = DateTime.Now.AddMinutes(30)
                };

                NdFileHelper.WriteFile(filePathCache, ndToken);

                return result.AccessToken;
            }
            catch (MsalServiceException serviceException)
            {
                if (serviceException.ResponseBody != "")
                {
                    NdMsalError ndMsalError =
                    JsonSerializer.Deserialize<NdMsalError>(serviceException.ResponseBody);
                    if (ndMsalError != null && ndMsalError.error_codes[0] == 7000222)
                    {
                        Log.Fatal("(GetToken) Secret has expired for APP ID: {AppId}", ndMsGraphSecret.Application);
                    }
                }
                Log.Error(serviceException, "(GetToken) ServiceException");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "(GetToken) Exception");
            }

            return null;
        }

        public async Task<string> GetTokenDelegated()
        {
            NdMsGraphSecret ndMsGraphSecret = NdFileHelper.ReadFileEncrypted<NdMsGraphSecret>(filePathSecret);

            string[] scopes = new[] { "https://graph.microsoft.com/.default" };

            // using Azure.Identity;  
            var options = new TokenCredentialOptions
            {
                AuthorityHost = AzureAuthorityHosts.AzurePublicCloud
            };

            IConfidentialClientApplication app = ConfidentialClientApplicationBuilder.Create(ndMsGraphSecret.Application)
                .WithClientSecret(ndMsGraphSecret.ClientSecret)
                .WithAuthority(AzureCloudInstance.AzurePublic, ndMsGraphSecret.Directory)
                .Build();

            AuthenticationResult authenticationResult = await app.AcquireTokenForClient(scopes)
                .ExecuteAsync();

            GraphServiceClient graphServiceClient = new GraphServiceClient(
                new DelegateAuthenticationProvider(x =>
                    {
                        x.Headers.Authorization = new AuthenticationHeaderValue(
                            "Bearer", authenticationResult.AccessToken);

                        return Task.FromResult(0);
                    }));

            /* UsernamePasswordCredential userNamePasswordCredential = new UsernamePasswordCredential(
                userName, password, ndMsGraphSecret.Directory, ndMsGraphSecret.Application, options);

            var graphClient = new GraphServiceClient(userNamePasswordCredential, scopes);
            */
            //Presence presence = await graphServiceClient.Users[userId].Presence.Request().GetAsync();
            var users = await graphServiceClient.Users.Request().GetAsync();
            return ""; //presence.ToString();
        }

        public async Task<GraphServiceClient> NdGetGraphClient()
        {
            string accessToken = await GetToken();

            if (accessToken == null)
            {
                return null;
            }

            GraphServiceClient graphClient = new GraphServiceClient(
                    new DelegateAuthenticationProvider(async (request) =>
                    {
                        request.Headers.Authorization = new AuthenticationHeaderValue(
                            "Bearer", accessToken);

                        await Task.FromResult<object>(null);
                    }));

            return graphClient;
        }

        private async Task UsersAll()
        {
            GraphServiceClient graphClient = await NdGetGraphClient();

            IGraphServiceUsersCollectionPage users = await graphClient.Users.Request().GetAsync();

            foreach (User user in users)
                Console.WriteLine(user.DisplayName);
        }

        public async Task<User> GetUserFromEmail(string email, string extensionAttr = "")
        {
            GraphServiceClient graphClient = await NdGetGraphClient();

            if (graphClient == null)
            {
                return null;
            }

            string selectAttribues =
                "Id, UserPrincipalName, Mail," +
                "GivenName, Surname, DisplayName," +
                "BusinessPhones, MobilePhone," +
                "JobTitle, Manager," +
                "PostalCode, StreetAddress, City," +
                "Department, OfficeLocation," +
                "AccountEnabled," +
                "OnPremisesDistinguishedName, OnPremisesExtensionAttributes," +
                extensionAttr;

            string selectManager = "displayName,mail,givenName, surname, id";

            try
            {
                IGraphServiceUsersCollectionPage response = await graphClient.Users
                    .Request()
                    .Filter("mail eq '" + email + "'")
                    .Expand("manager($select=" + selectManager + ")")
                    .Select(selectAttribues)
                    .GetAsync();

                if (response.Count > 0)
                {
                    return response[0];
                }
            }
            catch (ServiceException serviceException)
            {
                if (serviceException.StatusCode == HttpStatusCode.NotFound)
                {
                    Log.Warning("(GetUserFromEmail) User Not Found '{Email}'", email);
                }
                else
                {
                    Log.Error(serviceException, "(GetUserFromEmail) ServiceException '{Email}'", email);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "(GetUserFromEmail) Exception '{Email}'", email);
            }

            return null;
        }

        public async Task<MemoryStream> GetPhotoFromEmail(string email)
        {
            GraphServiceClient graphClient = await NdGetGraphClient();

            try
            {
                Stream userPhoto = await graphClient.Users[email].Photos["120x120"].Content
                    .Request()
                    .GetAsync();
                MemoryStream ms = new MemoryStream();
                userPhoto.CopyTo(ms);
                return ms;
            }
            catch (ServiceException serviceException)
            {
                if (serviceException.Error?.Code == "ImageNotFound")
                {
                    Log.Warning("(GetPhotoFromEmail) No Photo for user '{Email}'", email);
                }
                else
                {
                    Log.Error(serviceException, "(GetPhotoFromEmail) User Not Found '{Email}'", email);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "(GetPhotoFromEmail) Exception '{Email}'", email);
            }

            return null;
        }
    }
}