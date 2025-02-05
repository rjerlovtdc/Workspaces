using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using System;
using System.Linq;
using System.Web.Http;
using System.Web.Mvc;

namespace Backend
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        private static readonly ILogger Logger = Log.ForContext<WebApiApplication>();
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

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
