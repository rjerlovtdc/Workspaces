using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph.DeviceManagement.UserExperienceAnalyticsBaselines;
using PasswordGenerator;
using WebUI.Core.Mvc.Models;
using WebUI.Core.Mvc.Services;
using System.Windows.Input;
using DotNetEnv;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.General;

namespace WebUI.Core.Mvc.Data;

public class ApplicationDb : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Change> Changes { get; set; }
    public IConfigurationRoot config = new ConfigurationBuilder()
        .AddUserSecrets<Program>()
        .Build();

    public ApplicationDb()
    {
        Database.EnsureDeleted();
        Database.EnsureCreated();
        
    }



    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        try
        {
            Env.Load();
            string connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
            optionsBuilder.UseSqlServer(connectionString);
            optionsBuilder.EnableSensitiveDataLogging();
            optionsBuilder.LogTo(message => Debug.WriteLine(message));
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            Console.WriteLine($"Connection string might be null");
        }
        
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        //Setting primary key
        modelBuilder.Entity<Customer>().HasKey(c => c.CustId);
        
        //Generates GUID ON CREATE
        modelBuilder.Entity<Customer>()
            .Property(c => c.CustId)
            .ValueGeneratedOnAdd();
        
        modelBuilder.Entity<Customer>().HasMany<User>()
            .WithOne(u => u.Customer)
            .HasForeignKey(u => u.CustomerId);

        // Set up primary key for User
        modelBuilder.Entity<User>().HasKey(u => u.UserId);

        // Generate GUID on creation for User
        modelBuilder.Entity<User>()
            .Property(u => u.UserId)
            .ValueGeneratedNever();

        // A User has exactly one Customer
        modelBuilder.Entity<User>()
            .HasOne(u => u.Customer)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CustomerId);

        // Set up primary key for Change
        modelBuilder.Entity<Change>().HasKey(c => c.ActionId);

        // Generate GUID on creation for Change
        modelBuilder.Entity<Change>()
            .Property(c => c.ActionId)
            .ValueGeneratedOnAdd();

        // A Change has exactly one User connected to it as the ActionUser
        modelBuilder.Entity<Change>()
            .HasOne(c => c.ActionUser)
            .WithMany(u => u.Changes)
            .OnDelete(DeleteBehavior.NoAction); // Optional: Prevent cascade delete
        //Building customer tables with a many to one relationship to customers
        modelBuilder.Entity<Change>()
            .HasOne(c => c.TargetUser);
        

        
        Customer customer1 = new Customer { Address = "Teglholmen", Name = "Nuuday", Phone = "84329123"};
        Customer customer2 = new Customer { Address = "Silkeborgvej 30", Name = "Alm. Brand", Phone = "45123423" };
        
        modelBuilder.Entity<Customer>().HasData(new Customer[]
        {
            customer1, customer2
        });
        

    }
}