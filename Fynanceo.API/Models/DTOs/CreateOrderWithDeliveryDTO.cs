namespace Fynanceo.API.Models.DTOs
{
    public class CreateOrderWithDeliveryDTO : CreateOrderDTO
    {
        public DeliveryInfoDTO DeliveryInfo { get; set; }
    }
}
