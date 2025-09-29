using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.DTOs
{
    // DTO para processar pagamento
    public class ProcessPaymentDTO
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; } = "Dinheiro";

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string? TransactionId { get; set; }

        public string? Notes { get; set; }
    }
}
