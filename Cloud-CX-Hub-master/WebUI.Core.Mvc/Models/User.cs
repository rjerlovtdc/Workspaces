using Microsoft.AspNetCore.Identity;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Models;

public class User
{
    
    public AccessRights? Access { get; set; } = AccessRights.NoRights;
    public string DisplayName { get; set; }
    public string GivenName { get; set; }
    public string SurName { get; set; }
    public string? JobTitle { get; set; }
    public string? OfficeLocation { get; set; }
    public string? UserPrincipalName { get; set; }
    public string? MobilePhone { get; set; }
    public string? Mail { get; set; }
    public Guid? UserId { get; set; }
    private Customer? customer;
    private Guid? customerId;
    public string? Password { get; set; }
    public ICollection<Change> Changes { get; set; } = new List<Change>();
    public User()
    {
    }

    public User(Guid id, string displayName, string givenName, string surName, string? jobTitle, string? officeLocation, string? userPrincipalName, string? mobilePhone, string? mail, string password)
    {
        UserId = id;
        DisplayName = displayName;
        GivenName = givenName;
        SurName = surName;
        JobTitle = jobTitle;
        OfficeLocation = officeLocation;
        UserPrincipalName = userPrincipalName ?? Mail;
        MobilePhone = mobilePhone;
        Mail = mail;
        Password = password;
    }

    public Customer? Customer
    {
        get => customer;
        set
        {
            customer = value; 
            customer.Users.Add(this);
        }
    }

    public Guid? CustomerId
    {
        get => customerId;
        set
        {
            customerId = value;
            
        }
    }
    
}