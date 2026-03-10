using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseUserName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "ExpenseCategories",
                type: "text",
                nullable: true);

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("1f9b1e53-0e72-4b98-9e15-f7c4cbd90de6"), null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("98ec69b1-ef1b-4eac-93d0-eddedeeb5f71"), null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("d910cf12-d88c-4218-8ebb-fb135115ceb9"), null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("1f9b1e53-0e72-4b98-9e15-f7c4cbd90de6"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("98ec69b1-ef1b-4eac-93d0-eddedeeb5f71"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("d910cf12-d88c-4218-8ebb-fb135115ceb9"));

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "ExpenseCategories");

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
    }
}
