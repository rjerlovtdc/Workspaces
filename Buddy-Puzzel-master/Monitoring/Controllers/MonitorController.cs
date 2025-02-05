using Monitoring.Models;
using NdCommonLib;
using Serilog;
using System.Net;
using System.Web.Http;

namespace Monitoring.Controllers
{
    /**
            <summary>Monitoring.Controllers</summary>
    */
    public class MonitorController : ApiController
    {
        /**
            <summary>GetStatus</summary>
            <remarks>KUK</remarks>
            <param name="dtDataTable">DataTable</param>
            <param name="strFilePath">Filepath for output</param>
            <returns>void</returns>
            <example>Eksempel <c>Kode</c></example>
        */
        public NdServerInfo GetStatus()
        {
            Log.Debug("GetStatus In");

            string serverInfoFilePath = @"C:\NetDesign\ServerInfo\backend.json";
            NdServerInfo ndServerInfo = NdFileHelper.ReadFile<NdServerInfo>(serverInfoFilePath);

            ndServerInfo.StatusCode = HttpStatusCode.OK;
            ndServerInfo.HasError = false;
            ndServerInfo.Message = "TDC BUDDY Backend - Responding";

            Log.Debug("GetStatus Out");
            return ndServerInfo;
        }
    }
}
