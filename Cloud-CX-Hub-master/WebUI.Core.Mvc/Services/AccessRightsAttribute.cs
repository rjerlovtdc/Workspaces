using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using WebUI.Core.Mvc.Models;

namespace WebUI.Core.Mvc.Services;

public class AccessRightsAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly AccessRights _requiredAccessRights;

    public AccessRightsAttribute(AccessRights requiredAccessRights)
    {
        _requiredAccessRights = requiredAccessRights;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user == null || !user.Identity.IsAuthenticated)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userAccessRights = (AccessRights)Enum.Parse(typeof(AccessRights), user.FindFirst("AccessRights").Value);
        if (userAccessRights < _requiredAccessRights)
        {
            context.Result = new ForbidResult();
        }
    }
}