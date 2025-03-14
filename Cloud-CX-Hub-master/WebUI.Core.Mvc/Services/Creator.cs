using Microsoft.CodeAnalysis.CSharp.Syntax;
using PasswordGenerator;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;

namespace WebUI.Core.Mvc.Data;

public class Creator
{
    private static Password pwd = new Password(4);
    private static Random random = new Random();

    public static void createUser(Guid id, string displayName, string givenName, string surName, string? jobTitle,
        string? officeLocation, string? userPrincipalName, string? mobilePhone, string? mail)
    {
        string password = new Password(4).Next();
        password = PasswordHasher.Hash(password);

        var newUser = new User(
            id,
            displayName,
            givenName,
            surName,
            jobTitle,
            officeLocation,
            userPrincipalName,
            mobilePhone,
            mail,
            password
        );
        if (newUser.Mail == "rjer@sw8p.onmicrosoft.com")
        {
            newUser.Access = AccessRights.Admin;
        }

        if (newUser.Mail == "rjer@tdc.dk")
        {
            newUser.Access = AccessRights.Admin;
        }

        var customers = Init.db.Customers.ToList();
        if (!customers.Any())
        {
            throw new InvalidOperationException("No customers available in the database");
        }

        int randomIndex = random.Next(customers.Count);
        Customer randomCustomer = customers[randomIndex];
        if (!randomCustomer.Users.Contains(newUser))
        {
            newUser.Customer = randomCustomer;
            Console.WriteLine($"User added to: {randomCustomer.Name}");
            Console.WriteLine("------------------------------------------------");
            Console.WriteLine(
                $"Customer: {randomCustomer.Name} has {randomCustomer.Users.Count} user{(randomCustomer.Users.Count == 1 ? "" : "s")}");
        }
        Console.WriteLine("------------------------------------------------");
    }

    public static void createCustomer(string name, string phone, string address)
    {
        var newCustomer = new Customer
        (
            name,
            phone,
            address
        );
        Init.db.Customers.Add(newCustomer);

        var adminUser = new User(
            Guid.NewGuid(),
            "Rasmus Jerlov",
            "Rasmus",
            "Jerlov",
            null,
            null,
            null,
            null,
            "rjer@google.dk",
            "hej123"
        );
        adminUser.Password = PasswordHasher.Hash(adminUser.Password);

        var managerUser = new User(
            Guid.NewGuid(),
            "Morten Hansen",
            "Morten",
            "Hansen",
            null,
            null,
            null,
            null,
            "mhan@google.dk",
            "hej123"
        );
        managerUser.Password = PasswordHasher.Hash(managerUser.Password);

        var noRightsUser = new User(
            Guid.NewGuid(),
            "Nina Hansen",
            "Nina",
            "Hansen",
            null, null, null, null,
            "nhan@google.dk",
            "hej123"
        );
        noRightsUser.Password = PasswordHasher.Hash(noRightsUser.Password);
        
        adminUser.Access = AccessRights.Admin;
        managerUser.Access = AccessRights.Manager;
        adminUser.Customer = newCustomer;
        managerUser.Customer = newCustomer;
        noRightsUser.Customer = newCustomer;

        Console.WriteLine(
            $"Admin User for {newCustomer.Name} has been created. \nUsername: {adminUser.Mail}\nPassword: {adminUser.Password}\n" +
            $"Access Rights: {adminUser.Access}");
        Console.WriteLine("--------------------------------------------------------");
        Console.WriteLine(
            $"Manager User for {newCustomer.Name} has been created. \nUsername: {managerUser.Mail}\nPassword: {managerUser.Password}\n" +
            $"Access Rights: {managerUser.Access}");
        Console.WriteLine("--------------------------------------------------------");
        Console.WriteLine(
            $"No rights user for {newCustomer.Name} has been created. \nUsername: {noRightsUser.Mail}\nPassword: {noRightsUser.Password}\n" +
            $"Access Rights: {noRightsUser.Access}");
    }

    public static void createChange(User actionUser, User targetUser, AccessRights newRights, string action)
    {
        Change change = new Change(actionUser, targetUser, newRights, DateTime.Now);
        action += $"\tNew rights: {newRights.ToString()}";
        change.Action = action;
        change.OldRights = targetUser.Access ?? AccessRights.NoRights;
        targetUser.Access = newRights;
        Init.db.Changes.Add(change);
        Init.db.Update(targetUser);
        int n = Init.db.SaveChanges();
        Console.WriteLine($"Changes made {n}");
    }
}