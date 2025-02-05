using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using System;
using System.Net.Http.Formatting;
using System.Web.Http;

namespace Monitoring
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            GlobalConfiguration.Configuration.Formatters.Clear();
            GlobalConfiguration.Configuration.Formatters.Add(new JsonMediaTypeFormatter());

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.AppSettings()
                .Enrich.WithExceptionDetails()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .CreateLogger();
        }

        protected void Application_End()
        {
            Log.CloseAndFlush();
        }

        protected void Application_Error(Object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();
            Log.Fatal(ex, "Unhandled Exception");

            Log.CloseAndFlush();
        }
    }
}
