using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Backend.Models
{
    public class NdPuzzelSecret
    {
        public string CustomerKey { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class NdPuzzelResponse : NdResponse
    {
        public string accessToken { get; set; }
        public RefreshToken refreshToken { get; set; }
        public string languageCode { get; set; }
        public bool twoFactorRequired { get; set; }
        public string twoFactor { get; set; }
        public bool logoutFromExternalIdentityProvider { get; set; }
    }

    public class PuzzelTokenResponse : NdResponse
    {
        public TokenResult result { get; set; }
        public int code { get; set; }
        public string groupName { get; set; }
        public string eMail { get; set; } = string.Empty;
    }

    public class TokenResult
    {
        public string customerKey { get; set; }
        public int customerId { get; set; }
        public int userGroupId { get; set; }
        public int userId { get; set; }
        public int languageId { get; set; }
        public string languageCode { get; set; }
        public string accessTokenExpiry { get; set; }
        public DateTime accessTokenExpiryIso { get; set; }
    }

    public class RefreshToken
    {
        public string customerKey { get; set; }
        public string sessionId { get; set; }
        public DateTime expiryDate { get; set; }
    }


    public class PuzzelUserResult : NdResponse
    {
        public ResultUser result { get; set; }
        public int code { get; set; }

    }

    public class ResultUser
    {
        public int currentProfileId { get; set; }
        public string contactCentreStatus { get; set; }
        public string userStatus { get; set; }
        public int languageId { get; set; }
        public Profile[] profiles { get; set; }
        public string eMail { get; set; }
        public string mobilePhone { get; set; }
        public int id { get; set; }
        public int groupId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string userName { get; set; }
    }

    public class Profile
    {
        public int id { get; set; }
        public int number { get; set; }
        public string phoneNumber { get; set; }
        public string phoneType { get; set; }
        public string name { get; set; }
        public bool groupProfile { get; set; }
        public object[] qualities { get; set; }
    }

    public class PuzzelGroupResult : NdResponse
    {
        public ResultGroup[] result { get; set; }
        public int code { get; set; }
    }

    public class ResultGroup
    {
        public int id { get; set; }
        public string name { get; set; }
    }

    public class PuzzelAgentsResult : NdResponse
    {
        public ResultAgents[] result { get; set; }
        public int code { get; set; }
    }

    public class ResultAgents
    {
        public int id { get; set; }
        public int groupId { get; set; }
        public string groupName { get; set; } = "";
        public string firstName { get; set; } = "";
        public string lastName { get; set; } = "";
        public string userName { get; set; }
    }
}