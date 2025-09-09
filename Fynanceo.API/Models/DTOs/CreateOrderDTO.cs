namespace Fynanceo.API.Models.DTOs
{
    public class CreateOrderDTO
    {
        public int? CustomerId { get; set; }
        public string PaymentMethod { get; set; }
        public bool IsDelivery { get; set; }
        public List<CreateOrderItemDTO> Items { get; set; }
        public DeliveryInfoDTO DeliveryInfo { get; set; }
    }
}
