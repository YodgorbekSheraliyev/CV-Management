using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionFullTextSearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = N'CVManagementFullText') CREATE FULLTEXT CATALOG [CVManagementFullText] AS DEFAULT;", suppressTransaction: true);
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'[Positions]')) CREATE FULLTEXT INDEX ON [Positions] ([Title] LANGUAGE 1033, [Description] LANGUAGE 1033) KEY INDEX [PK_Positions];", suppressTransaction: true);
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'[Tags]')) CREATE FULLTEXT INDEX ON [Tags] ([Name] LANGUAGE 1033) KEY INDEX [PK_Tags];", suppressTransaction: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'[Positions]')) DROP FULLTEXT INDEX ON [Positions];", suppressTransaction: true);
            migrationBuilder.Sql("IF EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'[Tags]')) DROP FULLTEXT INDEX ON [Tags];", suppressTransaction: true);
            migrationBuilder.Sql("IF EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = N'CVManagementFullText') DROP FULLTEXT CATALOG [CVManagementFullText];", suppressTransaction: true);
        }
    }
}
