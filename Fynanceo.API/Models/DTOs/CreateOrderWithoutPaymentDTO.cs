using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.DTOs
{
    // DTO para criar pedido sem pagamento
    public class CreateOrderWithoutPaymentDTO
    {
        public int? CustomerId { get; set; }
        public int? TableNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderType { get; set; } = "Mesa"; // Mesa, Balcao, Delivery

        public string? Notes { get; set; }
    }
}
