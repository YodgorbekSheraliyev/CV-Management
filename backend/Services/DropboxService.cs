using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Localization;
using Microsoft.Extensions.Localization;

namespace backend.Services;

public class DropboxService
{
    private static string? _accessToken;
    private static DateTime _expiresAt;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public DropboxService(HttpClient httpClient, IConfiguration configuration, IStringLocalizer<SharedResource> localizer)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _localizer = localizer;
    }

    public async Task UploadJsonAsync(string fileName, string json)
    {
        var response = await SendUploadAsync(await GetAccessTokenAsync(), fileName, json);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            response.Dispose();
            response = await SendUploadAsync(await GetAccessTokenAsync(forceRefresh: true), fileName, json);
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException(_localizer["DropboxUploadFailed", response.StatusCode, error]);
            }
        }
    }

    private async Task<HttpResponseMessage> SendUploadAsync(string accessToken, string fileName, string json)
    {
        var folder = _configuration["Dropbox:Folder"] ?? "/SupportTickets";

        var arguments = new
        {
            path = $"{folder.TrimEnd('/')}/{fileName}",
            mode = "add",
            autorename = true,
            mute = false
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://content.dropboxapi.com/2/files/upload");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Add("Dropbox-API-Arg", JsonSerializer.Serialize(arguments));
        request.Content = new ByteArrayContent(Encoding.UTF8.GetBytes(json));
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

        return await _httpClient.SendAsync(request);
    }

    private async Task<string> GetAccessTokenAsync(bool forceRefresh = false)
    {
        if (!forceRefresh && _accessToken != null && DateTime.UtcNow < _expiresAt)
            return _accessToken;

        var appKey = _configuration["Dropbox:AppKey"];
        var appSecret = _configuration["Dropbox:AppSecret"];
        var refreshToken = _configuration["Dropbox:RefreshToken"];

        if (string.IsNullOrWhiteSpace(appKey))
            throw new InvalidOperationException(_localizer["DropboxAppKeyNotConfigured"]);
        if (string.IsNullOrWhiteSpace(appSecret))
            throw new InvalidOperationException(_localizer["DropboxAppSecretNotConfigured"]);
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new InvalidOperationException(_localizer["DropboxRefreshTokenNotConfigured"]);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.dropboxapi.com/oauth2/token")
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = refreshToken,
                ["client_id"] = appKey,
                ["client_secret"] = appSecret
            })
        };

        using var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(_localizer["DropboxTokenRequestFailed", response.StatusCode, content]);

        var token = JsonSerializer.Deserialize<DropboxTokenResponse>(content);

        if (token == null || string.IsNullOrWhiteSpace(token.AccessToken))
            throw new InvalidOperationException(_localizer["DropboxAccessTokenNotReturned"]);

        _accessToken = token.AccessToken;
        _expiresAt = DateTime.UtcNow.AddSeconds(token.ExpiresIn - 60);

        return _accessToken;
    }

    private sealed class DropboxTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}