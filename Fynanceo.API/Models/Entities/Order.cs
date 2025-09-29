// Models/Entities/Order.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fynanceo.API.Models.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderNumber { get; set; }

        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Aberto";

        [StringLength(50)]
        public string? PaymentMethod { get; set; }

        [StringLength(50)]
        public string PaymentStatus { get; set; } = "Pending"; // Novo campo

        public bool IsDelivery { get; set; }

        [StringLength(50)]
        public string? DeliveryType { get; set; }

        public int? TableNumber { get; set; } // Novo campo

        [StringLength(50)]
        public string OrderType { get; set; } = "Mesa"; // Novo campo: Mesa, Balcao, Delivery

        public string? Notes { get; set; } // Novo campo

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAt { get; set; }
        public int? ModifiedByUserId { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public Delivery? Delivery { get; set; }
        public ICollection<Payment> Payments { get; set; } = new List<Payment>(); // Novo
    }
}