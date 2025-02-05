using Backend.Classes;
using Backend.Models;
using NdCommonLib;
using System;
using System.Collections.Specialized;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    public class TokenController : ApiController
    {
        // GET: api/Token
        public async Task<HttpResponseMessage> GetMsToken(string customerKey)
        {
            NameValueCollection ndSet = (NameValueCollection)ConfigurationManager.GetSection("NetDesign");

            string cacheFolder = ndSet["cacheFolder"] + "\\" + customerKey;
            string filePath = cacheFolder + "\\msToken.json";

            if (!System.IO.Directory.Exists(cacheFolder))
            {
                System.IO.Directory.CreateDirectory(cacheFolder);
            }

            NdToken ndToken = NdFileHelper.ReadFile<NdToken>(filePath);

            if (ndToken == null || (DateTime.Now > ndToken.CachedTokenExpire))
            {
                NdGraph ndGraph = new NdGraph(customerKey);
                ndToken.CachedToken = await ndGraph.GetToken();
            }

            return Request.CreateResponse(HttpStatusCode.OK, ndToken.CachedToken);
        }
    }
}
