using Microsoft.Extensions.Configuration;
using Serilog;
using TdcBuddyPopup.Classes;
using TdcBuddyPopup.Models;

string appFolderPath = AppContext.BaseDirectory;
string appSettingsPath = Path.Combine(appFolderPath, "appsettings.json");

IConfigurationRoot config = new ConfigurationBuilder()
                .SetBasePath(appFolderPath)
                .AddJsonFile(appSettingsPath, optional: false, reloadOnChange: false)
                .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(config)
    .CreateLogger();

Log.Verbose("(Main) In");

Tdcsettings? tdcSettings = Tdc.GetSettings(config);

if (tdcSettings == null)
{
    {
        Log.Fatal("(Main) Error reading settings");
        TdcClose();
        return;
    }
}

if (args.Length == 0 || args[0].Replace("tdcbuddypopup:", "") == "")
{
    Log.Error("(Main) Argument missing");
    TdcClose();
    return;
}

string lastNumber = "";
string lastNumberFilepath = Path.Combine(appFolderPath, "lastnumber.txt");
string argumentValue = args[0].Replace("tdcbuddypopup:", "");

Log.Debug("appSettingsPath: {AppSettingsPath}", appSettingsPath);
Log.Debug ("lastNumberFilepath: {LastNumberFilepath}", lastNumberFilepath);
Log.Information("ArgumentValue: {ArgumentValue}", argumentValue);

if (tdcSettings.LastNumberTimer != 0)
{
    if (File.Exists(lastNumberFilepath))
    {
        if (DateTime.Now - File.GetLastWriteTime(lastNumberFilepath) < TimeSpan.FromMinutes(tdcSettings.LastNumberTimer))
            lastNumber = File.ReadAllText(lastNumberFilepath);
    }

    if (lastNumber == argumentValue)
    {
        Log.Warning("Number already shown: {Number}", argumentValue);
        TdcClose();
        return;
    }

    File.WriteAllText(lastNumberFilepath, argumentValue);
}

try
{
    TdcTools.RunCommand(tdcSettings, argumentValue);
}
catch (Exception ex)
{
    Log.Fatal(ex, "Program terminated unexpectedly");
}
finally
{
    TdcClose();
}

void TdcClose()
{
    Log.Verbose("(Main) Out");
    Log.CloseAndFlush();
}