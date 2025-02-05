using Backend.Classes;
using NdCommonLib;
using Serilog;
using System.Collections.Specialized;
using System.Configuration;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    public class UserPhotoController : ApiController
    {

        // GET: api/UserPhoto/5
        public async Task<HttpResponseMessage> GetPhoto(string email, string customerKey, string orgPath = "DEFAULT")
        {
            NameValueCollection ndSet = (NameValueCollection)ConfigurationManager.GetSection("NetDesign");

            string cacheFolder = ndSet["cacheFolder"] + "\\" + customerKey;

            if (orgPath != "DEFAULT")
            {
                cacheFolder = cacheFolder + "\\" + orgPath;
            }

            string filePath = cacheFolder + "\\Pictures\\" + email.Split('@')[0] + ".jpg";

            if (!Directory.Exists(cacheFolder + "\\Pictures"))
            {
                Directory.CreateDirectory(cacheFolder + "\\Pictures");
            }

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            bool cacheFileFound = NdFileHelper.GetFile(filePath);

            if (cacheFileFound)
            {
                byte[] binaryData = File.ReadAllBytes(filePath);
                response.Content = new ByteArrayContent(binaryData);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                Log.Information("(GetPhoto) From Cache '{Email}' ", email);
            }
            else
            {
                NdGraph ndGraph = new NdGraph(customerKey, orgPath);
                MemoryStream ms = await ndGraph.GetPhotoFromEmail(email);

                if (ms != null)
                {
                    response.Content = new ByteArrayContent(ms.ToArray());
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

                    Image image = Image.FromStream(ms);
                    image.Save(filePath, ImageFormat.Jpeg);
                    Log.Information("(GetPhoto) From Graph '{Email}' ", email);
                }
                else
                {
                    response.Content = null; //new StringContent("");
                }
            }

            return response;
        }
    }
}
