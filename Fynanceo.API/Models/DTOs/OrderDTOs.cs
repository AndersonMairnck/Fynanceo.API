namespace Fynanceo.API.Models.DTOs
{
    // DTOs para criação de pedidos
    public class CreateOrderDTO
    {
        public int? CustomerId { get; set; }
        public string PaymentMethod { get; set; }
        public string DeliveryType { get; set; } // Adicionar esta linha
        public List<CreateOrderItemDTO> Items { get; set; }
    }

    public class CreateOrderWithDeliveryDTO : CreateOrderDTO
    {
        public DeliveryInfoDTO DeliveryInfo { get; set; }
    }

   

    public class CreateOrderItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    // DTOs para retorno de dados
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
        public string DeliveryType { get;  set; }
    }

    public class OrderItemDTO
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class UpdateOrderStatusDTO
    {
        public string Status { get; set; }
    }

    
}