using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Backend.Models
{
    public class PresenceHubTokenGet
    {
        public string grant_type { get; set; }
        public string client_id { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public string client_secret { get; set; }
    }

    public class PresenceHubTokenResponse
    {
        public string access_token { get; set; }
        public int expires_in { get; set; }
        public int refresh_expires_in { get; set; }
        public string refresh_token { get; set; }
        public string token_type { get; set; }
    }


    public class PresenceHubUserResponse
    {
        public bool doNotDisturb { get; set; }
        public PresenceHubPersonalAssist personalAssist { get; set; }
        public string hookStatus { get; set; }
        public string state { get; set; }
        public PresenceHubCallForwardingAlways callForwardingAlways { get; set; }
        public DateTime lastUpdate { get; set; }
    }

    public class PresenceHubPersonalAssist
    {
        public string PersonalAssist { get; set; }
        public bool EnableExpirationTime { get; set; }
        public bool EnableTransferToAttendant { get; set; }
        public bool RingSplash { get; set; }
        public bool AlertMeFirst { get; set; }
        public int NumberOfRings { get; set; }
        public DateTime? ExpirationTime { get; set; }
    }

    public class PresenceHubCallForwardingAlways
    {
        public bool Active { get; set; }
        public string ForwardToPhoneNumber { get; set; }
        public bool RingSplash { get; set; }
    }
}