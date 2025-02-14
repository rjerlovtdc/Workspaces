using Microsoft.Identity.Web;
using Microsoft.Owin.Security.OpenIdConnect;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace WebUI.Core.Mvc.Controllers;

[Authorize]
public class ClaimsController : Controller
{
    public async Task<ActionResult> Index()
    {
        var userClaims = User.Identity as System.Security.Claims.ClaimsIdentity;

        ViewBag.Name = userClaims?.FindFirst("name")?.Value;
        
        ViewBag.Subject = userClaims?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        ViewBag.TenantId = userClaims?.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;

        try
        {
            // var me = await this.Get
        }
        catch (MsalServiceException)
        {
            
        }
        return View();
    }
}