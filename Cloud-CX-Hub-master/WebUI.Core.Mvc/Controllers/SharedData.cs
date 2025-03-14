using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;

namespace WebUI.Core.Mvc.Services;

internal static class SharedData
{
    public static string CustomerName { get; set; }
    public static User SignedInUser { get; set; }
    public static ApplicationDb db = Init.db;
}