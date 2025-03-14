namespace WebUI.Core.Mvc.Models;

public class Change
{
    public Guid ActionId { get; set; }
    public User ActionUser { get; set; }
    public User TargetUser { get; set; }
    public AccessRights NewRights { get; set; }
    public AccessRights OldRights { get; set; }
    public DateTime TimeStamp { get; set; }
    
    public string Action { get; set; }

    public Change(User actionUser, User targetUser, AccessRights newRights, DateTime timeStamp)
    {
        ActionUser = actionUser;
        TargetUser = targetUser;
        NewRights = newRights;
        TimeStamp = timeStamp;
    }

    public Change()
    {
        
    }
}