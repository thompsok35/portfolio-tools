using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddNamedIncomeSources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("06e36d8a-b16b-40f8-af69-477b29305cba"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("0bdba5ec-9ca6-4202-b8a6-9c25a479eea2"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("0dd78fe7-efc5-48c0-8b3d-54656ff3d4f6"));

            migrationBuilder.CreateTable(
                name: "NamedIncomeSources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NamedIncomeSources", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "CategoryGroup", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("4503fcd6-8a23-4425-8480-a7084548615b"), null, null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("5f88d6ec-0b50-4201-94ab-85cde40c0415"), null, null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("99d095aa-219f-48f7-988f-1a8c9dcc8802"), null, null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NamedIncomeSources");

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("4503fcd6-8a23-4425-8480-a7084548615b"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("5f88d6ec-0b50-4201-94ab-85cde40c0415"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("99d095aa-219f-48f7-988f-1a8c9dcc8802"));

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "CategoryGroup", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("06e36d8a-b16b-40f8-af69-477b29305cba"), null, null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("0bdba5ec-9ca6-4202-b8a6-9c25a479eea2"), null, null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("0dd78fe7-efc5-48c0-8b3d-54656ff3d4f6"), null, null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }
    }
}
