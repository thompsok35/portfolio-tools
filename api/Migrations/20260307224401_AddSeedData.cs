using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AppConfigCategories",
                columns: new[] { "Id", "Group", "Value" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "IncomeType", "Dividend" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "IncomeType", "Option Premium" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "IncomeType", "Rental" }
                });

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "IsFixed", "Name", "PlannedAmount" },
                values: new object[,]
                {
                    { new Guid("39678fc6-247e-4d8e-a8c4-17006991d2cb"), true, "Healthcare", 350.00m },
                    { new Guid("cabfb774-06d6-48ab-863d-869bf88e8926"), false, "Groceries", 400.00m },
                    { new Guid("f96fc57c-e976-4779-9824-c4f2ad561634"), true, "Rent/Mortgage", 1500.00m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppConfigCategories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "AppConfigCategories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "AppConfigCategories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("39678fc6-247e-4d8e-a8c4-17006991d2cb"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("cabfb774-06d6-48ab-863d-869bf88e8926"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("f96fc57c-e976-4779-9824-c4f2ad561634"));
        }
    }
}
