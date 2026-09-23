using backend.enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(DataContext context)
        {
            await context.Database.MigrateAsync();

            await SeedTagsAsync(context);
            await SeedUsersAsync(context);
            await SeedPositionsAsync(context);
            await SeedProjectsAsync(context);
            await SeedCVsAsync(context);
            await SeedPostsAsync(context);
        }


        private static async Task SeedTagsAsync(DataContext context)
        {
            if (await context.Tags.AnyAsync()) return;

            context.Tags.AddRange(
                new Tag { Name = "C#" },
                new Tag { Name = ".NET" },
                new Tag { Name = "ASP.NET Core" },
                new Tag { Name = "React" },
                new Tag { Name = "TypeScript" },
                new Tag { Name = "SQL" },
                new Tag { Name = "Docker" },
                new Tag { Name = "Azure" },
                new Tag { Name = "Python" },
                new Tag { Name = "JavaScript" },
                new Tag { Name = "Git" },
                new Tag { Name = "Agile" },
                new Tag { Name = "Communication" },
                new Tag { Name = "Leadership" },
                new Tag { Name = "Problem Solving" }
            );

            await context.SaveChangesAsync();
        }

        private static async Task SeedUsersAsync(DataContext context)
        {
            if (await context.Users.AnyAsync()) return;

            string Hash(string pw) => BCrypt.Net.BCrypt.HashPassword(pw);

            context.Users.AddRange(
                new User
                {
                    Email = "admin@cvmanager.com",
                    Password = Hash("Admin@123"),
                    Role = UserRole.Administrator,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "System" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Administrator" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "Tashkent, UZ" }
                    }
                },
                new User
                {
                    Email = "recruiter1@cvmanager.com",
                    Password = Hash("Recruiter@123"),
                    Role = UserRole.Recruiter,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "Alice" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Johnson" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "New York, USA" }
                    }
                },
                new User
                {
                    Email = "recruiter2@cvmanager.com",
                    Password = Hash("Recruiter@123"),
                    Role = UserRole.Recruiter,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "Bob" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Smith" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "London, UK" }
                    }
                },
                new User
                {
                    Email = "candidate1@cvmanager.com",
                    Password = Hash("Candidate@123"),
                    Role = UserRole.Candidate,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "Carlos" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Martinez" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "Madrid, Spain" }
                    }
                },
                new User
                {
                    Email = "candidate2@cvmanager.com",
                    Password = Hash("Candidate@123"),
                    Role = UserRole.Candidate,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "Diana" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Lee" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "Seoul, South Korea" }
                    }
                },
                new User
                {
                    Email = "candidate3@cvmanager.com",
                    Password = Hash("Candidate@123"),
                    Role = UserRole.Candidate,
                    IsBlocked = false,
                    Version = 1,
                    AttributeValues = new List<AttributeValue>
                    {
                        new() { AttributeId = (int)BuiltInAttributes.FirstName, Value = "Yodgorbek" },
                        new() { AttributeId = (int)BuiltInAttributes.LastName,  Value = "Sheraliev" },
                        new() { AttributeId = (int)BuiltInAttributes.Location,  Value = "Tashkent, UZ" }
                    }
                }
            );

            await context.SaveChangesAsync();
        }


        private static async Task SeedPositionsAsync(DataContext context)
        {
            if (await context.Positions.AnyAsync()) return;

            var tags = await context.Tags.ToListAsync();
            var attrs = await context.Attributes.ToListAsync();

            Tag T(string name) => tags.First(t => t.Name == name);
            Models.Attribute A(int id) => attrs.First(a => a.Id == id);

            var now = DateTime.UtcNow;

            context.Positions.AddRange(
                new Position
                {
                    Title = "Full-Stack .NET Developer",
                    Description = "Develops end-to-end features using ASP.NET Core and React.",
                    MaxProjects = 5,
                    Version = 1,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Tags = new List<Tag> { T("C#"), T(".NET"), T("ASP.NET Core"), T("React"), T("TypeScript") },
                    Attributes = new List<Models.Attribute> { A(1), A(2), A(3) }
                },
                new Position
                {
                    Title = "Backend Developer",
                    Description = "Builds and maintains server-side APIs and services.",
                    MaxProjects = 4,
                    Version = 1,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Tags = new List<Tag> { T("C#"), T(".NET"), T("ASP.NET Core"), T("SQL"), T("Docker") },
                    Attributes = new List<Models.Attribute> { A(1), A(2), A(3) }
                },
                new Position
                {
                    Title = "Frontend Developer",
                    Description = "Creates responsive UIs using React and TypeScript.",
                    MaxProjects = 4,
                    Version = 1,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Tags = new List<Tag> { T("React"), T("TypeScript"), T("JavaScript"), T("Git") },
                    Attributes = new List<Models.Attribute> { A(1), A(2), A(3) }
                },
                new Position
                {
                    Title = "DevOps Engineer",
                    Description = "Manages CI/CD pipelines, Docker, and cloud infrastructure.",
                    MaxProjects = 3,
                    Version = 1,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Tags = new List<Tag> { T("Docker"), T("Azure"), T("Git"), T("Agile") },
                    Attributes = new List<Models.Attribute> { A(1), A(2), A(3) }
                }
            );

            await context.SaveChangesAsync();
        }

        private static async Task SeedProjectsAsync(DataContext context)
        {
            if (await context.Projects.AnyAsync()) return;

            var tags = await context.Tags.ToListAsync();
            var users = await context.Users.ToListAsync();

            Tag T(string name) => tags.First(t => t.Name == name);
            User U(string email) => users.First(u => u.Email == email);

            context.Projects.AddRange(
                new Project
                {
                    Name = "E-Commerce Platform",
                    Description = "Full-stack e-commerce system with microservices architecture.",
                    StartDate = new DateTime(2023, 1, 1),
                    EndDate = new DateTime(2023, 8, 1),
                    UserId = U("candidate1@cvmanager.com").Id,
                    Tags = new List<Tag> { T("C#"), T(".NET"), T("React"), T("SQL") }
                },
                new Project
                {
                    Name = "HR Dashboard",
                    Description = "Internal HR tool for managing employee records and leave tracking.",
                    StartDate = new DateTime(2023, 3, 1),
                    EndDate = new DateTime(2023, 10, 1),
                    UserId = U("candidate1@cvmanager.com").Id,
                    Tags = new List<Tag> { T("ASP.NET Core"), T("TypeScript"), T("Agile") }
                },
                new Project
                {
                    Name = "Real-Time Chat App",
                    Description = "SignalR-based chat application with rooms and file sharing.",
                    StartDate = new DateTime(2023, 6, 1),
                    EndDate = null,
                    UserId = U("candidate2@cvmanager.com").Id,
                    Tags = new List<Tag> { T("C#"), T("ASP.NET Core"), T("TypeScript") }
                },
                new Project
                {
                    Name = "Portfolio Website",
                    Description = "Personal portfolio built with React and TypeScript.",
                    StartDate = new DateTime(2022, 9, 1),
                    EndDate = new DateTime(2022, 12, 1),
                    UserId = U("candidate2@cvmanager.com").Id,
                    Tags = new List<Tag> { T("React"), T("TypeScript"), T("JavaScript") }
                },
                new Project
                {
                    Name = "Inventory Management System",
                    Description = "Desktop app for warehouse inventory tracking with barcode support.",
                    StartDate = new DateTime(2024, 1, 1),
                    EndDate = new DateTime(2024, 6, 1),
                    UserId = U("candidate3@cvmanager.com").Id,
                    Tags = new List<Tag> { T("C#"), T(".NET"), T("SQL"), T("Git") }
                },
                new Project
                {
                    Name = "CI/CD Pipeline Setup",
                    Description = "Configured GitHub Actions + Docker for automated deployment.",
                    StartDate = new DateTime(2024, 2, 1),
                    EndDate = new DateTime(2024, 4, 1),
                    UserId = U("candidate3@cvmanager.com").Id,
                    Tags = new List<Tag> { T("Docker"), T("Azure"), T("Git") }
                }
            );

            await context.SaveChangesAsync();
        }

        private static async Task SeedCVsAsync(DataContext context)
        {
            if (await context.CVs.AnyAsync()) return;

            var users = await context.Users.ToListAsync();
            var positions = await context.Positions.ToListAsync();
            var projects = await context.Projects.ToListAsync();

            User U(string email) => users.First(u => u.Email == email);
            Position P(string title) => positions.First(p => p.Title == title);
            List<int> ProjectIds(string email) =>
                projects.Where(p => p.UserId == U(email).Id).Select(p => p.Id).ToList();

            var now = DateTime.UtcNow;

            context.CVs.AddRange(
                new CV
                {
                    UserId = U("candidate1@cvmanager.com").Id,
                    PositionId = P("Full-Stack .NET Developer").Id,
                    Status = CVStatus.Published,
                    Version = 1,
                    AttributeIds = new List<int> { 1, 2, 3 },
                    ProjectIds = ProjectIds("candidate1@cvmanager.com"),
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CV
                {
                    UserId = U("candidate2@cvmanager.com").Id,
                    PositionId = P("Frontend Developer").Id,
                    Status = CVStatus.Published,
                    Version = 1,
                    AttributeIds = new List<int> { 1, 2, 3 },
                    ProjectIds = ProjectIds("candidate2@cvmanager.com"),
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CV
                {
                    UserId = U("candidate3@cvmanager.com").Id,
                    PositionId = P("Backend Developer").Id,
                    Status = CVStatus.Draft,
                    Version = 1,
                    AttributeIds = new List<int> { 1, 2, 3 },
                    ProjectIds = ProjectIds("candidate3@cvmanager.com"),
                    CreatedAt = now,
                    UpdatedAt = now
                }
            );

            await context.SaveChangesAsync();
        }

        private static async Task SeedPostsAsync(DataContext context)
        {
            if (await context.Posts.AnyAsync()) return;

            var users = await context.Users.ToListAsync();
            var positions = await context.Positions.ToListAsync();

            User U(string email) => users.First(u => u.Email == email);
            Position P(string title) => positions.First(p => p.Title == title);

            string FullName(User u)
            {
                var first = u.AttributeValues?.FirstOrDefault(v => v.AttributeId == (int)BuiltInAttributes.FirstName)?.Value ?? "";
                var last = u.AttributeValues?.FirstOrDefault(v => v.AttributeId == (int)BuiltInAttributes.LastName)?.Value ?? "";
                return $"{first} {last}".Trim();
            }

            var r1 = U("recruiter1@cvmanager.com");
            var r2 = U("recruiter2@cvmanager.com");
            var now = DateTime.UtcNow;

            context.Posts.AddRange(
                new Post
                {
                    AuthorId = r1.Id,
                    AuthorName = FullName(r1),
                    Content = "We are hiring Full-Stack .NET Developers! Strong C# and React skills required. Apply now.",
                    PositionId = P("Full-Stack .NET Developer").Id,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Post
                {
                    AuthorId = r1.Id,
                    AuthorName = FullName(r1),
                    Content = "Looking for experienced Backend Developers with ASP.NET Core and SQL expertise.",
                    PositionId = P("Backend Developer").Id,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Post
                {
                    AuthorId = r2.Id,
                    AuthorName = FullName(r2),
                    Content = "Frontend Developer opening — React + TypeScript is a must. Remote-friendly role.",
                    PositionId = P("Frontend Developer").Id,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Post
                {
                    AuthorId = r2.Id,
                    AuthorName = FullName(r2),
                    Content = "DevOps Engineer needed to scale our Azure infrastructure. Docker & CI/CD experience essential.",
                    PositionId = P("DevOps Engineer").Id,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            );

            await context.SaveChangesAsync();
        }
    }
}