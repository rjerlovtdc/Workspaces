using System;
using System.Net;

namespace Backend.Models
{
    public class NdResponse
    {
        public HttpStatusCode StatusCode { get; set; }
        public bool HasError { get; set; } = false;
        public int ErrorCode { get; set; } = 0;
        public string ErrorText { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Exception ErrorException { get; set; }
        public DateTime TimeRequested { get; set; }
    }

    public class NdResponse<T> : NdResponse
    {
        public T Data { get; set; }
    }


    public class NdToken
    {
        public string CachedToken { get; set; } = string.Empty;
        public DateTime CachedTokenExpire { get; set; } = DateTime.MinValue;
    }

    public class NdServerInfo : NdResponse
    {
        public int ServerNumber { get; set; }
        public string ServerShortName { get; set; } = string.Empty;
        public string ServerHostName { get; set; } = string.Empty;
        public string ServerIp { get; set; } = string.Empty;
        public string ApplicationType { get; set; } = string.Empty;
    }

    public class NdScaleUserCached
    {
        public string number { get; set; } = string.Empty;
        public string userId { get; set; } = string.Empty;
        public bool pfaLicense { get; set; } = false;
        public DateTime lastUpdated { get; set; }
    }
}
