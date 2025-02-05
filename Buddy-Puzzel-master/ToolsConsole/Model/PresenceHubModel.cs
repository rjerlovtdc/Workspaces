using System;

namespace ToolsConsole.Model
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

    public class ScalePresence
    {
        public bool doNotDisturb { get; set; }
        public string personalAssist { get; set; } = string.Empty;
        public string hookStatus { get; set; } = string.Empty;
        public string state { get; set; } = string.Empty;
        public Callforwardingalways callForwardingAlways { get; set; }
        public DateTime lastUpdate { get; set; }
    }

    public class Callforwardingalways
    {
        public bool active { get; set; }
        public object forwardToPhoneNumber { get; set; }
    }


    public class Presence
    {
        public object teams { get; set; }
        public Scale scale { get; set; }
        public string number { get; set; }
    }

    public class Scale
    {
        public bool doNotDisturb { get; set; }
        public object personalAssist { get; set; }
        public string hookStatus { get; set; }
        public string state { get; set; }
        public Callforwardingalways callForwardingAlways { get; set; }
        public DateTime lastUpdate { get; set; }
    }

    public class Personalassist
    {
        public string presence { get; set; }
        public bool enableExpirationTime { get; set; }
        public bool enableTransferToAttendant { get; set; }
        public bool alertMeFirst { get; set; }
        public int numberOfRings { get; set; }
        public object expirationTime { get; set; }
    }
}
