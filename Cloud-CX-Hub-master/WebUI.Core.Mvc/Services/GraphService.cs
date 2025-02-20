using Azure.Identity;
using Microsoft.Graph;

namespace WebUI.Core.Mvc.Services;

public class GraphService
{
    private string[] scopes = new[] { "User.Read", "Mail.Read" };

    private string tenantId = "common";
    
    private string clientId = "d1b0b3b7-7f3b-4b7b-8b3b-3f3b7b3b7b3b";
    
    

}