using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanShares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("5b1f77ad-a9f5-4cf8-ba75-7d099813ea7e"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("91e22a68-cace-48f3-9967-3b6b348f16a4"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("f00b2b0e-e1c1-4d05-ac3c-eaf7b62831fe"));

            migrationBuilder.DropColumn(
                name: "SharedStatus",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "SharedWithEmail",
                table: "UserProfiles");

            migrationBuilder.CreateTable(
                name: "PlanShares",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    SharedWithEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanShares", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("2041a7cd-1fb4-414d-81cb-62d9ae1a882e"), null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("6b3c2c29-c28a-4338-8e8e-54e318b19f5f"), null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("ed2a0b9f-68d3-4bf6-afc5-864729bfdbe0"), null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanShares");

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("2041a7cd-1fb4-414d-81cb-62d9ae1a882e"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("6b3c2c29-c28a-4338-8e8e-54e318b19f5f"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("ed2a0b9f-68d3-4bf6-afc5-864729bfdbe0"));

            migrationBuilder.AddColumn<string>(
                name: "SharedStatus",
                table: "UserProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SharedWithEmail",
                table: "UserProfiles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("5b1f77ad-a9f5-4cf8-ba75-7d099813ea7e"), null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("91e22a68-cace-48f3-9967-3b6b348f16a4"), null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("f00b2b0e-e1c1-4d05-ac3c-eaf7b62831fe"), null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }
    }
}
