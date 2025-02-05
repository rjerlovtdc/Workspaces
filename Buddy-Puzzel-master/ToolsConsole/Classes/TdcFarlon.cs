using NdCommonSql.Classes;
using NdCommonSql.Models;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace ToolsConsole.Classes
{
    internal class TdcFarlon
    {
        public static async Task<DataTable> GetFarlonTable(string orgName = "")
        {
            ConnectionStringSettings settings = ConfigurationManager.ConnectionStrings["farlonCS"];
            string connectString = settings.ConnectionString;
            NdDatabase ndDatabase = new NdDatabase(connectString);

            SqlParameter[] sqlParameters = new SqlParameter[] {
                new SqlParameter("importSource", orgName)
            };

            NdResponse<DataTable> ndRespone =
                await NdDatabase.GetDataTableFromStoredProcedure("TdcExportToPuzzel", sqlParameters);

            return ndRespone.Data;
        }
    }
}
