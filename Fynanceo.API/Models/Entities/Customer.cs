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
        public string Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

     

        // Adicione esta linha
        public DateTime? UpdatedAt { get; set; }

        // Para soft delete
        public bool IsActive { get; set; } = true;

        // Navigation property
        public virtual ICollection<Order> Orders { get; set; }
    }
}