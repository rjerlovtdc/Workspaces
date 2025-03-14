
using WebUI.Core.Mvc;
using WebUI.Core.Mvc.Models;

var config = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .Build();
var clientSecret = config["AzureAd:ClientSecret"];
var clientId = config["AzureAd:ClientId"];


var builder = WebApplication.CreateBuilder();
Init.Run();
Console.WriteLine("Initializing...");

builder.Services.AddAuthentication().AddMicrosoftAccount(microsoftOptions =>
{
    microsoftOptions.ClientId = clientId;
    microsoftOptions.ClientSecret = clientSecret;
}).AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
});

// Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("AccessRights", AccessRights.Admin.ToString(), AccessRights.Owner.ToString()));

    options.AddPolicy("ManagerOrAdmin", policy =>
        policy.RequireClaim("AccessRights", AccessRights.Manager.ToString(), AccessRights.Admin.ToString(),
            AccessRights.Owner.ToString()));
    
});

builder.Services.AddControllersWithViews();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=HomePage}");

Console.WriteLine("Finished building app");
Console.WriteLine("App running....");
app.Run();