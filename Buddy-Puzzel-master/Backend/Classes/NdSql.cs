using Backend.Models;
using Microsoft.Graph.SecurityNamespace;
using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.StartPanel;

namespace Backend.Classes
{
    public class NdSql
    {
        public static string GetConnectionString()
        {
            ConnectionStringSettings settings = ConfigurationManager.ConnectionStrings["buddyCS"];

            if (settings != null)
            {
                // Retrieve the partial connection string.
                string connectString = settings.ConnectionString;

                // Create a new SqlConnectionStringBuilder
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(connectString)
                {
                    // Supply the additional values.
                    //DataSource = dataSource,
                    //UserID = userName,
                    //Password = "Password1"
                    Password = "igyjP;zrm|zGwm uddahb+YfmsFT7"
                };
                return builder.ConnectionString;
            }
            return "";
        }

        /* GetOutputParams */
        public static SqlParameter[] GetOutputParams()
        {
            SqlParameter[] sqlParametersOut = {
                new SqlParameter("errorText", SqlDbType.VarChar, 50),
                new SqlParameter("data", SqlDbType.VarChar, 50)
            };

            sqlParametersOut[0].Direction = ParameterDirection.Output;
            sqlParametersOut[1].Direction = ParameterDirection.Output;

            return sqlParametersOut;
        }

        /* GetDataTableFromStoredProcedure */
        public static async Task<NdResponse<DataTable>> GetDataTableFromStoredProcedure(string spName, SqlParameter[] sqlParameters = null, bool outputParams = false)
        {
            Log.Verbose("(GetDataTableFromStoredProcedure) In)");
            string connectionString = GetConnectionString();

            NdResponse<DataTable> ndResponse = new NdResponse<DataTable>();
            ndResponse.Data = new DataTable("ReturnTable");


            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                using (SqlCommand command = new SqlCommand(spName, connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    if (sqlParameters != null)
                    {
                        command.Parameters.AddRange(sqlParameters);
                    }

                    if (outputParams)
                    {
                        command.Parameters.AddRange(GetOutputParams());
                    }

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader.HasRows)
                        {
                            ndResponse.Data.Load(reader);
                        }
                    }

                    if (outputParams)
                    {
                        ndResponse.ErrorText = (string)command.Parameters["errorText"]?.Value;
                    }

                    Log.Debug("(GetDataTableFromStoredProcedure) OK");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "(GetDataTableFromStoredProcedure) Ex)");
                ndResponse.ErrorText = "SQL_Error";
                ndResponse.ErrorException = ex;
            }

            Log.Verbose("(GetDataTableFromStoredProcedure) Out)");

            return ndResponse;
        }


        /* NdStoredProcedureInsertUpdate */
        public static async Task NdStoredProcedureInsertUpdate(string spName, SqlParameter[] sqlParameters)
        {
            Log.Verbose("(NdStoredProcedureInsertUpdate) In)");

            string connectionString = GetConnectionString();
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                using (SqlCommand command = new SqlCommand(spName, connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddRange(sqlParameters);
                    command.CommandTimeout = 5;

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "(NdStoredProcedureInsertUpdate) Ex)");
            }

            Log.Verbose("(NdStoredProcedureInsertUpdate) Out)");
        }
    }
}