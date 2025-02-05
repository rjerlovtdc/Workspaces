using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TdcBuddyPopup.Models;

namespace TdcBuddyPopup.Classes
{
    public static class Tdc
    {
        public static Tdcsettings? GetSettings(IConfigurationRoot config)
        {
            Tdcsettings? tdcSettings = null;

            try
            {
                tdcSettings = config.GetRequiredSection("TdcSettings").Get<Tdcsettings>();
            }
            catch (InvalidOperationException ex)
            {
                Log.Fatal("(GetSettings) Error loading settings: {Message}", ex.Message);
                return tdcSettings;
            }

            Log.Debug("(GetSettings): {@tdcSettings}", tdcSettings);
            return tdcSettings;
        }
    }
}
