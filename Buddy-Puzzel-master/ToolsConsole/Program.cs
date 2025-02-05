using NdCommonSql.Classes;
using NdCommonSql.Models;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ToolsConsole.Classes;
using ToolsConsole.Model;

namespace ToolsConsole
{
    internal class Program
    {
        private static string token = "";
        private static string fileIn = @"C:\Temp\REG_0.csv";

        static void MainOld(string[] args)
        {
            //buildListOfNumbers();
            //Console.WriteLine("Done");
            //Console.ReadKey();
            //TdcCsv.ToCSV(new d
        }

        static async Task<int> Main(string[] args)
        {
            if (args == null || args.Length == 0) {
                return 1;
            }

            await RunAllAsync(args);
            Console.WriteLine("");
            Console.WriteLine("Tryk på en test for at afslutte");
            Console.ReadKey();

            return 0;
        }


        static async Task<int> RunAllAsync(string[] args)
        {
            RestResponse<PresenceHubTokenResponse> response = await TdcPresenceHub.GetScalePresenceHubToken();
            if (!response.IsSuccessful)
            {
                return 1;
            }

            token = response.Data.access_token;

            string fileIn1 = String.Format(@"C:\Temp\{0}_0.csv", args[0]);
            string fileIn2 = String.Format(@"C:\Temp\{0}_1.csv", args[0]);

            Presence(fileIn1);
            await PresenceFromId(fileIn2);

            return 0;
        }


        static async Task<int> PresenceFromId(string fileIn)
        {
            RestResponse<ScalePresence> phubResponse;

            int iCounter = 0, milliseconds = 0, millisecondsSum = 0; ;
            string[] rows = File.ReadAllLines(fileIn);
            DateTime start;

            string logRow = string.Empty;
            string[] logRows = new string[] { };

            foreach (string row in rows)
            {
                start = DateTime.Now;

                phubResponse = await TdcPresenceHub.GetScalePresenceFromId(row, token);
                milliseconds = (DateTime.Now - start).Milliseconds;

                if (phubResponse.IsSuccessful)
                {
                    logRow = row + " :: " + phubResponse.Data.hookStatus;
                }
                else
                {
                    logRow = row + " :: NotFound";
                }

                millisecondsSum += milliseconds;
                iCounter++;

                logRows = logRows.Append<string>(logRow + " :: " + milliseconds + "ms").ToArray();

                Console.WriteLine("PID" + iCounter.ToString("0000") + "  " + logRow + " :: " + milliseconds);
            }

            int avgWait = (millisecondsSum / iCounter);

            logRows = logRows.Append<string>("").ToArray();
            logRows = logRows.Append<string>("Number of rows: " + iCounter).ToArray();
            logRows = logRows.Append<string>("Total wait: " + millisecondsSum).ToArray();
            logRows = logRows.Append<string>("Average wait: " + avgWait).ToArray();
            logRows = logRows.Append<string>("").ToArray();

            File.WriteAllLines(@"C:\Temp\pid-logRows.txt", logRows);

            Console.WriteLine("");
            Console.WriteLine("Number of rows: {0}", iCounter);
            Console.WriteLine("Total wait: {0}", millisecondsSum);
            Console.WriteLine("Average wait: {0}", avgWait);

            return 0;
        }


        static async Task<int> Presence(string fileIn)
        {
            RestResponse<Presence> phubResponse;

            int iCounter = 0, milliseconds = 0, millisecondsSum = 0;
            string[] rows = File.ReadAllLines(fileIn);
            DateTime start;

            string logRow = string.Empty;
            string[] logRows = new string[] { };

            foreach (string row in rows)
            {
                start = DateTime.Now;

                phubResponse = await TdcPresenceHub.GetScalePresence(row, token);
                milliseconds = (DateTime.Now - start).Milliseconds;

                if (phubResponse.IsSuccessful && phubResponse.Data.scale != null)
                {
                    logRow = row + " :: " + phubResponse.Data.scale.hookStatus;
                }
                else
                {
                    logRow = row + " :: NotFound";
                }

                millisecondsSum += milliseconds;
                iCounter++;

                logRows = logRows.Append<string>(logRow + " :: " + milliseconds + "ms").ToArray();

                Console.WriteLine("P" + iCounter.ToString("0000") + "  " + logRow + " :: " + milliseconds);
            }

            int avgWait = (millisecondsSum / iCounter);

            logRows = logRows.Append<string>("").ToArray();
            logRows = logRows.Append<string>("Number of rows: " + iCounter).ToArray();
            logRows = logRows.Append<string>("Total wait: " + millisecondsSum).ToArray();
            logRows = logRows.Append<string>("Average wait: " + avgWait).ToArray();
            logRows = logRows.Append<string>("").ToArray();

            File.WriteAllLines(@"C:\Temp\p-logRows.txt", logRows);

            Console.WriteLine("");
            Console.WriteLine("Number of rows: {0}", iCounter);
            Console.WriteLine("Total wait: {0}", millisecondsSum);
            Console.WriteLine("Average wait: {0}", avgWait);

            return 0;
        }


