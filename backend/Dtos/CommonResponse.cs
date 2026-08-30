namespace backend.Dtos
{
    public class CommonResponse<T>
    {
        public bool Success { get; private set; }
        public T? Data { get; private set; }
        public string? Error { get; private set; }
        public static CommonResponse<T> Ok(T data) => new() { Success = true, Data = data };
        public static CommonResponse<T> Fail(string error) => new() { Success = false, Error = error };

    }
}
