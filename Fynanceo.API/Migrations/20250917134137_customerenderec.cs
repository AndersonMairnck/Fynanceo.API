using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fynanceo.API.Migrations
{
    /// <inheritdoc />
    public partial class customerenderec : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "address",
                table: "customers",
                newName: "bairro");

            migrationBuilder.AddColumn<string>(
                name: "cep",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "cidade",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "complemento",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "estado",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "rua",
                table: "customers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cep",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "cidade",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "complemento",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "estado",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "rua",
                table: "customers");

            migrationBuilder.RenameColumn(
                name: "bairro",
                table: "customers",
                newName: "address");
        }
    }
}
