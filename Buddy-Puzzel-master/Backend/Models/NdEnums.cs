using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Backend.Models
{
    public enum NdCacheType
    {
        [Display(Name = "Not set")]
        NotSet = 0,
        [Display(Name = "User responses from Azure")]
        Users = 1,
        [Display(Name = "Photos from Azure")]
        Pictures = 2,
        [Display(Name = "TDC Scale BW")]
        TdcScale = 3,
        [Display(Name = "All caches")]
        All = 4
    }
}