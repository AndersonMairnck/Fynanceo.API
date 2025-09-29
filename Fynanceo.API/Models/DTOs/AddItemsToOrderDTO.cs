using System.ComponentModel.DataAnnotations;

namespace Fynanceo.API.Models.DTOs
{
    // DTO para adicionar itens a pedido existente
    public class AddItemsToOrderDTO
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public List<CreateOrderItemDTO> Items { get; set; } = new List<CreateOrderItemDTO>();
    }
}
