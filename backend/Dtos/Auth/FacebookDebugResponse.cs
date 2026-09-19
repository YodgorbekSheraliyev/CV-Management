using System.Text.Json.Serialization;

namespace backend.Dtos.Auth
{
    public class FacebookDebugResponse
    {
        [JsonPropertyName("data")]
        public FacebookDebugData? Data { get; set; }
    }

    public class FacebookDebugData
    {
        [JsonPropertyName("app_id")]
        public string? AppId { get; set; }

        [JsonPropertyName("is_valid")]
        public bool IsValid { get; set; }
    }
    public class FacebookUserResponse
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("first_name")]
        public string? FirstName { get; set; }

        [JsonPropertyName("last_name")]
        public string? LastName { get; set; }
    }

}
