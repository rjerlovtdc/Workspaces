using System.Collections.Immutable;
using System.Linq.Expressions;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using WebUI.Core.Mvc;
using Microsoft.Identity.Web.TokenCacheProviders;
using Microsoft.Kiota.Abstractions.Authentication;
using Moq;


var builder = WebApplication.CreateBuilder();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();


Console.WriteLine("App is building...");
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));


builder.Services.AddControllersWithViews()
    .AddMicrosoftIdentityUI();

var app = builder.Build();
Console.WriteLine("Finished building app");

app.UseAuthentication();

Console.WriteLine("App.UseAuthentication() and App.UseAuthorization() called");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();


// static async Task GetATokenForGraph()
// {
//     string clientSecret = "5c198d5b-359f-4e0e-806e-4a58c77521af";
//     string clientId = "aac91e08-a40e-45c2-a204-51339371d299";
//     string authority = "https://login.microsoftonline.com/84adce5c-2f55-4a74-bb37-3f1609020ba2";
//     string redirectUri = "https://rjvm.northeurope.cloudapp.azure.com/AdminPortal";
//     
//     string[] scopes = new [] { "User.Read", "Application.Read.All" };
//     IConfidentialClientApplication msalApp = ConfidentialClientApplicationBuilder
//         .Create(clientId)
//         .WithClientSecret(clientSecret)
//         .WithAuthority(authority)
//         .WithRedirectUri(redirectUri)
//         .Build();
//     
//     
//     Console.WriteLine($"Authority: {authority}");
//     var accounts = await msalApp.GetAccountsAsync();
//     
//     Console.WriteLine($"Accounts: {accounts.Count()}");
//     AuthenticationResult result = null;
//     
//     if (accounts.Any())
//     {
//         Console.WriteLine("Account found");
//         Console.WriteLine("Attempting to acquire token silently");
//         result = await msalApp.AcquireTokenSilent(scopes, accounts.FirstOrDefault())
//             .ExecuteAsync();
//     }
//     else
//     {
//         try
//         {
//             Console.WriteLine("No account found");
//             Console.WriteLine("Starting interactive authentication");
//             result = await msalApp.AcquireTokenByAuthorizationCode(scopes, clientSecret)
//                 .ExecuteAsync();
//         }
//         catch (MsalUiRequiredException msuiex)
//         {
//             Console.WriteLine($"MsalUiRequiredException: {msuiex.Message}");
//             Console.WriteLine($"Helplink: {msuiex.HelpLink}");
//         }
//         catch (MsalServiceException mservex)
//         {
//             Console.WriteLine($"MsalServiceException: {mservex.Message}");
//         }
//         catch (MsalClientException msce)
//         {
//             Console.WriteLine($"MsalClientException: {msce.Message}");
//             
//         }
//     }
//
//     Console.WriteLine(result.Account);
//     Console.WriteLine(result == null);
// }

// GetATokenForGraph();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Overview}/{id?}");


app.Run();

