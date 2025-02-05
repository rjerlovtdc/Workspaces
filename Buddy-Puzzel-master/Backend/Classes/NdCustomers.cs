using System.Collections.Generic;

namespace Backend.Classes
{
    public static class NdCustomers
    {
        public static Dictionary<string, Dictionary<string, string>> ExtendedAttributes = new Dictionary<string, Dictionary<string, string>>()
        {
            { "4054040", //NetDesign
                new Dictionary<string, string>() {
                    { "DEFAULT","extension_adb1a8367fbe467da1940784be191685_division" }
                }
            },
            { "454014", //ITF
                new Dictionary<string, string>() {
                    { "Allerød","" },
                    { "Ballerup","" },
                    { "Egedal","extension_c55a9e274003458882ffa9c6549eb9af_division" },
                    { "Fredensborg","" },
                    { "Furesø","" },
                    { "454014_IT_Forsyningen","extension_a58d543096d14d9c9b2e68592c652b23_division" }
                }
            }
        };
    }
}