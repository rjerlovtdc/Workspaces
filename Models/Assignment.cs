namespace TDCTaskflow.Models;

public class Assignment
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public List<Developer> Developers { get; set; }
    public string Description { get; set; }
    public AssignmentStatus Status { get; set; }
}