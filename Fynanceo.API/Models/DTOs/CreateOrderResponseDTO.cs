namespace Fynanceo.API.Models.DTOs
{
    public class CreateOrderResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int OrderId { get; set; }
        public string OrderNumber { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
