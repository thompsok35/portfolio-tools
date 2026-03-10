using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("0d8c1c38-5346-47e5-b1e1-ec519c3a1617"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("4970fcc9-d685-445f-9082-4aeb7fe3533a"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("82d7bf0f-5709-4159-9761-3c4c67c32b0a"));

            migrationBuilder.AddColumn<string>(
                name: "EncryptedPassword",
                table: "ExpenseCategories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "ExpenseCategories",
                type: "text",
                nullable: true);

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("2624cee0-cd6e-4f44-8c81-05caa828d9c2"), null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { new Guid("a1393079-4b8e-41ca-9bf9-1de6a43b48c3"), null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { new Guid("babf7d6a-6883-487c-8863-51083236e96c"), null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("2624cee0-cd6e-4f44-8c81-05caa828d9c2"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("a1393079-4b8e-41ca-9bf9-1de6a43b48c3"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("babf7d6a-6883-487c-8863-51083236e96c"));

            migrationBuilder.DropColumn(
                name: "EncryptedPassword",
                table: "ExpenseCategories");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "ExpenseCategories");

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate" },
                values: new object[,]
                {
                    { new Guid("0d8c1c38-5346-47e5-b1e1-ec519c3a1617"), 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("4970fcc9-d685-445f-9082-4aeb7fe3533a"), 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("82d7bf0f-5709-4159-9761-3c4c67c32b0a"), 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });
        }
    }
}
