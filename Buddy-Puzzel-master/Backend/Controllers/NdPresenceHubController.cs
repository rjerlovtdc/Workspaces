using Backend.Classes;
using Backend.Models;
using NdCommonLib;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    public class NdPresenceHubController : ApiController
    {
        // GET: api/Token
        public async Task<PresenceHubTokenResponse> GetToken()
        {
            PresenceHubTokenResponse presenceHubTokenResponse = await NdPresenceHub.GetPresenceHubToken();
            return presenceHubTokenResponse;
        }
    }
}
