using Backend.Classes;
using Backend.Models;
using Serilog;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Http;
using static System.Windows.Forms.LinkLabel;


namespace Backend.Controllers
{
    public class PuzzelController : ApiController
    {
        // GET: api/Puzzel/5
        public async Task<NdPuzzelResponse> GetToken(string customerKey)
        {

            NdPuzzel ndPuzzel = new NdPuzzel(customerKey);

            NdPuzzelResponse ndPuzzelResponse = await ndPuzzel.GetPuzzelToken();

            return ndPuzzelResponse;
        }

        public async Task<List<ResultAgents>> GetObject(string customerKey, string objectName)
        {
            NdPuzzelSecret ndPuzzelSecret = new NdPuzzelSecret
            {
                CustomerKey = "454014",
                UserName = "jha",
                Password = "Password1"
            };

            NdPuzzel ndPuzzel = new NdPuzzel(customerKey);
            NdPuzzelResponse ndPuzzelToken = await ndPuzzel.GetPuzzelToken(ndPuzzelSecret);

            PuzzelGroupResult ndPuzzelGroupResult = await ndPuzzel.GetPuzzelGroups(ndPuzzelToken.accessToken, customerKey);

            Dictionary<int, string> agentGroupsDic = new Dictionary<int, string>();
            foreach (ResultGroup resultGroup in ndPuzzelGroupResult.result)
            {
                if (resultGroup.name.ToUpper().Contains("AGENT"))
                {
                    agentGroupsDic.Add(resultGroup.id, resultGroup.name);
                }
            }

            PuzzelAgentsResult puzzelAgentsResult = await ndPuzzel.GetPuzzelAgents(ndPuzzelToken.accessToken, customerKey);

            List<ResultAgents> agentsList = new List<ResultAgents>();
            foreach (ResultAgents agent in puzzelAgentsResult.result)
            {
                if (agentGroupsDic.ContainsKey(agent.groupId))
                {
                    if (!agent.userName.ToUpper().Contains("TEST") && !agent.userName.ToUpper().Contains("TDC"))
                    {
                        ResultAgents agentTmp = agent;
                        agentTmp.groupName = agentGroupsDic[agent.groupId];
                        agentsList.Add(agent);
                    }
                }
            }


            // Set a variable to the Documents path.
            string docPath = "C:\\Temp"; //Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);

            // Write the string array to a new file named "WriteLines.txt".
            using (StreamWriter outputFile = new StreamWriter(Path.Combine(docPath, "WriteLines.txt")))
            {
                outputFile.WriteLine("Fornavn;Efternavn;BrugerId;GruppeNavn;GruppeId");
                foreach (ResultAgents agent in agentsList)
                {
                    outputFile.Write(agent.firstName + ";");
                    outputFile.Write(agent.lastName + ";");
                    outputFile.Write(agent.userName + ";");
                    outputFile.Write(agent.groupName + ";");
                    outputFile.Write(agent.groupId);
                    outputFile.WriteLine();
                }
            }

            return agentsList;
        }


        public async Task<PuzzelTokenResponse> PostValidateUser()
        {
            PuzzelTokenResponse puzzelTokenResponse = new PuzzelTokenResponse();

            string bearerToken = string.Empty;
            IEnumerable<string> headerValues;
            if (Request.Headers.TryGetValues("Puzzel-Token", out headerValues))
            {
                bearerToken = headerValues.First();
            }
            else
            {
                puzzelTokenResponse.HasError = true;
                puzzelTokenResponse.ErrorText = "BearerToken Not Provided";
                return puzzelTokenResponse;
            }

            NdPuzzel ndPuzzel = new NdPuzzel("");
            puzzelTokenResponse = await ndPuzzel.VerifyPuzzelToken(bearerToken);

            if (puzzelTokenResponse.HasError)
            {
                Log.Warning("(PostValidateUser) Invalid Token {@PuzzelTokenResponse}", puzzelTokenResponse);
                return puzzelTokenResponse;
            }

            string customerKey = puzzelTokenResponse.result.customerKey;
            if (!System.IO.Directory.Exists(@"C:\NetDesign\Secrets\" + customerKey))
            {
                puzzelTokenResponse.HasError = true;
                puzzelTokenResponse.StatusCode = HttpStatusCode.Unauthorized;
                puzzelTokenResponse.ErrorText = "CustomerKeyNotAuthorized";
                Log.Warning("(PostValidateUser) Customer Key Now Allowed {PuzzelTokenResponse}", puzzelTokenResponse);
                return puzzelTokenResponse;
            }

            /* Get Email from userId */
            int userId = puzzelTokenResponse.result.userId;
            PuzzelUserResult puzzelUserResult = await ndPuzzel.GetUserFromId(bearerToken, customerKey, userId);
            puzzelTokenResponse.eMail = puzzelUserResult.result.eMail;

            /* Get GroupName from userGroupId */
            int userGroupId = puzzelTokenResponse.result.userGroupId;
            PuzzelGroupResult puzzelGroupResult = await ndPuzzel.GetPuzzelGroups(bearerToken, customerKey);
            Dictionary<int, string> puzzelGroupDic = puzzelGroupResult.result.ToDictionary(group => group.id, group => group.name);

            puzzelTokenResponse.groupName = "NotFound";
            string groupName = "";
            if (puzzelGroupDic.TryGetValue(userGroupId, out groupName))
            {
                puzzelTokenResponse.groupName = groupName;
            }

            Log.Information("(PostValidateUser) User Validated: {UserId} {@Result}",
                puzzelTokenResponse.result.userId, puzzelTokenResponse.result);

            await WriteToSql(puzzelTokenResponse.result);

            return puzzelTokenResponse;
        }

        private static async Task WriteToSql(TokenResult result)
        {
            SqlParameter[] sqlParameters = new SqlParameter[]
            {
                new SqlParameter("customerKey", result.customerKey),
                new SqlParameter("customerId", result.customerId),
                new SqlParameter("userGroupId", result.userGroupId),
                new SqlParameter("userId", result.userId),
                new SqlParameter("languageId", result.languageId),
                new SqlParameter("languageCode", result.languageCode),
                new SqlParameter("loginDateTime", DateTime.Now)
            };

            await NdSql.NdStoredProcedureInsertUpdate("InsertAgentLogin", sqlParameters);
        }
    }
}
