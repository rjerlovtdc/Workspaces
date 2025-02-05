using Backend.Classes;
using Backend.Models;
using NdCommonLib;
using Serilog;
using System.Net;
using System.Web.Http;

namespace Backend.Controllers
{
    public class TdcController : ApiController
    {
        // GET: api/NetDesign
        public NdServerInfo GetStatus()
        {
            Log.Debug("GetStatus In");

            string serverInfoFilePath = @"C:\NetDesign\GetStatus\backend.json";
            NdServerInfo ndServerInfo = NdFileHelper.ReadFile<NdServerInfo>(serverInfoFilePath);

            ndServerInfo.StatusCode = HttpStatusCode.OK;
            ndServerInfo.HasError = false;
            ndServerInfo.Message = "TDC BUDDY Backend - Responding";

            Log.Debug("GetStatus Out");
            return ndServerInfo;
        }


        public NdResponse PostClearCache(string customerKey, NdCacheType cacheType = NdCacheType.NotSet)
        {
            NdResponse ndResponse = new NdResponse();
            if (cacheType == NdCacheType.NotSet)
            {
                ndResponse.HasError = true;
                ndResponse.ErrorText = "Cachetype must be in: [All, Users, Pictures, TdcScale]";
                return ndResponse;
            }

            string userCache = @"C:\Temp\Cache\" + customerKey;
            string tdcScaleCache = @"C:\Temp\TdcScaleCache\" + customerKey;
            string folderPath = userCache;

            switch (cacheType)
            {
                case NdCacheType.All:
                    bool deletedUsersBol = NdTools.NdDeleteDirectory(userCache);
                    bool deletedtdcScale = NdTools.NdDeleteDirectory(tdcScaleCache);

                    if (!deletedUsersBol || !deletedtdcScale)
                    {
                        ndResponse.HasError = true;
                        ndResponse.ErrorText = "Cache folders could not be deleted";
                        ndResponse.Message = userCache + " " + tdcScaleCache;
                        return ndResponse;
                    }
                    ndResponse.Message = "Cache deleted: " + userCache + " , " + tdcScaleCache;
                    return ndResponse;
                case NdCacheType.Users:
                    folderPath = userCache + "\\Users";
                    break;
                case NdCacheType.Pictures:
                    folderPath = userCache + "\\Pictures";
                    break;
                case NdCacheType.TdcScale:
                    folderPath = tdcScaleCache;
                    break;
            }


            bool deletedBol = NdTools.NdDeleteDirectory(folderPath);
            if (!deletedBol)
            {
                ndResponse.HasError = true;
                ndResponse.ErrorText = "Cache folder could not be deleted: " + folderPath;
                return ndResponse;
            }

            ndResponse.Message = "Cache folder has been deleted: " + folderPath;
            return ndResponse;
        }
    }
}
