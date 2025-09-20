using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fynanceo.API.Migrations
{
    /// <inheritdoc />
    public partial class delivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "modifiedreason",
                table: "orders");

            migrationBuilder.AddColumn<string>(
                name: "deliverytype",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "customername",
                table: "deliveries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "deliveryfee",
                table: "deliveries",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "deliveries",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deliverytype",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "customername",
                table: "deliveries");

            migrationBuilder.DropColumn(
                name: "deliveryfee",
                table: "deliveries");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "deliveries");

            migrationBuilder.AddColumn<string>(
                name: "modifiedreason",
                table: "orders",
                type: "text",
                nullable: true);
        }
    }
}
