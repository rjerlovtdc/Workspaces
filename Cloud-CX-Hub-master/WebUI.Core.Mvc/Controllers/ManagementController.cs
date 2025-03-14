using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using WebUI.Core.Mvc.Data;
using WebUI.Core.Mvc.Models;
using static WebUI.Core.Mvc.Models.User;
using WebUI.Core.Mvc.Services;
using User = Microsoft.Graph.Models.User;

namespace WebUI.Core.Mvc.Controllers
{
    /// <summary>
    /// The ManagementController class is responsible for managing users, access rights,
    /// and organizational structure elements such as groups and departments within an application.
    /// This controller is authorized under the "ManagerOrAdmin" policy.
    /// </summary>
    [Authorize(Policy = "ManagerOrAdmin")] // Manager or Admin Access
    public class ManagementController : Controller
    {
        private readonly ApplicationDb _db = SharedData.db;
        
        public IActionResult Users()
        {
            var customerName = SharedData.CustomerName;
            var customer = _db.Customers.FirstOrDefault(c => c.Name == customerName);
            var users = customer.Users.Where(u => u.Customer.Name == customerName);
            ViewBag.Users = users;
            return View();
        }

        public void UpdateDBAccessRights(Guid actionUserId, Guid targetUserId, AccessRights newRights)
        {
            if (SharedData.SignedInUser.UserId != null)
            {
                actionUserId = SharedData.SignedInUser.UserId ?? actionUserId;
                var targetUser = _db.Users.FirstOrDefault(u => u.UserId == targetUserId);
                var actionUser = _db.Users.FirstOrDefault(u => u.UserId == actionUserId);
                string action =
                    $"{targetUser.DisplayName}'s rights have been changed. Old rights: {targetUser.Access.ToString()}";
                Creator.createChange(actionUser, targetUser, newRights, action);
                RedirectToAction("Users", "Management");
            }
        }
        public IActionResult EditAccess(Guid userId)
        {
            var user = _db.Users.FirstOrDefault(u => u.UserId == userId);
            return View(user);
        }
        public IActionResult Groups()
        {
            return View();
        }
        
        public IActionResult Departments()
        {
            return View();
        }
        public IActionResult License()
        {
            return View();
        }
    }
}