namespace Fynanceo.API.Models.DTOs
{
    //DTOs para criação de pedidos
    public class CreateOrderDTO
    {
        public int? CustomerId { get; set; }
        public string PaymentMethod { get; set; }
        public string DeliveryType { get; set; } // Adicionar esta linha
        public List<CreateOrderItemDTO> Items { get; set; }
    }
}
