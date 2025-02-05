using System;
using System.Xml.Serialization;

namespace Backend.Models.Scale
{
    /* Profile */
    #region Profile

    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class Profile
    {
        public ProfileDetails details { get; set; }

        public ProfileAdditionalDetails additionalDetails { get; set; }

        public uint passwordExpiresDays { get; set; } = 0;

        public string fac { get; set; } = string.Empty;

        public string registrations { get; set; } = string.Empty;

        public string scheduleList { get; set; } = string.Empty;

        public string portalPasswordChange { get; set; } = string.Empty;

        public byte countryCode { get; set; } = 0;

        public string timeZone { get; set; } = string.Empty;

        public string timeZoneDisplayName { get; set; } = string.Empty;


    }

    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    public partial class ProfileDetails
    {
        public string userId { get; set; } = string.Empty;

        public string firstName { get; set; } = string.Empty;

        public string lastName { get; set; } = string.Empty;

        public string hiranganaLastName { get; set; } = string.Empty;

        public string hiranganaFirstName { get; set; } = string.Empty;

        public string groupId { get; set; } = string.Empty;

        public ProfileDetailsServiceProvider serviceProvider;

        public uint number { get; set; } = 0;
    }

    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    public partial class ProfileDetailsServiceProvider
    {
        [System.Xml.Serialization.XmlAttributeAttribute()]
        public bool isEnterprise { get; set; } = false;

        [System.Xml.Serialization.XmlTextAttribute()]
        public string value { get; set; } = string.Empty;
    }

    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    public partial class ProfileAdditionalDetails
    {
        public uint mobile { get; set; } = 0;

        public string emailAddress { get; set; } = string.Empty;

        public string title { get; set; } = string.Empty;

        public string location { get; set; } = string.Empty;
    }
    #endregion  //Profile


    /* Hook Status */
    #region HookStatus
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class HookStatus
    {
        public string hookStatus { get; set; } = string.Empty;
    }
    #endregion  //Hookstatus


    /* Personal Assistant */
    #region PersonalAssistant
    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class PersonalAssistant
    {
        public string presence { get; set; } = string.Empty;

        public bool enableExpirationTime { get; set; } = false;

        public bool enableTransferToAttendant { get; set; } = false;

        public bool ringSplash { get; set; } = false;

        public bool alertMeFirst { get; set; } = false;

        public byte numberOfRings { get; set; } = 0;
    }
    #endregion  //Personal Assistant

    /* DND */
    #region DND
    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class DoNotDisturb
    {
        public bool active { get; set; } = false;

        public bool ringSplash { get; set; } = false;
    }
    #endregion  //DND


    /* Call Forwarding Allways */
    #region CFA
    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class CallForwardingAlways
    {
        public bool active { get; set; } = false;

        public uint forwardToPhoneNumber { get; set; } = 0;

        public bool ringSplash { get; set; } = false;
    }
    #endregion  //CFA


    /* Error Info */
    #region ErrorInfo

    // NOTE: Generated code may require at least .NET Framework 4.5 or .NET Core/Standard 2.0.
    /// <remarks/>
    [System.SerializableAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schema.broadsoft.com/xsi")]
    [System.Xml.Serialization.XmlRootAttribute(Namespace = "http://schema.broadsoft.com/xsi", IsNullable = false)]
    public partial class ErrorInfo
    {
        public string summary { get; set; } = string.Empty;

        public string summaryEnglish { get; set; } = string.Empty;

        public ushort errorCode { get; set; } = 0;
    }
    #endregion  //ErrorInfo


    public class NdScaleProfile : NdResponse
    {
        public string userId { get; set; } = string.Empty;
        public string number { get; set; } = string.Empty;
        public string serviceProvider { get; set; } = string.Empty;
    }


    public class NdHookStatus : NdResponse
    {
        public string userId { get; set; } = string.Empty;
        public string hookStatus { get; set; } = string.Empty;
    }


    public class NdPAStatus : NdResponse
    {
        public string presence { get; set; } = string.Empty;
    }


    public class NdDNDStatus : NdResponse
    {
        public bool active { get; set; } = false;
    }


    public class NdScalePresence : NdResponse
    {
        public string customerKey { get; set; } = string.Empty;
        public string orgPath { get; set; } = string.Empty;
        public string number { get; set; } = string.Empty;
        public string userId { get; set; } = string.Empty;
        public string hookStatus { get; set; } = string.Empty;
        public bool cfaActive { get; set; } = false;
        public uint cfaPhoneNumber { get; set; } = 0;
        public string paPresence { get; set; } = string.Empty;
        public bool dndActive { get; set; } = false;
    }


    public class NdScaleAdmin
    {
        public string vk { get; set; }
        public string userName { get; set; }
        public string userPassword { get; set; }
        public string user { get; set; }
    }


    /* Enums */
    public enum NdScalePresenType
    {
        Phone,
        PA,
        DND
    }

    public enum NdScaleErrorCode : ushort
    {
        ServiceHandlerNotFound = 1113,
        UserNotFound = 4023,
        NoLicense = 4410
    }
}