using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Microsoft.Graph.Authentication;
using Microsoft.Graph.Models;
using Microsoft.Kiota.Abstractions;
using Microsoft.Kiota.Abstractions.Authentication;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;
using WebUI.Core.Mvc.Services.Graph;
using User = WebUI.Core.Mvc.Models.User;

namespace WebUI.Core.Mvc;

public class Init
{
    public static ApplicationDb db;
    public static UserCollectionResponse usersResult;
    public static DomainCollectionResponse domainsResult = new DomainCollectionResponse();

    public static async void Run()
    {
        db = new ApplicationDb();
        Console.WriteLine($"Started and called GraphHelper at: {DateTime.Now}");        
        Console.WriteLine($"Started and called GraphHelper at: {DateTime.Now}");
        usersResult = await GraphHelper.GetUsersAsync();
        domainsResult = await GraphHelper.GetDomainsAsync();
        addCreatedUsers();
        Creator.createCustomer("TDC", "1290381", "Sletvej 30");
        db.SaveChanges();
    }

    public static void addCreatedUsers()
    {
        DbSet<WebUI.Core.Mvc.Models.User> users = db.Users;
        DbSet<Customer> customers = db.Customers;
        Console.WriteLine("Adding created users");
        try
        {
            foreach (var user in users)
            {
                if (user.Customer != null)
                {
                    var customer = customers.FirstOrDefault(c => c.CustId == user.Customer.CustId);
                    customer.Users.Add(user);
                    user.Customer = customer;
                }
            }
        }
        catch (InvalidCastException e)
        {
            Console.WriteLine(e);
        }
    }
}