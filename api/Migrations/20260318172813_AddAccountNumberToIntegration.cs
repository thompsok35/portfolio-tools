using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountNumberToIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("180c7b7e-83dc-49e8-9e52-8f1051e12623"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("5105ee8f-e697-4d37-a77c-d9e2fbe2ca45"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("cce42e5a-03d6-4179-a7a8-98b319cf3069"));

            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "PortfolioIntegrations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "CategoryGroup", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("081a5306-bf62-4952-b224-de9438454510"), null, null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("83637753-900e-40fa-8cc9-62c1a82adfb8"), null, null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("ac1b5f43-1831-410b-8f96-bad727b9c0ef"), null, null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("081a5306-bf62-4952-b224-de9438454510"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("83637753-900e-40fa-8cc9-62c1a82adfb8"));

            migrationBuilder.DeleteData(
                table: "ExpenseCategories",
                keyColumn: "Id",
                keyValue: new Guid("ac1b5f43-1831-410b-8f96-bad727b9c0ef"));

            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "PortfolioIntegrations");

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "CategoryGroup", "EncryptedPassword", "Frequency", "IsFixed", "Name", "PlanId", "PlannedAmount", "TargetDate", "UserName", "WebsiteUrl" },
                values: new object[,]
                {
                    { new Guid("180c7b7e-83dc-49e8-9e52-8f1051e12623"), null, null, 0, true, "Rent/Mortgage", new Guid("00000000-0000-0000-0000-000000000000"), 1500.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("5105ee8f-e697-4d37-a77c-d9e2fbe2ca45"), null, null, 0, true, "Healthcare", new Guid("00000000-0000-0000-0000-000000000000"), 350.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null },
                    { new Guid("cce42e5a-03d6-4179-a7a8-98b319cf3069"), null, null, 0, false, "Groceries", new Guid("00000000-0000-0000-0000-000000000000"), 400.00m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null }
                });
        }
    }
}
