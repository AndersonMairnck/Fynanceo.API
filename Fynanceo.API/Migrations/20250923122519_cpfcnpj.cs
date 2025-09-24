using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fynanceo.API.Migrations
{
    /// <inheritdoc />
    public partial class cpfcnpj : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cpfcnpj",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "tipopessoa",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cpfcnpj",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "tipopessoa",
                table: "customers");
        }
    }
}
