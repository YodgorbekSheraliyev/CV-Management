using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttribute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attributes_Positions_PositionId",
                table: "Attributes");

            migrationBuilder.DropIndex(
                name: "IX_Attributes_PositionId",
                table: "Attributes");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "Attributes");

            migrationBuilder.CreateTable(
                name: "AttributePosition",
                columns: table => new
                {
                    AttributesId = table.Column<int>(type: "int", nullable: false),
                    PositionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributePosition", x => new { x.AttributesId, x.PositionsId });
                    table.ForeignKey(
                        name: "FK_AttributePosition_Attributes_AttributesId",
                        column: x => x.AttributesId,
                        principalTable: "Attributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttributePosition_Positions_PositionsId",
                        column: x => x.PositionsId,
                        principalTable: "Positions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttributePosition_PositionsId",
                table: "AttributePosition",
                column: "PositionsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttributePosition");

            migrationBuilder.AddColumn<int>(
                name: "PositionId",
                table: "Attributes",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Attributes",
                keyColumn: "Id",
                keyValue: 1,
                column: "PositionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Attributes",
                keyColumn: "Id",
                keyValue: 2,
                column: "PositionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Attributes",
                keyColumn: "Id",
                keyValue: 3,
                column: "PositionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Attributes",
                keyColumn: "Id",
                keyValue: 4,
                column: "PositionId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Attributes_PositionId",
                table: "Attributes",
                column: "PositionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attributes_Positions_PositionId",
                table: "Attributes",
                column: "PositionId",
                principalTable: "Positions",
                principalColumn: "Id");
        }
    }
}
