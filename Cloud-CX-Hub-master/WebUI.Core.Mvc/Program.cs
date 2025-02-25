using System.Collections.Immutable;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using Azure.Identity;
using Castle.Components.DictionaryAdapter.Xml;
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
using NuGet.Versioning;

string clientId = "aac91e08-a40e-45c2-a204-51339371d299";
string tenantId = "84adce5c-2f55-4a74-bb37-3f1609020ba2";
string auhtority = $"https://login.microsoftonline.com/{tenantId}";

var builder = WebApplication.CreateBuilder();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();


Console.WriteLine("App is building...");
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));


builder.Services.AddControllersWithViews()
    .AddMicrosoftIdentityUI();

builder.Services.AddHttpContextAccessor();

var app = builder.Build();
Console.WriteLine("Finished building app");

app.UseAuthentication();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
}

app.UseHttpsRedirection();
app.UseStaticFiles();

//Token acquisition

// async Task GetATokenForGraph()
// {
//     string clientId = builder.Configuration["AzureAD:ClientId"];
//     Console.WriteLine(clientId);
//     string authority = "https://login.microsoftonline.com/84adce5c-2f55-4a74-bb37-3f1609020ba2";
//     string redirectUri = "https://rjvm.northeurope.cloudapp.azure.com/AdminPortal";
//     string[] scopes = new [] { "User.Read", "Mail.Read", "Group.Read.All" };
//
//     IPublicClientApplication app = PublicClientApplicationBuilder
//         .Create(clientId)
//         .WithAuthority(authority)
//         .Build();
//     
//     var accounts = await app.GetAccountsAsync();
//     Console.WriteLine($"Authority: {authority}");
//     Console.WriteLine($"Accounts: {accounts.Count()}");
//     
//     
//     AuthenticationResult result = null;
//     
//     if (accounts.Any())
//     {
//         Console.WriteLine("Account found");
//         Console.WriteLine("Attempting to acquire token silently");
//         result = await app.AcquireTokenSilent(scopes, accounts.FirstOrDefault())
//             .ExecuteAsync();
//     }
//     else
//     {
//         try
//         {
//             Console.WriteLine("No account found");
//             Console.WriteLine("Starting interactive authentication");
//             result = await app.AcquireTokenByIntegratedWindowsAuth(scopes)
//                 .ExecuteAsync(CancellationToken.None);
//             Console.WriteLine(result.AccessToken);
//         }
//         catch (MsalUiRequiredException msuiex)
//         {
//             Console.WriteLine($"MsalUiRequiredException: {msuiex.Message}");
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
    
    // try {
    //     Console.WriteLine(result.Account);
    // }
    // catch (Exception ex)
    // {
    //     Console.WriteLine($"Exception: {ex.Message}");
    // }
// }

// await GetATokenForGraph();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Overview}/{id?}");


app.Run();

