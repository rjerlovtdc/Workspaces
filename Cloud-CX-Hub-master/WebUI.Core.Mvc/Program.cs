using System.Collections.Immutable;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Identity.Client;
using WebUI.Core.Mvc;
using Microsoft.Identity.Web.TokenCacheProviders;


var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();


Console.WriteLine("App is building...");
// Add services to the container.

builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("Security Reader")); // Ensure this matches the role name in Azure AD
});

builder.Services.AddControllersWithViews();
var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
Console.WriteLine("Running token acquisition");

static async Task GetATokenForGraph()
{
    string authority = "https://login.microsoftonline.com/84adce5c-2f55-4a74-bb37-3f1609020ba2";
    string[] scopes = new [] { "User.Read" };
    IPublicClientApplication msalApp = PublicClientApplicationBuilder
        .Create("aac91e08-a40e-45c2-a204-51339371d299")
        .WithAuthority(authority)
        .Build();

    Console.WriteLine($"Authority: {authority}");
    
    var accounts = await msalApp.GetAccountsAsync();

    Console.WriteLine($"Accounts: {accounts.Count()}");

    AuthenticationResult result = null;

    if (accounts.Any())
    {
        result = await msalApp.AcquireTokenSilent(scopes, accounts.FirstOrDefault())
            .ExecuteAsync();
    }
    else
    {
        try
        {
            result = await msalApp.AcquireTokenByIntegratedWindowsAuth(scopes)
                .ExecuteAsync();
        }
        catch (MsalUiRequiredException msuiex)
        {
            Console.WriteLine($"MsalUiRequiredException: {msuiex.Message}");
        }
        catch (MsalServiceException mservex)
        {
            Console.WriteLine($"MsalServiceException: {mservex.Message}");
        }
        catch (MsalClientException msce)
        {
            Console.WriteLine($"MsalClientException: {msce.Message}");
            
        }
    }

    Console.WriteLine(result.Account);
    Console.WriteLine(result == null);
}

GetATokenForGraph();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Login}/{id?}");


app.Run();

