// Models/Entities/Customer.cs
using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.Entities
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(15)]
        public string Phone { get; set; }

        [MaxLength(200)]
        public string Email { get; set; }

        [MaxLength(500)]
      
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }
        public string Cep { get; set; }
        public string? Complemento { get; set; }
        public string Rua { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string TipoPessoa { get; set; } // Fisica ou Juridica
        public string CpfCnpj { get; set; } // CPF ou CNPJ

        public DateTime DataNascimento { get; set; }
        // Adicione esta linha
        public DateTime? UpdatedAt { get; set; }

        // Para soft delete
        public bool IsActive { get; set; } = true;

        // Navigation property
        //public virtual ICollection<Order> Orders { get; set; }
    }
}