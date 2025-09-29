using Fynanceo.API.Models.DTOs;

public class CreateDeliveryOrderDTO
{
    public int? CustomerId { get; set; }
    public string PaymentMethod { get; set; }
    public List<CreateOrderItemDTO> Items { get; set; }
    public DeliveryInfoDTO DeliveryInfo { get; set; }
}
