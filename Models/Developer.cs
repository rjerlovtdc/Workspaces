namespace TDCTaskflow.Models;

public class Developer
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public List<Assignment> Assignments { get; set; }
    public string Email { get; set; }
}