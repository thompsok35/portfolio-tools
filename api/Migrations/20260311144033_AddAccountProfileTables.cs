using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountProfileTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    BankName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    AccountType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioIntegrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nickname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EncryptedApiAccessToken = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioIntegrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SharedWithEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SharedStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BankAccounts");

            migrationBuilder.DropTable(
                name: "PortfolioIntegrations");

            migrationBuilder.DropTable(
                name: "UserProfiles");

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
    }
}
