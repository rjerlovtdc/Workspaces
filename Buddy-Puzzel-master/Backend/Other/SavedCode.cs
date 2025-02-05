using Azure.Core;
using Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Backend.Other
{
    public class SavedCode
    {
        protected void Application_BeginRequest()
        {
            if (Request.Headers.AllKeys.Contains("Origin") && Request.HttpMethod == "OPTIONS")
            {
                Response.Flush();
            }
        }
    }
}