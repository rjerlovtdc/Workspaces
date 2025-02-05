using Backend.Classes;
using NdCommonLib;
using System;
using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Scale = Backend.Models.Scale;
using Backend.Models.Scale;
using RestSharp;
using System.Xml;
using System.IO;
using System.Net;

namespace Backend.Controllers
{
    public class ScaleController : ApiController
    {
        public async Task<NdScalePresence> GetAllPresence(string phoneNumber, string customerKey, string orgPath = "DEFAULT")
        {
            ErrorInfo errorInfo = new ErrorInfo();

            NdScalePresence ndScalePresence = new Scale.NdScalePresence()
            {
                TimeRequested = DateTime.Now,
                HasError = true
            };

            NdScaleUserCached scaleUserToCache = new NdScaleUserCached()
            {
                number = phoneNumber,
                lastUpdated = DateTime.Now
            };

            if (String.IsNullOrEmpty(phoneNumber) || String.IsNullOrEmpty(customerKey) || String.IsNullOrEmpty(orgPath))
            {
                ndScalePresence.ErrorText = "CustomerKey and Phonenumber must be specified";
                return ndScalePresence;
            }

            ndScalePresence.customerKey = customerKey;
            ndScalePresence.orgPath = orgPath;
            ndScalePresence.number = phoneNumber;

            string number = (phoneNumber.Length == 8) ? "+45" + phoneNumber : phoneNumber;

            string secretPath = "C:\\NetDesign\\Secrets\\" + customerKey + "\\";
            string scalePath = "C:\\NetDesign\\Scale\\" + customerKey + "\\";
            string cachePath = "C:\\Temp\\TdcScaleCache\\" + customerKey + "\\";

            if (orgPath != "DEFAULT")
            {
                secretPath = secretPath + "\\" + orgPath + "\\";
                scalePath = scalePath + "\\" + orgPath + "\\";
                cachePath = cachePath + "\\" + orgPath + "\\";
            }

            NdTools.NdCreateDirectory(secretPath);
            NdTools.NdCreateDirectory(scalePath);
            NdTools.NdCreateDirectory(cachePath);

            string secretFile = secretPath + "Scale.ndenc";
            string userCacheFile = scalePath + phoneNumber + ".json";
            string userId = "";


            /* Check Secret */
            NdScaleAdmin ndScaleAdmin = NdFileHelper.ReadFileEncrypted<NdScaleAdmin>(secretFile);

            if (ndScaleAdmin == null)
            {
                ndScalePresence.ErrorText = "Scale xsi konfiguration not found";
                return ndScalePresence;
            }

            NdScale ndScale = new NdScale(customerKey, ndScaleAdmin, cachePath);


            /* Check Cache */
            bool cacheValid = NdFileHelper.GetFile(userCacheFile);
            NdScaleUserCached userFromCache = NdFileHelper.ReadFile<NdScaleUserCached>(userCacheFile);

            if (userFromCache != null && cacheValid)
            {
                if (userFromCache.userId == "NotFound")
                {
                    ndScalePresence.ErrorText = "NotFound";
                    return ndScalePresence;
                }
                else
                {
                    userId = userFromCache.userId;
                }
            }
            else
            {
                RestResponse<Scale.Profile> ndScaleProfile = await NdScale.GetScaleProfile(number);

                if (ndScaleProfile.StatusCode == HttpStatusCode.Unauthorized)
                {
                    ndScalePresence.ErrorText = "Unauthorized";
                    return ndScalePresence;
                }

                if (ndScaleProfile.StatusCode == HttpStatusCode.NotFound)
                {
                    errorInfo = NdTools.GetErrorInfoFromXml(ndScaleProfile.Content);
                    if (errorInfo.errorCode == (ushort)NdScaleErrorCode.UserNotFound)
                    {
                        scaleUserToCache.userId = "NotFound";
                        NdFileHelper.WriteFile<NdScaleUserCached>(userCacheFile, scaleUserToCache);
                    }

                    ndScalePresence.ErrorText = "NotFound";
                    return ndScalePresence;
                }

                if (!ndScaleProfile.IsSuccessful)
                {
                    ndScalePresence.ErrorText = "Unsuccessful";
                    return ndScalePresence;
                }

                /* User ID */
                userId = ndScaleProfile.Data.details.userId;
                ndScalePresence.userId = userId;
                scaleUserToCache.userId = userId;
            }

            ndScalePresence.HasError = false;

            /* HookStatus */
            RestResponse<HookStatus> hookStatus = await NdScale.GetHookStatus(userId);
            if (hookStatus.IsSuccessful)
            {
                ndScalePresence.hookStatus = hookStatus.Data.hookStatus;
            }

            /* CFA */
            RestResponse<CallForwardingAlways> callForwardingAlways = await NdScale.GetForwardAll(userId);
            if (callForwardingAlways.IsSuccessful)
            {
                ndScalePresence.cfaActive = callForwardingAlways.Data.active;
                ndScalePresence.cfaPhoneNumber = callForwardingAlways.Data.forwardToPhoneNumber;
            }

            /* DND */
            RestResponse<DoNotDisturb> dndStatus = await NdScale.GetDNDStatus(userId);
            if (dndStatus.IsSuccessful)
            {
                ndScalePresence.dndActive = dndStatus.Data.active;
            }

            /* Personal Assistant */
            if (userFromCache == null || userFromCache.pfaLicense)
            {
                RestResponse<PersonalAssistant> paStatus = await NdScale.GetPAStatus(userId);

                if (paStatus.IsSuccessful)
                {
                    ndScalePresence.paPresence = paStatus.Data.presence;
                    scaleUserToCache.pfaLicense = true;
                }
                else if (paStatus.StatusCode == HttpStatusCode.BadRequest)
                {
                    errorInfo = NdTools.GetErrorInfoFromXml(paStatus.Content);
                    if (errorInfo.errorCode == (ushort)NdScaleErrorCode.NoLicense)
                    {
                        scaleUserToCache.pfaLicense = false;
                    }
                }
            }

            /* Update cache file if expired */
            if (!cacheValid)
            {
                NdFileHelper.WriteFile<NdScaleUserCached>(userCacheFile, scaleUserToCache);
            }
            
            return ndScalePresence;
        }
    }
}
