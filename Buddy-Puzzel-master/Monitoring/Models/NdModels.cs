using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace Monitoring.Models
{
    public class NdResponse
    {
        public HttpStatusCode StatusCode { get; set; }
        public bool HasError { get; set; } = false;
        public int ErrorCode { get; set; }
        public string ErrorText { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Exception ErrorException { get; set; }
        public DateTime TimeRequested { get; set; }
    }


    public class NdResponse<T> : NdResponse
    {
        public T Data { get; set; }
    }


    public class NdServerInfo : NdResponse
    {
        public string ApplicationEnvironment { get; set; }
        public string ApplicationType { get; set; }
        public string CmdbName { get; set; }
        public int ServerNumber { get; set; }
        public string ServerHostName { get; set; }
        public string ServerFqdnName { get; set; }
        public string ServerIp { get; set; }
    }

    public class NdCustomerInfo
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string Status { get; set; }
        public string License { get; set; }
        public int AgentCount { get; set; }
    }
}