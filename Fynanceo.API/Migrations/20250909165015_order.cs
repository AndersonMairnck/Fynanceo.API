using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fynanceo.API.Migrations
{
    /// <inheritdoc />
    public partial class order : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "deactivatedat",
                table: "products",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "deactivatedbyuserid",
                table: "products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deactivatedreason",
                table: "products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "modifiedat",
                table: "products",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Aberto",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<DateTime>(
                name: "modifiedat",
                table: "orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "modifiedbyuserid",
                table: "orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "modifiedreason",
                table: "orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deactivatedat",
                table: "products");

            migrationBuilder.DropColumn(
                name: "deactivatedbyuserid",
                table: "products");

            migrationBuilder.DropColumn(
                name: "deactivatedreason",
                table: "products");

            migrationBuilder.DropColumn(
                name: "modifiedat",
                table: "products");

            migrationBuilder.DropColumn(
                name: "modifiedat",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "modifiedbyuserid",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "modifiedreason",
                table: "orders");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Aberto");
        }
    }
}
