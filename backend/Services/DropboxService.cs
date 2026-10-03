using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Localization;
using Microsoft.Extensions.Localization;

namespace backend.Services;

public class DropboxService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public DropboxService(
        HttpClient httpClient,
        IConfiguration configuration,
        IStringLocalizer<SharedResource> localizer)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _localizer = localizer;
    }

    public async Task UploadJsonAsync(string fileName, string json)
    {
        var accessToken = _configuration["Dropbox:AccessToken"];
        var folder = _configuration["Dropbox:Folder"] ?? "/SupportTickets";

        if (string.IsNullOrWhiteSpace(accessToken))
            throw new InvalidOperationException(_localizer["DropboxAccessTokenNotConfigured"]);

        var path = $"{folder.TrimEnd('/')}/{fileName}";
        var dropboxArguments = new
        {
            path,
            mode = "add",
            autorename = true,
            mute = false
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://content.dropboxapi.com/2/files/upload");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Add("Dropbox-API-Arg", JsonSerializer.Serialize(dropboxArguments));
        request.Content = new ByteArrayContent(Encoding.UTF8.GetBytes(json));
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(_localizer["DropboxUploadFailed", response.StatusCode, error]);
        }
    }
}