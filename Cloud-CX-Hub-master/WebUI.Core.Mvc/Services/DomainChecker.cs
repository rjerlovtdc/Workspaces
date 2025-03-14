using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Graph.Drives.Item.Items.Item.Workbook.Functions.False;
using Microsoft.Graph.Models;
using WebUI.Core.Mvc.Services.Graph;
using UserIdentity = Microsoft.Graph.Models.CallRecords.UserIdentity;

namespace WebUI.Core.Mvc.Services;

public static class DomainChecker
{
    public static bool IsCustomerNameInPcDomain(string customerName)
    {
        Console.WriteLine(Environment.UserName);
        return false;
    }
}