        static async Task<int> WriteCsvFileFromFarlonDb(string spName, string filePath, string orgName = "")
        {
            string connectString =
                ConfigurationManager.ConnectionStrings["farlonCS"].ConnectionString;

            NdDatabase ndDatabase = new NdDatabase(connectString);

            SqlParameter[] sqlParameters = new SqlParameter[] {
                new SqlParameter("@importSource", orgName)
            };

            NdResponse<DataTable> ndRespone =
            await NdDatabase.GetDataTableFromStoredProcedure(spName, sqlParameters);
            //await NdDatabase.GetDataTableFromSqlQuery(queryTxt);

            WriteToCsv(ndRespone.Data, filePath);
            return 0;

        }

        static void WriteToCsv(DataTable dt, string filePath)
        {
            StringBuilder sb = new StringBuilder();
            string[] columnNames = dt.Columns.Cast<DataColumn>().Select(column => column.ColumnName).ToArray();
            sb.AppendLine(string.Join(";", columnNames));
            int counter = 0;

            foreach (DataRow row in dt.Rows)
            {
                string[] fields = row.ItemArray.Select(field =>
                    field.ToString().Replace("\r\n", "\\n").Replace("\n", "\\n").Replace(";", ",")).ToArray();
                sb.AppendLine(string.Join(";", fields));
                counter++;
                if (counter % 100 == 0)
                {
                    Console.Write(".");
                }
            }

            File.WriteAllText(filePath, sb.ToString());
        }

        static Dictionary<string, string> GetListOfIds(string filePath)
        {
            Dictionary<string, string> idsList = new Dictionary<string, string>();
            string[] rows = File.ReadAllLines(filePath);

            foreach (string row in rows)
            {
                string id = row.Split(';')[0].Replace("\"", "");
                if (!idsList.ContainsKey(id))
                {
                    idsList.Add(id, row.Replace("\"", ""));
                }
            }

            return idsList;
        }

        static void buildListOfNumbers()
        {
            string[] numbers = new string[] { };

            string fileIn = @"C:\Users\m84058\OneDrive - TDC\Kunder\Region Syd\Puzzel\SVS.csv";
            string fileOut = @"C:\Temp\SVS_0.csv";

            string[] rows = File.ReadAllLines(fileIn);

            foreach (string row in rows)
            {
                if (!String.IsNullOrEmpty(row))
                {

                    string[] columns = row.Replace("\"", "").Split(';');
                    string mobile = columns[2];
                    if (mobile.Length == 8)
                    {
                        string savedRow = mobile;
                        //string savedRow = "m" + mobile + "@vk141864.hvoip.dk";
                        numbers = numbers.Append<string>(savedRow).ToArray();
                    }
                }
            }

            File.WriteAllLines(fileOut, numbers);
        }


        static DataTable GetDataTableFromCsv(string filePath)
        {
            //reading all the lines(rows) from the file.
            string[] rows = File.ReadAllLines(filePath);

            DataTable dt = new DataTable();
            string[] rowValues = null;
            DataRow dr = dt.NewRow();

            //Creating columns
            if (rows.Length > 0)
            {
                foreach (string columnName in rows[0].Split(';'))
                    dt.Columns.Add(columnName);
            }

            //Creating row for each line.(except the first line, which contain column names)
            for (int row = 1; row < rows.Length; row++)
            {
                rowValues = rows[row].Split(';');
                dr = dt.NewRow();
                dr.ItemArray = rowValues;
                dt.Rows.Add(dr);
            }

            return dt;
        }
    }
}