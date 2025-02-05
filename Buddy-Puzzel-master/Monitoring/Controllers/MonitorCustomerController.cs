using Monitoring.Models;
using NdCommonLib;
using Serilog;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;

namespace Monitoring.Controllers
{
    public class MonitorCustomerController : ApiController
    {
        //GET: api/TDC/MonitorCustomer
        public Dictionary<int, NdCustomerInfo> GetCustomerAll()
        {
            return BuildCustomerDictionary();
        }

        //GET: api/TDC/MonitorCustomer/customerId
        public NdCustomerInfo GetCustomerFromId(int customerId)
        {
            Dictionary<int, NdCustomerInfo> ndCustomerInfoList = BuildCustomerDictionary();
            NdCustomerInfo ndCustomerInfo = new NdCustomerInfo();

            if (ndCustomerInfoList.ContainsKey(customerId))
            {
                ndCustomerInfo = ndCustomerInfoList[customerId];
            }
            else
            {
                ndCustomerInfo.CustomerId = customerId;
                ndCustomerInfo.CustomerName = "NotFound";
            }

            return ndCustomerInfo;
        }

        private static Dictionary<int, NdCustomerInfo> BuildCustomerDictionary()
        {
            Log.Debug("BuildCustomerDictionary In");
            Dictionary<int, NdCustomerInfo> ndCustomerInfoList = new Dictionary<int, NdCustomerInfo>();

            ndCustomerInfoList.Add(458631, CreateCustomer(458631, "ABB", 8));
            ndCustomerInfoList.Add(474898, CreateCustomer(474898, "Gribskov", 4));
            ndCustomerInfoList.Add(4054040, CreateCustomer(4054040, "NetDesign", 10));
            ndCustomerInfoList.Add(455160, CreateCustomer(455160, "Novafos", 5));

            ndCustomerInfoList.Add(454056, CreateCustomer(454056, "Odense Kommune", 28));
            ndCustomerInfoList.Add(2647119, CreateCustomer(2647119, "Region Hovedstaden", 35));
            ndCustomerInfoList.Add(454335, CreateCustomer(454335, "Scanvægt", 10));
            ndCustomerInfoList.Add(32273, CreateCustomer(32273, "Kongeballe", 2, "DISABLED"));

            ndCustomerInfoList.Add(454014, CreateCustomer(454014, "IT-Forsyningen", 14));
            ndCustomerInfoList.Add(12820, CreateCustomer(12820, "PFA", 8));
            ndCustomerInfoList.Add(1018811, CreateCustomer(1018811, "Vejdirektoratet", 12));

            Log.Debug("BuildCustomerDictionary Out");
            return ndCustomerInfoList;
        }


        private static NdCustomerInfo CreateCustomer(int customerId, string customerName, int agentCount, string status = "ACTIVE", string license = "TdcAll")
        {

            NdCustomerInfo ndCustomerInfo = new NdCustomerInfo()
            {
                CustomerId = customerId,
                CustomerName = customerName,
                Status = status,
                License = license,
                AgentCount = agentCount

            };

            return ndCustomerInfo;
        }
    }
}
