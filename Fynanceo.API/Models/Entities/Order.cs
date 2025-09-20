// Models/Entities/Order.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fynanceo.API.Models.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string OrderNumber { get; set; }

        public int? CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        [Required]
        public int UserId { get; set; }

        public virtual User User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Aberto"; // Aberto, Fechado, Cancelado, EmPreparo, Pronto, Entregue

        [MaxLength(20)]
        public string PaymentMethod { get; set; } // Dinheiro, CartãoDebito, CartaoCredito, Pix

        public bool IsDelivery { get; set; }
        public string DeliveryType { get; set; } // Delivery, Retirada, ConsumoLocal
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Novos campos de auditoria
        public DateTime? ModifiedAt { get; set; }
       // public string? ModifiedReason { get; set; }
        public int? ModifiedByUserId { get; set; }
        // Navigation properties
        public virtual ICollection<OrderItem> OrderItems { get; set; }
        public virtual Delivery Delivery { get; set; }
    }
}