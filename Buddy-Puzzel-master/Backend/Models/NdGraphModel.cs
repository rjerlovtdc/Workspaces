

using Microsoft.Graph;
using System;

namespace Backend.Models
{
    public class NdMsGraphSecret
    {
        public string Directory { get; set; } = string.Empty;
        public string Application { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }


    public class NdGraphToken
    {
        public string token_type { get; set; }
        public string scope { get; set; }
        public string expires_in { get; set; }
        public string ext_expires_in { get; set; }
        public string expires_on { get; set; }
        public string not_before { get; set; }
        public string resource { get; set; }
        public string access_token { get; set; }
        public string refresh_token { get; set; }
        public string id_token { get; set; }
    }

    public class NdGraphUser : User
    {
        public string extension_adb1a8367fbe467da1940784be191685_division { get; set; }  //NetDesign
        public string extension_a58d543096d14d9c9b2e68592c652b23_division { get; set; }  //ITF
        public string extension_c55a9e274003458882ffa9c6549eb9af_division { get; set; }  //ITF2
        public string ndDivision { get; set; }

    }
}


public class NdScaleAdmin
{
    public string vk { get; set; }
    public string userName { get; set; }
    public string userPassword { get; set; }
    public string user { get; set; }
}



public class NdMsalError
{
    public string error { get; set; }
    public string error_description { get; set; }
    public int[] error_codes { get; set; }
    public string timestamp { get; set; }
    public string trace_id { get; set; }
    public string correlation_id { get; set; }
    public string error_uri { get; set; }
}
