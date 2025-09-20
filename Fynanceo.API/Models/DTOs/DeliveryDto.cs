namespace Fynanceo.API.Models.DTOs
{
    // DTO para entregas (se necessário)
    public class DeliveryDTO
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string OrderNumber { get; set; }
        public string CustomerName { get; set; }
        public string CustomerAddress { get; set; }
        public string CustomerPhone { get; set; }
        public string DeliveryPerson { get; set; }
        public string Status { get; set; }
        public string DeliveryAddress { get; set; }
        public decimal DeliveryFee { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime? ActualDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal OrderAmount { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; }

    }
}
