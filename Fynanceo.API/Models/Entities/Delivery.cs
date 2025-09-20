// Models/Entities/Delivery.cs
using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.Entities
{
    public class Delivery
    {
        [Key]
        public int Id { get; set; }
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        public string DeliveryPerson { get; set; }
        public string Status { get; set; } = "Pendente";
        public string DeliveryAddress { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerName { get; set; }
        public decimal DeliveryFee { get; set; }
        public string Notes { get; set; }

        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime? ActualDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}