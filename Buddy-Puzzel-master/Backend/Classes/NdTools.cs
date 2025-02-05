using Backend.Models.Scale;
using Serilog;
using System;
using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using System.Xml.Serialization;

namespace Backend.Classes
{
    public class NdTools
    {
        internal static string GetJsonString<T>(T data)
        {
            JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions();
            jsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            jsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict;
            jsonSerializerOptions.WriteIndented = true;
            jsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
            JsonSerializerOptions options = jsonSerializerOptions;

            try
            {
                string contents = JsonSerializer.Serialize(data, options);
                return contents;
            }
            catch (Exception)
            {
                return "";
            }
        }

        public static ErrorInfo GetErrorInfoFromXml(string text)
        {
            ErrorInfo errorInfo = new ErrorInfo();

            try
            {
                XmlSerializer serializer = new XmlSerializer(typeof(ErrorInfo));
                using (StringReader reader = new StringReader(text))
                {
                    errorInfo = (ErrorInfo)serializer.Deserialize(reader);
                }
            }
            catch (Exception)
            {
                return errorInfo;
            }
            return errorInfo;
        }

        public static void NdCreateDirectory(string folderPath)
        {
            if (!System.IO.Directory.Exists(folderPath))
            {
                System.IO.Directory.CreateDirectory(folderPath);
            }
        }


        public static bool NdDeleteDirectory(string folderPath)
        {
            try
            {
                System.IO.Directory.Delete(folderPath, true);
            }
            catch (DirectoryNotFoundException)
            {
                Log.Warning("(NdDeleteDirectory) DirectoryNotFound: {FolderPath}", folderPath);
                return true;
            }
            catch (Exception exception)
            {
                Log.Error(exception, "(NdDeleteDirectory) Error deleting folder: '{FolderPath}'", folderPath);
                return false;
            }

            return true;
        }
    }
}