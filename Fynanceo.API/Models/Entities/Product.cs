// Models/Entities/Product.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fynanceo.API.Models.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPrice { get; set; }

        public int StockQuantity { get; set; }
        public int MinStockLevel { get; set; }

        public int CategoryId { get; set; }
        public virtual Category Category { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Novos campos de auditoria
        public DateTime? ModifiedAt { get; set; }
        public DateTime? DeactivatedAt { get; set; }
        public string? DeactivatedReason { get; set; }
        public int? DeactivatedByUserId { get; set; }


    }
}