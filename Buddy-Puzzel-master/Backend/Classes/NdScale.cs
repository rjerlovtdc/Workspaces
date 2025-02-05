using Backend.Models.Scale;
using RestSharp;
using RestSharp.Authenticators;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Backend.Classes
{
    public class NdScale
    {
        private const string ScaleUrl = "https://scalexi-pp-xsp1.tdc.dk/com.broadsoft.xsi-actions/v2.0/user/";

        private static string folderPath;
        private static string filePath;

        private static NdScaleAdmin ndScaleAdmin;


        public NdScale(string customerKey, NdScaleAdmin _ndScaleAdmin, string _folderPath)
        {
            ndScaleAdmin = _ndScaleAdmin;
            folderPath = _folderPath;

            if (!System.IO.Directory.Exists(folderPath))
            {
                System.IO.Directory.CreateDirectory(folderPath);
            }
        }


        private static List<string> GetNotFoundList(NdScalePresenType ndScalePresenType)
        {
            switch (ndScalePresenType)
            {
                case NdScalePresenType.Phone:
                    filePath = folderPath + "\\scaleNotFoundPhone.txt";
                    break;
                case NdScalePresenType.PA:
                    filePath = folderPath + "\\scaleNotFoundPA.txt";
                    break;
                case NdScalePresenType.DND:
                    filePath = folderPath + "\\scaleNotFoundDND.txt";
                    break;
            }

            List<string> notFoundList = new List<string>();
            if (System.IO.File.Exists(filePath))
            {
                notFoundList = System.IO.File.ReadAllLines(filePath).ToList();
            }

            return notFoundList;
        }


        public static async Task<RestResponse<Profile>> GetScaleProfile(string number)
        {
            RestClientOptions options = new RestClientOptions(ScaleUrl)
            {
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/xml;charset=UTF-8" }
            };

            RestRequest request = new RestRequest(number + "/profile")
            {
                Authenticator = new HttpBasicAuthenticator(ndScaleAdmin.userName, ndScaleAdmin.userPassword)
            };

            RestResponse<Profile> response = await client.ExecuteGetAsync<Profile>(request);
            
            return response;
        }


        public static async Task<RestResponse<HookStatus>> GetHookStatus(string userId)
        {
            RestClientOptions options = new RestClientOptions(ScaleUrl)
            {
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/xml;charset=UTF-8" }
            };

            RestRequest request = new RestRequest(userId + "/calls/HookStatus")
            {
                Authenticator = new HttpBasicAuthenticator(ndScaleAdmin.userName, ndScaleAdmin.userPassword)
            };

            RestResponse<HookStatus> response = await client.ExecuteGetAsync<HookStatus>(request);
            
            return response;
        }


        public static async Task<RestResponse<CallForwardingAlways>> GetForwardAll(string userId)
        {

            RestClientOptions options = new RestClientOptions(ScaleUrl)
            {
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/xml;charset=UTF-8" }
            };

            RestRequest request = new RestRequest(userId + "/services/CallForwardingAlways")
            {
                Authenticator = new HttpBasicAuthenticator(ndScaleAdmin.userName, ndScaleAdmin.userPassword)
            };

            RestResponse<CallForwardingAlways> response = await client.ExecuteGetAsync<CallForwardingAlways>(request);
            
            return response;
        }


        public static async Task<RestResponse<PersonalAssistant>> GetPAStatus(string userId)
        {
            RestClientOptions options = new RestClientOptions(ScaleUrl)
            {
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/xml;charset=UTF-8" }
            };

            RestRequest request = new RestRequest(userId + "/services/personalassistant")
            {
                Authenticator = new HttpBasicAuthenticator(ndScaleAdmin.userName, ndScaleAdmin.userPassword)
            };

            RestResponse<PersonalAssistant> response = await client.ExecuteGetAsync<PersonalAssistant>(request);

            return response;
        }


        public static async Task<RestResponse<DoNotDisturb>> GetDNDStatus(string userId)
        {
            RestClientOptions options = new RestClientOptions(ScaleUrl)
            {
                Timeout = TimeSpan.FromSeconds(15),
            };

            RestClient client = new RestClient(options)
            {
                AcceptedContentTypes = new string[] { "application/xml;charset=UTF-8" }
            };

            RestRequest request = new RestRequest(userId + "/services/DoNotDisturb")
            {
                Authenticator = new HttpBasicAuthenticator(ndScaleAdmin.userName, ndScaleAdmin.userPassword)
            };

            RestResponse<DoNotDisturb> response = await client.ExecuteGetAsync<DoNotDisturb>(request);
            
            return response;
        }
    }
}