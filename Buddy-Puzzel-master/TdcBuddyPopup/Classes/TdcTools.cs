using Serilog;
using System.Diagnostics;
using TdcBuddyPopup.Models;
using static System.Net.Mime.MediaTypeNames;

namespace TdcBuddyPopup.Classes
{
    public static class TdcTools
    {
        public static void RunCommand(Tdcsettings settings, string argument)
        {
            Log.Verbose("(RunCommand) In");

            try
            {
                using Process process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        WorkingDirectory = settings.WorkingFolder,
                        FileName = settings.FileName,
                        UseShellExecute = settings.UseShellExecute,
                        RedirectStandardOutput = false,
                        RedirectStandardError = false,
                        RedirectStandardInput = false,
                        CreateNoWindow = settings.CreateNoWindow,
                        Arguments = settings.ArgumentName + argument
                    }
                };
                Log.Debug($"(RunCommand) CMD = ${settings.FileName}" + " " + settings.ArgumentName + argument);


                process.Start();
            }
            catch (Exception ex)
            {
                Log.Fatal("(RunCommand) process.start: {Message}", ex.Message);
            }

            Log.Verbose("(RunCommand) Out");
        }
    }
}
