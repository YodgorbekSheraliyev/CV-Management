using backend.enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Models.Attribute> Attributes { get; set; }
        public DbSet<AttributeValue> AttributeValues { get; set; }
        public DbSet<CV> CVs { get; set; }
        public DbSet<Discussion> Discussions { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<PositionAccessRule> PositionAccessRules { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Models.Attribute>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.HasIndex(x => x.Name).IsUnique();
                entity.HasData(new Models.Attribute
                {
                    Id = 1,
                    Name = "First Name",
                    Category = AttributeCategory.PersonalInformation,
                    AttributeType = AttributeType.String,
                    Description = "",
                    IsBuiltIn = true
                },
                new Models.Attribute
                {
                    Id = 2,
                    Name = "Last Name",
                    Category = AttributeCategory.PersonalInformation,
                    AttributeType = AttributeType.String,
                    Description = "",
                    IsBuiltIn = true
                },
                new Models.Attribute
                {
                    Id = 3,
                    Name = "Location",
                    Category = AttributeCategory.PersonalInformation,
                    AttributeType = AttributeType.String,
                    Description = "",
                    IsBuiltIn = true
                },
                new Models.Attribute
                {
                    Id = 4,
                    Name = "ImageUrl",
                    Category = AttributeCategory.PersonalInformation,
                    AttributeType = AttributeType.String,
                    Description = "",
                    IsBuiltIn = true
                });

                modelBuilder.Entity<Like>(entity =>
                {
                    entity.HasKey(x => x.Id);
                    entity.HasOne(x => x.Recruiter)
                    .WithMany(x => x.Likes)
                    .HasForeignKey(x => x.RecruiterId)
                    .OnDelete(DeleteBehavior.NoAction);

                    entity.HasOne(x => x.CV)
                    .WithMany(x => x.Likes)
                    .HasForeignKey(x => x.CVId)
                    .OnDelete(DeleteBehavior.Cascade);
                });

                modelBuilder.Entity<CV>(entity =>
                {
                    entity.HasKey(x => x.Id);

                    entity.HasOne(x => x.User)
                    .WithMany(u => u.CVs)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                    entity.HasOne(x => x.Position)
                    .WithMany(p => p.CVs)
                    .HasForeignKey(x => x.PositionId)
                    .OnDelete(DeleteBehavior.SetNull);
                });

            });
        }
    }
}
