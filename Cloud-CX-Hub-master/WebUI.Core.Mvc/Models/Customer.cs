namespace WebUI.Core.Mvc.Models;

public class Customer
{
    public ICollection<Change> Changes { get; set; } = new List<Change>();
    public string Name { get; set; }
    public string Phone { get; set; }
    public string Address { get; set; }
    
    public ICollection<User> Users { get; set; } = new List<User>();
    
    private Guid custId = Guid.NewGuid();


    public Customer()
    {
    }

    public Customer(string name, string phone, string address)
    {
        Name = name;
        Phone = phone;
        Address = address;
    }

    public Guid CustId
    {
        get => custId;
        set => custId = value;
    }

}