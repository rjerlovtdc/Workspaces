using Backend.Classes;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    public class UserPresenceController : ApiController
    {
        public async Task<string> GetUserPresence(string userId, string customerKey = "")
        {
            NdGraph ndGraph = new NdGraph(customerKey);
            string userPresence = await ndGraph.GetTokenDelegated();
            return "";
        }
    }
}
