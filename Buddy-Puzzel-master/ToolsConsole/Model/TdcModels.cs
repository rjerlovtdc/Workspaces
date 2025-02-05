using CsvHelper.Configuration.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ToolsConsole
{
    internal class PuzzelUser
    {
        [Index(0)]
        public string External_catalog_ID { get; set; } = "";

        [Index(1)]
        public string First_name { get; set; } = "";

        [Index(2)]
        public string Last_name { get; set; } = "";

        [Index(3)]
        public string Title { get; set; } = "";

        [Index(4)]
        public string Department { get; set; } = "";

        [Index(5)]
        public string Email { get; set; } = "";

        [Index(6)]
        public string Phone { get; set; } = "";

        [Index(7)]
        public string Mobile_phone { get; set; } = "";

        [Index(8)]
        public string Fax { get; set; } = "";

        [Index(9)]
        public string Description { get; set; } = "";

        [Index(10)]
        public string Services { get; set; } = "";
    }
}