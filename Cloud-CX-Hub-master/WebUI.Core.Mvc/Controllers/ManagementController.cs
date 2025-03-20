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
    /// The ManagementController class is responsible for various management tasks within the application,
    /// including managing users, updating access rights, editing access levels, and handling organizational
    /// structures like groups and departments. It also offers functionality related to license management.
    /// The controller enforces access control through the specified "ManagerOrAdmin" policy.
    /// </summary>
    [Authorize(Policy = "ManagerOrAdmin")] // Manager or Admin Access
    public class ManagementController : Controller
    {
        private readonly ApplicationDb _db = SharedData.db;

        public IActionResult Users()
        {
            var customerName = SharedData.CustomerName;
            var customer = _db.Customers.FirstOrDefault(c => c.Name == customerName);
            List<Mvc.Models.User> users = customer.Users.Where(u => u.Customer.Name == customerName).ToList();
            return View(users);
        }
        
        /// <summary>
        /// Updates the database access rights for a specified user.
        /// </summary>
        /// <param name="targetUserId">The ID of the user whose access rights are to be updated.</param>
        /// <param name="newRights">The new access rights to be assigned to the user.</param>
        public IActionResult UpdateDBAccessRights(Guid targetUserId, AccessRights newRights)
        {
            if (SharedData.SignedInUser.UserId != null)
            {
                Guid actionUserId = SharedData.SignedInUser.UserId ?? Guid.NewGuid();
                var targetUser = _db.Users.FirstOrDefault(u => u.UserId == targetUserId);
                var actionUser = _db.Users.FirstOrDefault(u => u.UserId == actionUserId);
                string action =
                    $"{targetUser.DisplayName}'s rights have been changed. \nOld rights: {targetUser.Access.ToString()}\n";
                Creator.createChange(actionUser, targetUser, newRights, action);
            }

            return RedirectToAction("Users", "Management");
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