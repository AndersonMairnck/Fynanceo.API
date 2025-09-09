namespace Fynanceo.API.Models.DTOs
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string PaymentMethod { get; set; }
        public bool IsDelivery { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDTO> Items { get; set; }
        public DeliveryDTO Delivery { get; set; }
    }
}
