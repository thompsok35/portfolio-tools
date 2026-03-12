using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountNameToBankAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("1d89b0a4-fdf3-4d92-a0e2-6290d745e7cf"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("49eb28c7-a9d1-4752-9142-a7ad802d04c3"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("f595543d-2a7c-4844-b327-3079dce2b9db"));

            migrationBuilder.AddColumn<string>(
                name: "AccountName",
                table: "BankAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "AccountName",
                table: "BankAccounts");

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("1d89b0a4-fdf3-4d92-a0e2-6290d745e7cf"), null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("49eb28c7-a9d1-4752-9142-a7ad802d04c3"), null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("f595543d-2a7c-4844-b327-3079dce2b9db"), null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }
    }
}
