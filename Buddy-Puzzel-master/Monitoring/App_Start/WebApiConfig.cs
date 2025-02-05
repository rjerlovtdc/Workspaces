using Monitoring.Models;
using Newtonsoft.Json;
using Serilog;
using System;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Monitoring
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //Unhandled Exception
            AppDomain.CurrentDomain.UnhandledException += AppUnhandledException;

            // Cors
            var corsAttr = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(corsAttr);

            // Web API configuration and services
            config.Formatters.JsonFormatter.SerializerSettings = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore };


            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{customerId}",
                defaults: new { customerId = RouteParameter.Optional }
            );

            //Auth
            //config.Filters.Add(new BasicAuthenticationAttribute());
        }

        private static void AppUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            if (e.ExceptionObject is Exception ex)
            {
                Log.Fatal(ex, "TDC Buddy Backend crashed");

                // It's not necessary to flush if the application isn't terminating.
                if (e.IsTerminating)
                {
                    Log.CloseAndFlush();
                }
            }
        }
    }
}
