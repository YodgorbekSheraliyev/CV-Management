using backend.Data;
using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddControllers().AddDataAnnotationsLocalization();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState.Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(e => e.Value!.Errors)
            .Select(e => e.ErrorMessage);

        var response = CommonResponse<string>.Fail(string.Join(" ", errors));
        return new BadRequestObjectResult(response);
    };
});
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "en", "uz" };
    options.SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);
    options.RequestCultureProviders.Insert(0, new QueryStringRequestCultureProvider
    {
        QueryStringKey = "lang",
        UIQueryStringKey = "lang"
    });
});

builder.Services.AddScoped<AuthService>();

var app = builder.Build();
app.UseRequestLocalization();

using (var scope = app.Services.CreateScope())
{
    var dataContext = scope.ServiceProvider.GetRequiredService<DataContext>();
    await dataContext.Database.MigrateAsync();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapGet("health", () => "healthy");
app.Run();
