// Models/Entities/Delivery.cs
using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.Entities
{
    public class Delivery
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [MaxLength(100)]
        public string DeliveryPerson { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pendente"; // Pendente, EmRota, Entregue, Cancelado

        [MaxLength(500)]
        public string DeliveryAddress { get; set; }

        [MaxLength(15)]
        public string CustomerPhone { get; set; }

        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime? ActualDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}