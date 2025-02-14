using Microsoft.Extensions.Caching.Memory;
using Microsoft.Identity.Client;




namespace WebUI.Core.Mvc;

public class TokenCacheHelper
{
    private static readonly MemoryCache Cache = new MemoryCache(new MemoryCacheOptions());

    public static void EnableSerialization(ITokenCache tokenCache)
    {
        tokenCache.SetBeforeAccess(BeforeAccessNotification);
        tokenCache.SetAfterAccess(AfterAccessNotification);
    }

    private static void BeforeAccessNotification(TokenCacheNotificationArgs args)
    {
        if (Cache.TryGetValue(args.SuggestedCacheKey, out byte[] tokenCacheBytes))
        {
            args.TokenCache.DeserializeMsalV3(tokenCacheBytes);
        }
    }

    private static void AfterAccessNotification(TokenCacheNotificationArgs args)
    {
        if (args.HasStateChanged)
        {
            Cache.Set(args.SuggestedCacheKey, args.TokenCache.SerializeMsalV3());
        }
    }
}