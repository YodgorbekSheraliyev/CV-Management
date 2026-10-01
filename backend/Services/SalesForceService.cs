using backend.Data;
using backend.Dtos.SalesForce;
using backend.enums;
using backend.Exceptions;
using backend.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Services;

public class SalesForceService
{
    private readonly HttpClient _httpClient;
    private readonly DataContext _context;
    private readonly IConfiguration _configuration;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public SalesForceService(
        HttpClient httpClient,
        DataContext context,
        IConfiguration configuration,
        IStringLocalizer<SharedResource> localizer)
    {
        _httpClient = httpClient;
        _context = context;
        _configuration = configuration;
        _localizer = localizer;
    }

    public async Task<SalesforceResultDto> CreateOrUpdateContactAsync(
        int userId,
        CreateSalesforceContactDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            throw new NotFoundException(_localizer["UserNotFound"]);
        }

        var firstName = await _context.AttributeValues
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.AttributeId == (int)BuiltInAttributes.FirstName);

        var lastName = await _context.AttributeValues
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.AttributeId == (int)BuiltInAttributes.LastName);

        var location = await _context.AttributeValues
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.AttributeId == (int)BuiltInAttributes.Location);

        var contact = new Dictionary<string, object?>
        {
            ["FirstName"] = firstName?.Value,
            ["LastName"] = lastName?.Value,
            ["Email"] = user.Email,
            ["Phone"] = dto.Phone,
            ["MailingCity"] = location?.Value,
            ["LinkedIn__c"] = dto.LinkedInUrl,
            ["GitHub__c"] = dto.GitHubUrl,
            ["Notes__c"] = dto.Notes
        };

        var accessToken = await GetAccessTokenAsync();

        if (string.IsNullOrWhiteSpace(user.SalesforceContactId))
        {
            var contactId = await CreateContactAsync(
                accessToken,
                contact);

            user.SalesforceContactId = contactId;

            await _context.SaveChangesAsync();

            return new SalesforceResultDto
            {
                ContactId = contactId
            };
        }

        await UpdateContactAsync(
            accessToken,
            user.SalesforceContactId,
            contact);

        return new SalesforceResultDto
        {
            ContactId = user.SalesforceContactId
        };
    }

    private async Task<string> GetAccessTokenAsync()
    {
        var clientId = _configuration["SalesForce:ClientId"];
        var clientSecret = _configuration["SalesForce:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) ||
            string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException(
                _localizer["SalesForceClientIdOrClientSecretNotConfigured"]);
        }

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/services/oauth2/token");

        request.Content = new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret
            });

        using var response = await _httpClient.SendAsync(request);

        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                _localizer["SalesforceAuthenticationFailed", content]);
        }

        var tokenResponse =
            JsonSerializer.Deserialize<SalesforceTokenResponse>(content);

        if (string.IsNullOrWhiteSpace(tokenResponse?.AccessToken))
        {
            throw new InvalidOperationException(
                _localizer["SalesforceAccessTokenNotReturned"]);
        }

        return tokenResponse.AccessToken;
    }

    private async Task<string> CreateContactAsync(
        string accessToken,
        Dictionary<string, object?> contact)
    {
        var accountId = _configuration["SalesForce:AccountId"];

        if (string.IsNullOrWhiteSpace(accountId))
        {
            throw new InvalidOperationException(
                _localizer["SalesForceAccountIdNotConfigured"]);
        }

        contact["AccountId"] = accountId;

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            GetContactUrl());

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        request.Content = new StringContent(
            JsonSerializer.Serialize(contact),
            Encoding.UTF8,
            "application/json");

        using var response = await _httpClient.SendAsync(request);

        var content = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            var result =
                JsonSerializer.Deserialize<SalesforceCreateResponse>(content);

            if (string.IsNullOrWhiteSpace(result?.Id))
            {
                throw new InvalidOperationException(
                    _localizer["SalesforceContactIdNotReturned"]);
            }

            return result.Id;
        }

        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var duplicateContactId =
                GetDuplicateContactId(content);

            if (!string.IsNullOrWhiteSpace(duplicateContactId))
            {
                await UpdateContactAsync(
                    accessToken,
                    duplicateContactId,
                    contact);

                return duplicateContactId;
            }
        }

        throw new InvalidOperationException(
            _localizer["SalesforceContactCreationFailed", content]);
    }

    private async Task UpdateContactAsync(
        string accessToken,
        string contactId,
        Dictionary<string, object?> contact)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            $"{GetContactUrl()}/{contactId}");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        request.Content = new StringContent(
            JsonSerializer.Serialize(contact),
            Encoding.UTF8,
            "application/json");

        using var response = await _httpClient.SendAsync(request);

        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                _localizer["SalesforceContactUpdateFailed", content]);
        }
    }

    private static string? GetDuplicateContactId(string content)
    {
        try
        {
            using var document = JsonDocument.Parse(content);

            if (document.RootElement.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            foreach (var error in document.RootElement.EnumerateArray())
            {
                if (!error.TryGetProperty(
                        "errorCode",
                        out var errorCode))
                {
                    continue;
                }

                if (!string.Equals(
                        errorCode.GetString(),
                        "DUPLICATES_DETECTED",
                        StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!error.TryGetProperty(
                        "duplicateResult",
                        out var duplicateResult))
                {
                    continue;
                }

                if (!duplicateResult.TryGetProperty(
                        "matchResults",
                        out var matchResults))
                {
                    continue;
                }

                foreach (var matchResult in matchResults.EnumerateArray())
                {
                    if (!matchResult.TryGetProperty(
                            "matchRecords",
                            out var matchRecords))
                    {
                        continue;
                    }

                    foreach (var matchRecord in matchRecords.EnumerateArray())
                    {
                        if (!matchRecord.TryGetProperty(
                                "record",
                                out var record))
                        {
                            continue;
                        }

                        if (!record.TryGetProperty(
                                "Id",
                                out var id))
                        {
                            continue;
                        }

                        var contactId = id.GetString();

                        if (!string.IsNullOrWhiteSpace(contactId))
                        {
                            return contactId;
                        }
                    }
                }
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }

    private string GetContactUrl()
    {
        var apiVersion = _configuration["SalesForce:ApiVersion"];

        if (string.IsNullOrWhiteSpace(apiVersion))
        {
            throw new InvalidOperationException(
                _localizer["SalesForceApiVersionNotConfigured"]);
        }

        return $"/services/data/{apiVersion}/sobjects/Contact";
    }

    private class SalesforceTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }
    }

    private class SalesforceCreateResponse
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("success")]
        public bool Success { get; set; }
    }
}
