using Backend.Classes;
using Backend.Models;
using Microsoft.Graph;
using NdCommonLib;
using Serilog;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Backend.Controllers
{
    public class UserController : ApiController
    {

        // GET api/User/{email}
        //[EnableCors(origins: "*", headers: "Content-Type", methods: "GET, POST, PUT, DELETE, OPTIONS")]
        public async Task<NdGraphUser> GetUser(string email, string customerKey, string orgPath = "DEFAULT")
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            NameValueCollection ndSet = (NameValueCollection)ConfigurationManager.GetSection("NetDesign");
            NdGraphUser ndGraphUser = new NdGraphUser();

            string cacheFolder = ndSet["cacheFolder"] + "\\" + customerKey;

            if (orgPath != "DEFAULT")
            {
                cacheFolder = cacheFolder + "\\" + orgPath;
            }

            string filePath = cacheFolder + "\\Users\\" + email.Split('@')[0] + ".json";

            if (!System.IO.Directory.Exists(cacheFolder + "\\Users"))
            {
                System.IO.Directory.CreateDirectory(cacheFolder + "\\Users");
            }

            Dictionary<string, string> extensionAttrDic = new Dictionary<string, string>();
            string extensionAttr = "", extensionAttrTmp = "";

            if (NdCustomers.ExtendedAttributes.TryGetValue(customerKey, out extensionAttrDic))
            {
                if (extensionAttrDic.TryGetValue(orgPath, out extensionAttrTmp)) {
                    extensionAttr = extensionAttrTmp;
                };
            }

            bool cacheFileFound = NdFileHelper.GetFile(filePath);

            if (!cacheFileFound)
            {
                NdGraph ndGraph = new NdGraph(customerKey, orgPath);
                User ndUser = await ndGraph.GetUserFromEmail(email, extensionAttr);
                
                if (ndUser == null)
                {
                    return null;
                }

                string jsonString = JsonSerializer.Serialize(ndUser);

                ndGraphUser = JsonSerializer.Deserialize<NdGraphUser>(jsonString);
                JsonElement ndUserObj = JsonSerializer.Deserialize<JsonElement>(jsonString);

                JsonElement propertyCode = new JsonElement();

                if (ndUserObj.TryGetProperty(extensionAttr, out propertyCode))
                {

                    propertyCode = ndUserObj.GetProperty(extensionAttr);
                    ndGraphUser.ndDivision = propertyCode.GetString();
                }

                NdFileHelper.WriteFile<NdGraphUser>(filePath, ndGraphUser);
                Log.Information("(GetUser) From Graph '{Email}' {@NdUser}", email, ndUser);
            }
            else
            {
                ndGraphUser = NdFileHelper.ReadFile<NdGraphUser>(filePath);
                Log.Information("(GetUser) From Cache '{Email}' {@NdUser}", email, ndGraphUser);
            }

            return ndGraphUser;
        }
    }
}
